import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db, usersTable, couponsTable, couponUsagesTable, discountCodesTable, discountCodeUsagesTable, subscriptionsTable } from "@workspace/db";
import { eq, desc, lte, gte, and } from "drizzle-orm";
import { logger } from "../lib/logger";
import { adminAuth } from "../middlewares/adminAuth";
import { authMiddleware, requireAuth, type AuthRequest } from "../middlewares/auth";
import fs from "node:fs";
import path from "node:path";
import { getISTDate } from "../middlewares/limits";
import { SubscriptionService } from "../services/SubscriptionService";
import { CouponService } from "../services/CouponService";
import { PaymentService } from "../services/PaymentService";
import { WebhookService } from "../services/WebhookService";
import { AdminPaymentService } from "../services/AdminPaymentService";
import { PaymentProvider } from "../services/PaymentProvider";

const router = Router();

// Plan pricing mapping
const PLAN_PRICES: Record<string, number> = {
  free: 0,
  basic: 4900,    // ₹49.00 in paise
  pro: 9900,      // ₹99.00 in paise
  elite: 19900,   // ₹199.00 in paise
  pass_24h: 900,  // ₹9.00 in paise
  pass_7d: 2900,  // ₹29.00 in paise
};

import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SETTINGS_FILE = path.join(__dirname, "../../../settings.json");

// Helper to read settings
function getSettings() {
  const defaults = {
    standaloneMode: false,
    editingEnabled: true,
    activeOffer: "",
    discountPercentage: 0,
    eventTheme: "none",
    libreofficeAvailableOverride: true,
    ffmpegAvailableOverride: true,
    globalNoticeActive: false,
    globalNoticeText: "",
    globalNoticeType: "info",
    popupMessageActive: false,
    popupMessageText: "",
    adType: "internal",
    alternativeAdCode: "",
    customBannerImg: "",
    customBannerLink: "",
    enableSeasonalThemes: false,
  };
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
      return { ...defaults, ...parsed };
    }
  } catch (e) {
    logger.error("Failed to read settings file");
  }
  return defaults;
}

// Helper to write settings
function saveSettings(settings: any) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch (e) {
    logger.error("Failed to write settings file");
  }
}

// ── Settings Endpoints ────────────────────────────────────────────────────────
router.get("/settings", (req: Request, res: Response) => {
  res.json({ success: true, settings: getSettings() });
});

router.post("/settings", adminAuth, (req: Request, res: Response) => {
  try {
    const settings = req.body;
    saveSettings(settings);
    res.json({ success: true, settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to save settings" });
  }
});

// ── 1. GET /status — Get current subscription status ──────────────────────────
router.get("/status", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const settings = getSettings();
    const activeOffer = settings.activeOffer && settings.discountPercentage > 0 ? {
      announcement: settings.activeOffer,
      discountPercentage: settings.discountPercentage,
    } : null;

    const usersServed = await SubscriptionService.getUsersServedCount();

    if (!user) {
      res.json({
        success: true,
        userId: null,
        premiumTier: "free",
        premiumEnabled: false,
        activeOffer,
        usageToday: 0,
        limit: 3,
        subscription: null,
        usersServedToday: usersServed,
      });
      return;
    }

    // Reset usage counter if daily threshold crossed (in IST)
    const today = getISTDate();
    if (user.lastUsageReset !== today) {
      try {
        await db
          .update(usersTable)
          .set({ usageToday: 0, lastUsageReset: today, updatedAt: new Date() })
          .where(eq(usersTable.id, user.id));
      } catch (err) {
        logger.error({ err }, "Failed to reset daily limits in /status");
      }
    }

    // Retrieve user status via SubscriptionService
    const statusDetails = await SubscriptionService.getUserStatus(user.id);

    res.json({
      success: true,
      ...statusDetails,
      activeOffer,
      usersServedToday: usersServed,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to fetch subscription status" });
  }
});

// ── 2. POST /order — Create Razorpay Order ────────────────────────────────────
router.post("/order", authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { plan, coupon } = z.object({
      plan: z.enum(["basic", "pro", "elite", "pass_24h", "pass_7d"]),
      coupon: z.string().optional(),
    }).parse(req.body);

    const user = req.user!;

    // Check if there is already a pending subscription for the same user and plan (Idempotency - Issue 3.3)
    const [existingPendingSub] = await db
      .select()
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.userId, user.id),
          eq(subscriptionsTable.plan, plan),
          eq(subscriptionsTable.status, "pending")
        )
      )
      .orderBy(desc(subscriptionsTable.createdAt))
      .limit(1);

    if (existingPendingSub && existingPendingSub.razorpayOrderId) {
      logger.info({ userId: user.id, plan, orderId: existingPendingSub.razorpayOrderId }, "Reusing existing pending subscription order");
      return res.json({
        success: true,
        orderId: existingPendingSub.razorpayOrderId,
        amount: existingPendingSub.amount,
        currency: existingPendingSub.currency,
        plan,
        keyId: PaymentProvider.getRazorpayKeyId(),
        couponApplied: !!existingPendingSub.couponCode,
        couponDetails: existingPendingSub.couponCode ? {
          code: existingPendingSub.couponCode,
          discountPercentage: 0,
          fixedDiscountAmount: 0,
          message: "Existing order reused",
        } : undefined,
      });
    }

    let discountPercentage = 0;
    let fixedDiscountAmount = 0;
    let couponValidationResult = null;

    // Validate coupon using central CouponService
    if (coupon) {
      const validation = await CouponService.validateCoupon(coupon, plan, user.id);
      if (validation.valid) {
        couponValidationResult = validation;
        if (validation.type === "percentage") {
          discountPercentage = validation.value;
        } else if (validation.type === "fixed") {
          fixedDiscountAmount = validation.value;
        }
      }
    }

    // Apply active global promo offer if no coupon code was used/valid
    if ((discountPercentage === 0 && fixedDiscountAmount === 0) || !couponValidationResult?.valid) {
      const settings = getSettings();
      if (settings.activeOffer && settings.discountPercentage > 0) {
        discountPercentage = settings.discountPercentage;
      }
    }

    let amount = PLAN_PRICES[plan];

    // Apply percentage discount
    if (discountPercentage > 0 && discountPercentage <= 100) {
      amount = Math.round(amount * (1 - discountPercentage / 100));
    }

    // Apply flat fixed discount
    if (fixedDiscountAmount > 0) {
      amount = Math.max(0, amount - fixedDiscountAmount);
    }

    // Check minimum purchase restriction
    if (coupon && couponValidationResult?.valid) {
      const [couponDetails] = await db
        .select()
        .from(couponsTable)
        .where(eq(couponsTable.code, coupon.toUpperCase().trim()))
        .limit(1);

      if (couponDetails && couponDetails.minPurchase && amount < couponDetails.minPurchase) {
        return res.status(400).json({
          success: false,
          error: `Minimum purchase of ₹${(couponDetails.minPurchase / 100).toFixed(2)} required for this coupon`,
        });
      }
    }

    // Create order using central PaymentService
    const orderDetails = await PaymentService.createOrder(
      user.id,
      plan,
      amount,
      couponValidationResult?.valid ? coupon : undefined
    );

    // Record pending subscription
    await SubscriptionService.createPendingSubscription(
      user.id,
      plan,
      amount,
      orderDetails.id,
      couponValidationResult?.valid ? coupon?.toUpperCase().trim() : undefined
    );

    res.json({
      success: true,
      orderId: orderDetails.id,
      amount,
      currency: orderDetails.currency,
      plan,
      keyId: orderDetails.keyId,
      couponApplied: couponValidationResult?.valid || false,
      couponDetails: couponValidationResult ? {
        code: coupon?.toUpperCase().trim() || "",
        discountPercentage,
        fixedDiscountAmount,
        message: couponValidationResult.message || "",
      } : undefined,
    });
  } catch (err: any) {
    logger.error({ err }, "Order creation endpoint failed");
    res.status(500).json({ success: false, error: err.message || "Failed to create order" });
  }
});

// ── 2b. POST /coupons/validate — Validate Coupon Code ──────────────────────────
router.post("/coupons/validate", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { coupon, plan } = z.object({
      coupon: z.string(),
      plan: z.enum(["basic", "pro", "elite"]),
    }).parse(req.body);

    const userId = (req as AuthRequest).user?.id;
    const result = await CouponService.validateCoupon(coupon, plan, userId);

    res.json({
      success: true,
      valid: result.valid,
      discountPercentage: result.type === "percentage" ? result.value : 0,
      message: result.message,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || "Invalid validation payload" });
  }
});

// ── 3. POST /verify — Verify Razorpay payment signature ─────────────────────────
router.post("/verify", authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const body = z.object({
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string().optional(),
      plan: z.enum(["basic", "pro", "elite", "pass_24h", "pass_7d"]),
    }).parse(req.body);

    const verified = PaymentService.verifySignature(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature || ""
    );

    if (!verified) {
      return res.status(400).json({ success: false, error: "Payment signature mismatch" });
    }

    const activated = await SubscriptionService.activateSubscription(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.plan
    );

    if (!activated) {
      return res.status(500).json({ success: false, error: "Could not activate subscription" });
    }

    res.json({
      success: true,
      plan: body.plan,
      message: `Subscription activated for plan: ${body.plan}`,
    });
  } catch (err: any) {
    logger.error({ err }, "Signature verification route failed");
    res.status(500).json({ success: false, error: err.message || "Failed to verify payment" });
  }
});

// ── 4. POST /cancel — Cancel Active Subscription ──────────────────────────────
router.post("/cancel", authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const cancelled = await SubscriptionService.cancelSubscription(user.id);
    if (cancelled) {
      res.json({ success: true, message: "Subscription cancelled successfully." });
    } else {
      res.status(500).json({ success: false, error: "Failed to cancel subscription." });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to cancel subscription" });
  }
});

// ── 5. GET /admin/stats — Subscription statistics for Admin Console ────────────
router.get("/admin/stats", adminAuth, async (req: Request, res: Response) => {
  try {
    const stats = await AdminPaymentService.getSystemAnalytics();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || "Failed to fetch admin stats" });
  }
});

// ── 6. Admin Coupon Management Endpoints ────────────────────────
router.get("/admin/coupons", adminAuth, async (req: Request, res: Response) => {
  try {
    const coupons = await db
      .select({
        id: couponsTable.id,
        code: couponsTable.code,
        type: couponsTable.type,
        value: couponsTable.value,
        minPurchase: couponsTable.minPurchase,
        maxDiscount: couponsTable.maxDiscount,
        validFrom: couponsTable.validFrom,
        validUntil: couponsTable.validUntil,
        usageLimit: couponsTable.usageLimit,
        usedCount: couponsTable.usedCount,
        applicablePlans: couponsTable.applicablePlans,
        applicableTools: couponsTable.applicableTools,
        isActive: couponsTable.isActive,
        description: couponsTable.description,
        createdAt: couponsTable.createdAt,
        updatedAt: couponsTable.updatedAt,
        createdByName: usersTable.name,
      })
      .from(couponsTable)
      .leftJoin(usersTable, eq(couponsTable.createdBy, usersTable.id))
      .orderBy(desc(couponsTable.createdAt));

    res.json({ success: true, coupons });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch coupons" });
  }
});

router.post("/admin/coupons", adminAuth, async (req: Request, res: Response) => {
  try {
    const couponData = z.object({
      code: z.string().min(3).max(20).toUpperCase(),
      type: z.enum(["percentage", "fixed", "free_uploads", "extended_validity"]),
      value: z.number().int().positive(),
      minPurchase: z.number().int().nonnegative().optional(),
      maxDiscount: z.number().int().nonnegative().optional(),
      validFrom: z.string().datetime(),
      validUntil: z.string().datetime(),
      usageLimit: z.number().int().positive(),
      applicablePlans: z.array(z.enum(["free", "basic", "pro", "elite"])).default(["free", "basic", "pro", "elite"]),
      applicableTools: z.array(z.string()).default([]),
      isActive: z.boolean().default(true),
      description: z.string().optional(),
    }).parse(req.body);

    const validFrom = new Date(couponData.validFrom);
    const validUntil = new Date(couponData.validUntil);

    if (validFrom >= validUntil) {
      return res.status(400).json({ error: "Valid from date must be before valid until date" });
    }

    const [existingCoupon] = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.code, couponData.code))
      .limit(1);

    if (existingCoupon) {
      return res.status(400).json({ error: "Coupon code already exists" });
    }

    const [newCoupon] = await db
      .insert(couponsTable)
      .values({
        ...couponData,
        validFrom,
        validUntil,
        createdBy: null,
      })
      .returning();

    res.json({ success: true, coupon: newCoupon });
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Coupon code already exists" });
    } else {
      res.status(500).json({ error: err.message || "Failed to create coupon" });
    }
  }
});

router.put("/admin/coupons/:id", adminAuth, async (req: Request, res: Response) => {
  try {
    const couponId = req.params.id as string;

    const couponData = z.object({
      code: z.string().min(3).max(20).toUpperCase().optional(),
      type: z.enum(["percentage", "fixed", "free_uploads", "extended_validity"]).optional(),
      value: z.number().int().positive().optional(),
      minPurchase: z.number().int().nonnegative().optional(),
      maxDiscount: z.number().int().nonnegative().optional(),
      validFrom: z.string().datetime().optional(),
      validUntil: z.string().datetime().optional(),
      usageLimit: z.number().int().positive().optional(),
      applicablePlans: z.array(z.enum(["free", "basic", "pro", "elite"])).optional(),
      applicableTools: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
      description: z.string().optional(),
    }).parse(req.body);

    const [existingCoupon] = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.id, couponId))
      .limit(1);

    if (!existingCoupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    if (couponData.code && couponData.code !== existingCoupon.code) {
      const [duplicateCoupon] = await db
        .select()
        .from(couponsTable)
        .where(eq(couponsTable.code, couponData.code))
        .limit(1);

      if (duplicateCoupon) {
        return res.status(400).json({ error: "Coupon code already exists" });
      }
    }

    const validFrom = couponData.validFrom ? new Date(couponData.validFrom) : existingCoupon.validFrom;
    const validUntil = couponData.validUntil ? new Date(couponData.validUntil) : existingCoupon.validUntil;

    if (validFrom >= validUntil) {
      return res.status(400).json({ error: "Valid from date must be before valid until date" });
    }

    const [updatedCoupon] = await db
      .update(couponsTable)
      .set({
        ...couponData,
        validFrom: couponData.validFrom ? new Date(couponData.validFrom) : undefined,
        validUntil: couponData.validUntil ? new Date(couponData.validUntil) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(couponsTable.id, couponId))
      .returning();

    res.json({ success: true, coupon: updatedCoupon });
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Coupon code already exists" });
    } else {
      res.status(500).json({ error: err.message || "Failed to update coupon" });
    }
  }
});

router.delete("/admin/coupons/:id", adminAuth, async (req: Request, res: Response) => {
  try {
    const couponId = req.params.id as string;

    const [existingCoupon] = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.id, couponId))
      .limit(1);

    if (!existingCoupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    await db.delete(couponUsagesTable).where(eq(couponUsagesTable.couponId, couponId));
    await db.delete(couponsTable).where(eq(couponsTable.id, couponId));

    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete coupon" });
  }
});

router.post("/admin/coupons/:id/toggle", adminAuth, async (req: Request, res: Response) => {
  try {
    const couponId = req.params.id as string;

    const [existingCoupon] = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.id, couponId))
      .limit(1);

    if (!existingCoupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    const [updatedCoupon] = await db
      .update(couponsTable)
      .set({
        isActive: !existingCoupon.isActive,
        updatedAt: new Date(),
      })
      .where(eq(couponsTable.id, couponId))
      .returning();

    res.json({ success: true, coupon: updatedCoupon });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to toggle coupon" });
  }
});

// ── 7. POST /webhook — Razorpay Webhook Verification ───────────────────────────
router.post("/webhook", WebhookService.handleWebhookRequest);

// ── Discount Code Endpoints ────────────────────────────────────────────────────
router.get("/admin/discount-codes", adminAuth, async (_req: Request, res: Response) => {
  try {
    const codes = await db
      .select({
        id: discountCodesTable.id,
        code: discountCodesTable.code,
        type: discountCodesTable.type,
        value: discountCodesTable.value,
        maxDiscount: discountCodesTable.maxDiscount,
        validFrom: discountCodesTable.validFrom,
        validUntil: discountCodesTable.validUntil,
        usageLimit: discountCodesTable.usageLimit,
        usedCount: discountCodesTable.usedCount,
        perUserLimit: discountCodesTable.perUserLimit,
        applicablePlans: discountCodesTable.applicablePlans,
        isActive: discountCodesTable.isActive,
        description: discountCodesTable.description,
        createdAt: discountCodesTable.createdAt,
        updatedAt: discountCodesTable.updatedAt,
        createdByName: usersTable.name,
      })
      .from(discountCodesTable)
      .leftJoin(usersTable, eq(discountCodesTable.createdBy, usersTable.id))
      .orderBy(desc(discountCodesTable.createdAt));

    res.json({ success: true, codes });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch discount codes" });
  }
});

router.post("/admin/discount-codes", adminAuth, async (req: Request, res: Response) => {
  try {
    const data = z.object({
      code: z.string().min(3).max(30).toUpperCase(),
      type: z.enum(["percentage", "fixed"]).default("percentage"),
      value: z.number().int().positive(),
      maxDiscount: z.number().int().nonnegative().optional(),
      validFrom: z.string().datetime(),
      validUntil: z.string().datetime(),
      usageLimit: z.number().int().positive().default(1),
      perUserLimit: z.number().int().positive().default(1),
      applicablePlans: z.array(z.enum(["free", "basic", "pro", "elite"])).default(["basic", "pro", "elite"]),
      description: z.string().optional(),
    }).parse(req.body);

    const validFrom = new Date(data.validFrom);
    const validUntil = new Date(data.validUntil);

    if (validFrom >= validUntil) {
      return res.status(400).json({ error: "validFrom must be before validUntil" });
    }

    const [existing] = await db
      .select({ id: discountCodesTable.id })
      .from(discountCodesTable)
      .where(eq(discountCodesTable.code, data.code))
      .limit(1);

    if (existing) {
      return res.status(400).json({ error: "Discount code already exists" });
    }

    const [newCode] = await db
      .insert(discountCodesTable)
      .values({
        ...data,
        validFrom,
        validUntil,
      })
      .returning();

    res.json({ success: true, code: newCode });
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Discount code already exists" });
    } else {
      res.status(500).json({ error: err.message || "Failed to create discount code" });
    }
  }
});

router.patch("/admin/discount-codes/:id", adminAuth, async (req: Request, res: Response) => {
  try {
    const codeId = req.params.id as string;
    const data = z.object({
      code: z.string().min(3).max(30).toUpperCase().optional(),
      type: z.enum(["percentage", "fixed"]).optional(),
      value: z.number().int().positive().optional(),
      maxDiscount: z.number().int().nonnegative().nullable().optional(),
      validFrom: z.string().datetime().optional(),
      validUntil: z.string().datetime().optional(),
      usageLimit: z.number().int().positive().optional(),
      perUserLimit: z.number().int().positive().optional(),
      applicablePlans: z.array(z.enum(["free", "basic", "pro", "elite"])).optional(),
      isActive: z.boolean().optional(),
      description: z.string().nullable().optional(),
    }).parse(req.body);

    if (data.validFrom && data.validUntil) {
      if (new Date(data.validFrom) >= new Date(data.validUntil)) {
        return res.status(400).json({ error: "validFrom must be before validUntil" });
      }
    }

    const [existing] = await db
      .select({ id: discountCodesTable.id })
      .from(discountCodesTable)
      .where(eq(discountCodesTable.id, codeId))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "Discount code not found" });
    }

    const [updated] = await db
      .update(discountCodesTable)
      .set({
        ...data,
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(discountCodesTable.id, codeId))
      .returning();

    res.json({ success: true, code: updated });
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(400).json({ error: "Discount code already exists" });
    } else {
      res.status(500).json({ error: err.message || "Failed to update discount code" });
    }
  }
});

router.post("/admin/discount-codes/:id/toggle", adminAuth, async (req: Request, res: Response) => {
  try {
    const codeId = req.params.id as string;
    const [existing] = await db
      .select()
      .from(discountCodesTable)
      .where(eq(discountCodesTable.id, codeId))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "Discount code not found" });
    }

    const [updated] = await db
      .update(discountCodesTable)
      .set({ isActive: !existing.isActive, updatedAt: new Date() })
      .where(eq(discountCodesTable.id, codeId))
      .returning();

    res.json({ success: true, code: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to toggle discount code" });
  }
});

router.delete("/admin/discount-codes/:id", adminAuth, async (req: Request, res: Response) => {
  try {
    const codeId = req.params.id as string;
    const [existing] = await db
      .select({ id: discountCodesTable.id })
      .from(discountCodesTable)
      .where(eq(discountCodesTable.id, codeId))
      .limit(1);

    if (!existing) {
      return res.status(404).json({ error: "Discount code not found" });
    }

    await db.delete(discountCodesTable).where(eq(discountCodesTable.id, codeId));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete discount code" });
  }
});

// POST /validate-discount-code — Validate discount code publicly
router.post("/validate-discount-code", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user!;
    const data = z.object({
      code: z.string().min(1),
      plan: z.enum(["free", "basic", "pro", "elite"]),
    }).parse(req.body);

    const result = await CouponService.validateCoupon(data.code, data.plan, user.id);

    if (!result.valid) {
      return res.json({ valid: false, message: result.message });
    }

    res.json({
      valid: true,
      discountPercentage: result.type === "percentage" ? result.value : 0,
      discountType: result.type,
      discountValue: result.value,
      maxDiscount: result.maxDiscount,
      message: result.message,
    });
  } catch (err: any) {
    res.status(500).json({ valid: false, message: err.message || "Failed to validate discount code" });
  }
});

export default router;
