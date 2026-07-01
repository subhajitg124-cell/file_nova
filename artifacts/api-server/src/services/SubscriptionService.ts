import { db, usersTable, subscriptionsTable, processingJobsTable } from "@workspace/db";
import { eq, desc, and, count } from "drizzle-orm";
import { logger } from "../lib/logger";
import { handleUserReferrerUpgradeReward } from "./referralService";
import { CouponService } from "./CouponService";
import { NotificationService } from "./NotificationService";

export interface SubscriptionStatus {
  userId: string | null;
  premiumTier: string;
  premiumEnabled: boolean;
  usageToday: number;
  limit: number;
  subscription: {
    plan: string;
    status: string;
    expiresAt: Date | null;
  } | null;
}

export class SubscriptionService {
  public static calculateExpiry(plan: string): Date {
    const expiresAt = new Date();
    
    if (plan.includes("24h") || plan.includes("24")) {
      expiresAt.setHours(expiresAt.getHours() + 24);
    } else if (plan.includes("7d") || plan.includes("7")) {
      expiresAt.setDate(expiresAt.getDate() + 7);
    } else if (plan.includes("yearly") || plan.includes("year")) {
      expiresAt.setDate(expiresAt.getDate() + 365);
    } else if (plan.includes("lifetime") || plan.includes("infinite")) {
      expiresAt.setDate(expiresAt.getDate() + 36500); // ~100 years
    } else {
      // Default monthly (30 days)
      expiresAt.setDate(expiresAt.getDate() + 30);
    }

    return expiresAt;
  }

  public static async createPendingSubscription(
    userId: string,
    plan: string,
    amount: number,
    orderId: string,
    couponCode?: string
  ): Promise<void> {
    try {
      await db.insert(subscriptionsTable).values({
        userId,
        plan,
        status: "pending",
        amount,
        currency: "INR",
        razorpayOrderId: orderId,
        couponCode: couponCode || null,
      });
    } catch (err) {
      logger.error({ err }, "Failed to insert pending subscription row");
      throw new Error("Database insertion for pending subscription failed");
    }
  }

  public static async activateSubscription(
    orderId: string,
    paymentId: string,
    plan: string
  ): Promise<boolean> {
    try {
      // Prevent Replay Attacks (Issue 3.5)
      if (paymentId && !paymentId.startsWith("pay_mock_")) {
        const [existingActivePayment] = await db
          .select()
          .from(subscriptionsTable)
          .where(
            and(
              eq(subscriptionsTable.razorpayPaymentId, paymentId),
              eq(subscriptionsTable.status, "active")
            )
          )
          .limit(1);

        if (existingActivePayment) {
          logger.warn({ paymentId, orderId }, "Replay attack detected: paymentId is already associated with an active subscription");
          return false;
        }
      }

      const expiresAt = this.calculateExpiry(plan);
      const now = new Date();

      // 1. Update subscription row
      const [updatedSub] = await db
        .update(subscriptionsTable)
        .set({
          status: "active",
          razorpayPaymentId: paymentId,
          currentPeriodStart: now,
          currentPeriodEnd: expiresAt,
          updatedAt: now,
        })
        .where(eq(subscriptionsTable.razorpayOrderId, orderId))
        .returning();

      if (!updatedSub) {
        logger.error({ orderId }, "Subscription order not found to activate");
        return false;
      }

      // 2. Update user profile tier
      await db
        .update(usersTable)
        .set({
          premiumTier: plan,
          premiumEnabled: true,
          updatedAt: now,
        })
        .where(eq(usersTable.id, updatedSub.userId));

      // 3. Record coupon code/discount usage if present
      if (updatedSub.couponCode) {
        try {
          await CouponService.recordUsage(updatedSub.couponCode, updatedSub.userId, updatedSub.id, updatedSub.amount, plan);
        } catch (couponErr) {
          logger.error({ couponErr }, "Failed to record coupon usage on activation");
        }
      }

      // 4. Trigger referrer upgrade check
      try {
        await handleUserReferrerUpgradeReward(updatedSub.userId);
      } catch (refErr) {
        logger.error({ refErr }, "Failed to trigger referral rewards on activation");
      }

      // 5. Send subscription upgrade notification (non-blocking)
      NotificationService.sendSubscriptionUpgrade(updatedSub.userId, plan).catch((err) =>
        logger.warn({ err }, "Failed to send subscription upgrade notification")
      );

      logger.info({ userId: updatedSub.userId, plan }, "Successfully activated subscription");
      return true;
    } catch (err) {
      logger.error({ err }, "Error activating subscription");
      return false;
    }
  }

  public static async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const now = new Date();
      
      // Update active subscriptions to cancelled status
      await db
        .update(subscriptionsTable)
        .set({ status: "cancelled", updatedAt: now })
        .where(and(eq(subscriptionsTable.userId, userId), eq(subscriptionsTable.status, "active")));

      // Revert user back to free tier
      await db
        .update(usersTable)
        .set({
          premiumTier: "free",
          premiumEnabled: false,
          updatedAt: now,
        })
        .where(eq(usersTable.id, userId));

      logger.info({ userId }, "Downgraded and cancelled subscription successfully");
      return true;
    } catch (err) {
      logger.error({ err }, "Error cancelling subscription");
      return false;
    }
  }

  public static async getUserStatus(userId: string | null): Promise<SubscriptionStatus> {
    let usersServedTodayVal = 3847;
    try {
      const [jobsCount] = await db.select({ value: count() }).from(processingJobsTable);
      if (jobsCount && jobsCount.value) {
        usersServedTodayVal += Number(jobsCount.value);
      }
    } catch (e) {
      logger.warn("Failed to count jobs in getUserStatus");
    }

    if (!userId) {
      return {
        userId: null,
        premiumTier: "free",
        premiumEnabled: false,
        usageToday: 0,
        limit: 3,
        subscription: null,
      };
    }

    // Get user details
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) {
      return {
        userId: null,
        premiumTier: "free",
        premiumEnabled: false,
        usageToday: 0,
        limit: 3,
        subscription: null,
      };
    }

    const now = new Date();
    let activeSub = null;

    try {
      const subs = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.userId, userId))
        .orderBy(desc(subscriptionsTable.createdAt));

      const foundActive = subs.find((s) => s.status === "active");

      if (foundActive) {
        if (foundActive.currentPeriodEnd && new Date(foundActive.currentPeriodEnd) < now) {
          // Expire subscription
          await db
            .update(subscriptionsTable)
            .set({ status: "expired", updatedAt: now })
            .where(eq(subscriptionsTable.id, foundActive.id));

          await db
            .update(usersTable)
            .set({
              premiumTier: "free",
              premiumEnabled: false,
              updatedAt: now,
            })
            .where(eq(usersTable.id, userId));

          user.premiumTier = "free";
          user.premiumEnabled = false;
          foundActive.status = "expired";
        }
        activeSub = foundActive;
      } else if (subs.length > 0) {
        activeSub = subs[0];
      }
    } catch (err) {
      logger.error({ err }, "DB error fetching subscriptions for user status");
    }

    const tier = user.premiumTier || "free";
    const limit = tier === "basic" ? 20 : ["pro", "elite", "enterprise"].includes(tier) || ["admin", "super_admin"].includes(user.role) ? -1 : 3;

    return {
      userId: user.id,
      premiumTier: tier,
      premiumEnabled: user.premiumEnabled || false,
      usageToday: user.usageToday || 0,
      limit,
      subscription: activeSub ? {
        plan: activeSub.plan,
        status: activeSub.status,
        expiresAt: activeSub.currentPeriodEnd,
      } : null,
    };
  }

  public static async getUsersServedCount(): Promise<number> {
    let usersServedTodayVal = 3800; // Base count
    try {
      const [usersCount] = await db.select({ value: count() }).from(usersTable);
      const [jobsCount] = await db.select({ value: count() }).from(processingJobsTable);
      
      if (usersCount && usersCount.value) {
        usersServedTodayVal += Number(usersCount.value);
      }
      if (jobsCount && jobsCount.value) {
        usersServedTodayVal += Number(jobsCount.value);
      }
    } catch (e) {
      logger.warn("Failed to count users/jobs in getUsersServedCount");
      return 3847; // fallback
    }
    return usersServedTodayVal;
  }
}
