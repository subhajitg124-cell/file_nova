import { db, couponsTable, couponUsagesTable, discountCodesTable, discountCodeUsagesTable } from "@workspace/db";
import { eq, and, gte, lte } from "drizzle-orm";
import { logger } from "../lib/logger";

export interface CouponValidationResult {
  valid: boolean;
  type: "percentage" | "fixed" | "none";
  value: number; // percentage or fixed value in paise
  maxDiscount: number | null;
  message: string;
}

export class CouponService {
  public static async validateCoupon(
    couponCode: string,
    plan: string,
    userId?: string
  ): Promise<CouponValidationResult> {
    if (!couponCode) {
      return { valid: false, type: "none", value: 0, maxDiscount: null, message: "No coupon code provided" };
    }

    const code = couponCode.toUpperCase().trim();
    const now = new Date();

    // 1. Static campaign fallbacks
    const staticCoupons: Record<string, number> = {
      STUDENT20: 20,
      CYBER50: 50,
      FIRST30: 30,
      WB10: 10,
    };

    if (staticCoupons[code] !== undefined) {
      return {
        valid: true,
        type: "percentage",
        value: staticCoupons[code],
        maxDiscount: null,
        message: `🎉 Static ${staticCoupons[code]}% discount applied!`,
      };
    }

    // 2. Check discountCodesTable
    try {
      const [discountCode] = await db
        .select()
        .from(discountCodesTable)
        .where(
          and(
            eq(discountCodesTable.code, code),
            eq(discountCodesTable.isActive, true),
            lte(discountCodesTable.validFrom, now),
            gte(discountCodesTable.validUntil, now)
          )
        )
        .limit(1);

      if (discountCode) {
        const applicablePlans = discountCode.applicablePlans as string[];
        if (applicablePlans && !applicablePlans.includes(plan)) {
          return { valid: false, type: "none", value: 0, maxDiscount: null, message: "Discount code is not applicable to this plan." };
        }

        if (discountCode.usedCount >= discountCode.usageLimit) {
          return { valid: false, type: "none", value: 0, maxDiscount: null, message: "Discount code usage limit has been reached." };
        }

        if (userId) {
          const usages = await db
            .select()
            .from(discountCodeUsagesTable)
            .where(
              and(
                eq(discountCodeUsagesTable.discountCodeId, discountCode.id),
                eq(discountCodeUsagesTable.userId, userId)
              )
            );

          if (usages.length >= discountCode.perUserLimit) {
            return { valid: false, type: "none", value: 0, maxDiscount: null, message: "You have exceeded the usage limit for this discount code." };
          }
        }

        return {
          valid: true,
          type: discountCode.type as "percentage" | "fixed",
          value: discountCode.value,
          maxDiscount: discountCode.maxDiscount,
          message: discountCode.type === "percentage" 
            ? `🎉 ${discountCode.value}% discount applied!` 
            : `🎉 Flat ₹${(discountCode.value / 100).toFixed(2)} discount applied!`,
        };
      }
    } catch (err) {
      logger.error({ err }, "Error checking discountCodesTable");
    }

    // 3. Check couponsTable
    try {
      const [coupon] = await db
        .select()
        .from(couponsTable)
        .where(
          and(
            eq(couponsTable.code, code),
            eq(couponsTable.isActive, true),
            lte(couponsTable.validFrom, now),
            gte(couponsTable.validUntil, now)
          )
        )
        .limit(1);

      if (coupon) {
        const applicablePlans = coupon.applicablePlans as string[];
        if (applicablePlans && !applicablePlans.includes(plan)) {
          return { valid: false, type: "none", value: 0, maxDiscount: null, message: "Coupon code is not applicable to this plan." };
        }

        if (coupon.usedCount >= coupon.usageLimit) {
          return { valid: false, type: "none", value: 0, maxDiscount: null, message: "Coupon code usage limit has been reached." };
        }

        if (userId) {
          const usages = await db
            .select()
            .from(couponUsagesTable)
            .where(
              and(
                eq(couponUsagesTable.couponId, coupon.id),
                eq(couponUsagesTable.userId, userId)
              )
            );

          if (usages.length > 0 && coupon.usageLimit === 1) {
            return { valid: false, type: "none", value: 0, maxDiscount: null, message: "You have already used this coupon code." };
          }
        }

        const validTypes = ["percentage", "fixed"];
        if (!validTypes.includes(coupon.type)) {
          return { valid: false, type: "none", value: 0, maxDiscount: null, message: "Coupon type is not applicable for subscription discount." };
        }

        return {
          valid: true,
          type: coupon.type as "percentage" | "fixed",
          value: coupon.value,
          maxDiscount: coupon.maxDiscount,
          message: coupon.type === "percentage" 
            ? `🎉 ${coupon.value}% discount applied!` 
            : `🎉 Flat ₹${(coupon.value / 100).toFixed(2)} discount applied!`,
        };
      }
    } catch (err) {
      logger.error({ err }, "Error checking couponsTable");
    }

    return { valid: false, type: "none", value: 0, maxDiscount: null, message: "Invalid or expired coupon code." };
  }

  public static async recordUsage(
    couponCode: string,
    userId: string,
    subscriptionId: string,
    amountPaid: number,
    plan: string
  ): Promise<void> {
    const code = couponCode.toUpperCase().trim();
    const now = new Date();

    // Check discountCodesTable first
    try {
      const [discountCode] = await db
        .select()
        .from(discountCodesTable)
        .where(eq(discountCodesTable.code, code))
        .limit(1);

      if (discountCode) {
        let discountAmount = 0;
        if (discountCode.type === "percentage") {
          discountAmount = Math.round(amountPaid * (discountCode.value / 100));
          if (discountCode.maxDiscount) {
            discountAmount = Math.min(discountAmount, discountCode.maxDiscount);
          }
        } else {
          discountAmount = discountCode.value;
        }

        // Record usage
        await db.insert(discountCodeUsagesTable).values({
          discountCodeId: discountCode.id,
          userId,
          orderId: subscriptionId,
          discountAmount,
          originalAmount: amountPaid + discountAmount,
        });

        // Increment count
        await db
          .update(discountCodesTable)
          .set({ usedCount: discountCode.usedCount + 1, updatedAt: now })
          .where(eq(discountCodesTable.id, discountCode.id));

        logger.info({ code, userId }, "Recorded discount code usage successfully");
        return;
      }
    } catch (err) {
      logger.error({ err }, "Failed to record discount code usage");
    }

    // Check couponsTable
    try {
      const [coupon] = await db
        .select()
        .from(couponsTable)
        .where(eq(couponsTable.code, code))
        .limit(1);

      if (coupon) {
        let discountAmount = 0;
        if (coupon.type === "percentage") {
          discountAmount = Math.round(amountPaid * (coupon.value / 100));
          if (coupon.maxDiscount) {
            discountAmount = Math.min(discountAmount, coupon.maxDiscount);
          }
        } else {
          discountAmount = coupon.value;
        }

        // Record usage
        await db.insert(couponUsagesTable).values({
          couponId: coupon.id,
          userId,
          discountAmount,
          originalAmount: amountPaid + discountAmount,
        });

        // Increment count
        await db
          .update(couponsTable)
          .set({ usedCount: coupon.usedCount + 1, updatedAt: now })
          .where(eq(couponsTable.id, coupon.id));

        logger.info({ code, userId }, "Recorded coupon usage successfully");
        return;
      }
    } catch (err) {
      logger.error({ err }, "Failed to record coupon usage");
    }
  }
}
