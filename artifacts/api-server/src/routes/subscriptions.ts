import { Router, type Request, type Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import Razorpay from "razorpay";
import { db, usersTable, subscriptionsTable, processingJobsTable, couponsTable, couponUsagesTable } from "@workspace/db";
import { eq, desc, count, and, gte, lte, sql, inArray } from "drizzle-orm";
import { logger } from "../lib/logger";
import { adminAuth } from "../middlewares/adminAuth";
import { authMiddleware, requireAuth, type AuthRequest } from "../middlewares/auth";
import fs from "node:fs";
import path from "node:path";
import { getISTDate } from "../middlewares/limits";
import { handleUserReferrerUpgradeReward } from "../services/referralService";

const router = Router();

// Retrieve Razorpay credentials from env
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    return null;
  }
  // @ts-ignore
  return new Razorpay({ key_id, key_secret });
};

// Map plans to pricing
const PLAN_PRICES: Record<string, number> = {
  free: 0,
  basic: 4900, // ₹49.00 in paise
  pro: 9900,  // ₹99.00 in paise
  elite: 19900, // ₹199.00 in paise
};

// Helper to calculate coupon discount from database
async function getCouponDiscount(couponCode: string | undefined, plan: string, userId?: string): Promise<{ valid: boolean; discountPercentage: number; message?: string }> {
  if (!couponCode) {
    return { valid: false, discountPercentage: 0 };
  }

  const code = couponCode.toUpperCase().trim();
  const staticCoupons: Record<string, number> = {
    STUDENT20: 20,
    CYBER50: 50,
    FIRST30: 30,
    WB10: 10,
  };

  if (staticCoupons[code] !== undefined) {
    return {
      valid: true,
      discountPercentage: staticCoupons[code],
      message: `${staticCoupons[code]}% discount applied!`,
    };
  }

  try {
    // Find coupon in database
    const [coupon] = await db
      .select()
      .from(couponsTable)
      .where(
        and(
          eq(couponsTable.code, code),
          eq(couponsTable.isActive, true),
          gte(couponsTable.validFrom, new Date()),
          lte(couponsTable.validUntil, new Date())
        )
      )
      .limit(1);

    if (!coupon) {
      return { valid: false, discountPercentage: 0, message: "Invalid coupon code." };
    }

    // Check if coupon applies to this plan
    const applicablePlans = coupon.applicablePlans as ("free" | "basic" | "pro" | "elite")[] | undefined;
    if (applicablePlans && !applicablePlans.includes(plan as any)) {
      return { valid: false, discountPercentage: 0, message: "Coupon not applicable to this plan." };
    }

    // Check usage limit
    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, discountPercentage: 0, message: "Coupon usage limit reached." };
    }

    // Check if user has already used this coupon (if userId provided)
    if (userId) {
      const [existingUsage] = await db
        .select()
        .from(couponUsagesTable)
        .where(
          and(
            eq(couponUsagesTable.couponId, coupon.id),
            eq(couponUsagesTable.userId, userId)
          )
        )
        .limit(1);

      // For single-use coupons, check if user already used it
      if (existingUsage && coupon.usageLimit === 1) {
        return { valid: false, discountPercentage: 0, message: "You have already used this coupon." };
      }
    }

    // Calculate discount based on coupon type
    let discountPercentage = 0;
    let message = "";

    switch (coupon.type) {
      case "percentage":
        discountPercentage = coupon.value;
        message = `${coupon.value}% discount applied!`;
        break;
      case "fixed":
        // Fixed amount discount - we'll calculate percentage based on plan price later
        // For now, return a placeholder - the actual calculation will happen in the order endpoint
        discountPercentage = 0; // Will be calculated separately
        message = `₹${(coupon.value / 100).toFixed(2)} discount applied!`;
        break;
      case "free_uploads":
        // Free uploads coupon - not applicable for subscription discount
        return { valid: false, discountPercentage: 0, message: "This coupon is for free uploads, not subscription discount." };
      case "extended_validity":
        // Extended validity coupon - not applicable for subscription discount
        return { valid: false, discountPercentage: 0, message: "This coupon is for extended validity, not subscription discount." };
      default:
        return { valid: false, discountPercentage: 0, message: "Invalid coupon type." };
    }

    return { valid: true, discountPercentage, message };
  } catch (err) {
    logger.error({ err }, "Error validating coupon");
    return { valid: false, discountPercentage: 0, message: "Error validating coupon." };
  }
}

import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SETTINGS_FILE = path.join(__dirname, "../../../settings.json");

// Helper to read settings
function getSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
    }
  } catch (e) {
    logger.error("Failed to read settings file");
  }
  return {
    standaloneMode: false,
    editingEnabled: true,
    activeOffer: "",
    discountPercentage: 0,
    eventTheme: "none",
  };
}

// Helper to write settings
function saveSettings(settings: any) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch (e) {
    logger.error("Failed to write settings file");
  }
}

// Helper: Get or create a mock/default user to associate subscription with.
async function getOrCreateDefaultUser() {
  try {
    const existing = await db.select().from(usersTable).limit(1);
    if (existing.length > 0) {
      return existing[0];
    }
    const [newUser] = await db
      .insert(usersTable)
      .values({
        email: "subhajitghosh@filenova.in",
        name: "Subhajit Ghosh",
        role: "admin",
        premiumEnabled: false,
        premiumTier: "free",
      })
      .returning();
    return newUser;
  } catch (err) {
    logger.error({ err }, "Error getting default user, using mock fallback user");
    return {
      id: "00000000-0000-0000-0000-000000000000",
      email: "mock@filenova.in",
      name: "Mock User",
      role: "user",
      premiumEnabled: false,
      premiumTier: "free",
    };
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
    // Count jobs inside processingJobsTable
    let usersServedTodayVal = 3847;
    try {
      const [jobsCount] = await db
        .select({ value: count() })
        .from(processingJobsTable);
      if (jobsCount && jobsCount.value) {
        usersServedTodayVal += Number(jobsCount.value);
      }
    } catch (e) {
      logger.error("Failed to count jobs for usersServedToday");
    }

    const user = req.user;
    if (!user) {
      const settings = getSettings();
      const activeOffer = settings.activeOffer && settings.discountPercentage > 0 ? {
        announcement: settings.activeOffer,
        discountPercentage: settings.discountPercentage,
      } : null;
      res.json({
        success: true,
        userId: null,
        premiumTier: "free",
        premiumEnabled: false,
        activeOffer,
        usageToday: 0,
        limit: 3,
        subscription: null,
        usersServedToday: usersServedTodayVal,
      });
      return;
    }
    
    // Reset usage counter if needed
    const today = getISTDate();
    let usage = user.usageToday;
    if (user.lastUsageReset !== today) {
      usage = 0;
      try {
        await db
          .update(usersTable)
          .set({ usageToday: 0, lastUsageReset: today, updatedAt: new Date() })
          .where(eq(usersTable.id, user.id));
      } catch (err) {
        logger.error({ err }, "Failed to reset daily limits in /status");
      }
    }
    
    // Find active subscription from DB
    let activeSub = null;
    try {
      const subs = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.userId, user.id))
        .orderBy(desc(subscriptionsTable.createdAt));
      
      const foundActive = subs.find(s => s.status === "active");
      
      if (foundActive) {
        if (foundActive.currentPeriodEnd && new Date(foundActive.currentPeriodEnd) < new Date()) {
          // Expire subscription in DB
          try {
            await db
              .update(subscriptionsTable)
              .set({ status: "expired", updatedAt: new Date() })
              .where(eq(subscriptionsTable.id, foundActive.id));
            
            await db
              .update(usersTable)
              .set({
                premiumTier: "free",
                premiumEnabled: false,
                updatedAt: new Date(),
              })
              .where(eq(usersTable.id, user.id));
            
            foundActive.status = "expired";
            user.premiumTier = "free";
            user.premiumEnabled = false;
          } catch (updateErr) {
            logger.error({ err: updateErr }, "Failed to update expired subscription in DB");
          }
        }
        activeSub = foundActive;
      } else if (subs.length > 0) {
        activeSub = subs[0];
      }
    } catch (e) {
      logger.error("DB error reading subscription table, falling back to mock");
    }

    const settings = getSettings();
    const activeOffer = settings.activeOffer && settings.discountPercentage > 0 ? {
      announcement: settings.activeOffer,
      discountPercentage: settings.discountPercentage,
    } : null;

    res.json({
      success: true,
      userId: user.id,
      premiumTier: user.premiumTier || "free",
      premiumEnabled: user.premiumEnabled || false,
      activeOffer,
      usageToday: usage,
      limit: user.premiumTier === "basic" ? 20 : (user.premiumTier === "pro" || user.premiumTier === "elite" || user.premiumTier === "enterprise" || user.role === "admin" || user.role === "super_admin") ? -1 : 3,
      subscription: activeSub ? {
        plan: activeSub.plan,
        status: activeSub.status,
        expiresAt: activeSub.currentPeriodEnd,
      } : null,
      usersServedToday: usersServedTodayVal,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch subscription status" });
  }
});

// ── 2. POST /order — Create Razorpay Order ────────────────────────────────────
router.post("/order", authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { plan, coupon } = z.object({ 
      plan: z.enum(["basic", "pro", "elite"]),
      coupon: z.string().optional(),
    }).parse(req.body);

    let discountPercentage = 0;
    let fixedDiscountAmount = 0; // in paise
    let couponValidationResult = null;

    if (coupon) {
      // Get user ID from request
      const userId = req.user!.id;
      
      // Validate coupon using database-backed function
      couponValidationResult = await getCouponDiscount(coupon, plan, userId);
      
      if (couponValidationResult.valid) {
        // Fetch the coupon details to determine type and value
        const [couponDetails] = await db
          .select()
          .from(couponsTable)
          .where(eq(couponsTable.code, coupon.toUpperCase().trim()))
          .limit(1);
        
        if (couponDetails) {
          switch (couponDetails.type) {
            case "percentage":
              discountPercentage = couponDetails.value;
              break;
            case "fixed":
              fixedDiscountAmount = couponDetails.value; // already in paise
              break;
            case "free_uploads":
            case "extended_validity":
              // These coupon types don't apply to subscription discounts
              couponValidationResult = { valid: false, discountPercentage: 0, message: "This coupon type is not applicable for subscription discounts." };
              break;
          }
        }
      }
    }
    
    // Apply active offer if no coupon discount
    if ((discountPercentage === 0 && fixedDiscountAmount === 0) || !couponValidationResult?.valid) {
      const settings = getSettings();
      if (settings.activeOffer && settings.discountPercentage > 0) {
        discountPercentage = settings.discountPercentage;
      }
    }

    let amount = PLAN_PRICES[plan];
    
    // Apply percentage discount first
    if (discountPercentage > 0 && discountPercentage <= 100) {
      amount = Math.round(amount * (1 - discountPercentage / 100));
    }
    
    // Then apply fixed discount
    if (fixedDiscountAmount > 0) {
      amount = Math.max(0, amount - fixedDiscountAmount); // Ensure amount doesn't go negative
    }
    
    // Apply minimum purchase check if applicable
    if (couponValidationResult?.valid && couponValidationResult.discountPercentage > 0) {
      // For percentage coupons, check minimum purchase
      const [couponDetails] = await db
        .select()
        .from(couponsTable)
        .where(eq(couponsTable.code, coupon!.toUpperCase().trim()))
        .limit(1);
      
      if (couponDetails && couponDetails.minPurchase && amount < couponDetails.minPurchase) {
        return res.status(400).json({ 
          error: `Minimum purchase of ₹${(couponDetails.minPurchase / 100).toFixed(2)} required for this coupon` 
        });
      }
    }

    const user = req.user!;

    const rp = getRazorpayInstance();
    let orderId = `order_mock_${crypto.randomBytes(8).toString("hex")}`;
    
    if (rp) {
      try {
        const order = await rp.orders.create({
          amount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            userId: user.id,
            plan,
            coupon: coupon || "",
          },
        });
        orderId = order.id;
      } catch (err) {
        logger.error({ err }, "Razorpay order creation failed, using mock fallback order ID");
      }
    }

    // Insert pending subscription in DB
    try {
      await db.insert(subscriptionsTable).values({
        userId: user.id,
        plan,
        status: "pending",
        amount,
        currency: "INR",
        razorpayOrderId: orderId,
        couponCode: couponValidationResult?.valid ? coupon?.toUpperCase().trim() : null,
      });
    } catch (e) {
      logger.error("DB error creating subscription row");
    }

    res.json({
      success: true,
      orderId,
      amount,
      currency: "INR",
      plan,
      keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_mockkey",
      couponApplied: couponValidationResult?.valid || false,
      couponDetails: couponValidationResult ? {
        code: coupon?.toUpperCase().trim() || "",
        discountPercentage: couponValidationResult.discountPercentage,
        fixedDiscountAmount: fixedDiscountAmount,
        message: couponValidationResult.message || ""
      } : undefined
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to create order" });
  }
});

// ── 2b. POST /coupons/validate — Validate Coupon Code ──────────────────────────
router.post("/coupons/validate", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { coupon, plan } = z.object({
      coupon: z.string(),
      plan: z.enum(["basic", "pro", "elite"]),
    }).parse(req.body);

    // Get user ID from request if available
    const userId = (req as AuthRequest).user?.id;

    const result = await getCouponDiscount(coupon, plan, userId);
    
    if (result.valid) {
      res.json({
        success: true,
        valid: true,
        discountPercentage: result.discountPercentage,
        message: result.message || `${result.discountPercentage}% discount applied!`,
      });
    } else {
      res.json({
        success: true,
        valid: false,
        discountPercentage: 0,
        message: result.message || "Invalid coupon code or not applicable to this plan.",
      });
    }
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || "Invalid request body" });
  }
});

// ── 3. POST /verify — Verify Razorpay payment signature ─────────────────────────
router.post("/verify", authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const body = z.object({
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string().optional(),
      plan: z.enum(["basic", "pro", "elite"]),
    }).parse(req.body);

    const user = req.user!;
    const rp = getRazorpayInstance();
    let verified = true;

    if (rp && body.razorpay_signature) {
      const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
        .digest("hex");

      if (generated_signature !== body.razorpay_signature) {
        verified = false;
        return res.status(400).json({ success: false, error: "Payment verification failed" });
      }
    }

    if (verified) {
      // Update subscription in DB
      try {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

        // Update subscriptions table instead of inserting duplicate row
        const [updatedSubscription] = await db
          .update(subscriptionsTable)
          .set({
            status: "active",
            razorpayPaymentId: body.razorpay_payment_id,
            currentPeriodStart: new Date(),
            currentPeriodEnd: expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(subscriptionsTable.razorpayOrderId, body.razorpay_order_id))
          .returning();

        // Update user tier
        await db
          .update(usersTable)
          .set({
            premiumTier: body.plan,
            premiumEnabled: true,
            updatedAt: new Date(),
          })
          .where(eq(usersTable.id, user.id));

        // Trigger referrer upgrade rewards check
        await handleUserReferrerUpgradeReward(user.id);

        // Record coupon usage if a coupon was applied
        if (updatedSubscription.couponCode) {
          // Find the coupon
          const [coupon] = await db
            .select()
            .from(couponsTable)
            .where(eq(couponsTable.code, updatedSubscription.couponCode))
            .limit(1);

          if (coupon) {
            // Calculate discount amount
            let discountAmount = 0;
            const originalAmount = updatedSubscription.amount; // This is already the discounted amount
            
            // We need to calculate what the original amount would have been
            // For simplicity, let's get the base plan price and calculate discount
            const basePrice = PLAN_PRICES[body.plan];
            
            switch (coupon.type) {
              case "percentage":
                discountAmount = Math.round(basePrice * (coupon.value / 100));
                break;
              case "fixed":
                discountAmount = coupon.value; // already in paise
                break;
              // free_uploads and extended_validity don't apply to subscription payments
            }
            
            // Ensure we don't exceed the original amount
            discountAmount = Math.min(discountAmount, basePrice);
            
            // Record coupon usage
            await db.insert(couponUsagesTable).values({
              userId: user.id,
              couponId: coupon.id,
              discountAmount,
              originalAmount: basePrice,
            });

            // Update coupon used count
            await db
              .update(couponsTable)
              .set({
                usedCount: coupon.usedCount + 1,
                updatedAt: new Date(),
              })
              .where(eq(couponsTable.id, coupon.id));
          }
        }

      } catch (e) {
        logger.error({ err: e }, "DB error in verification handler");
      }

      res.json({
        success: true,
        plan: body.plan,
        message: `Subscription activated for plan: ${body.plan}`,
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to verify payment" });
  }
});

// ── 4. POST /cancel — Cancel Active Subscription ──────────────────────────────
router.post("/cancel", authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    try {
      // Update active subscriptions to cancelled
      await db
        .update(subscriptionsTable)
        .set({ status: "cancelled" })
        .where(eq(subscriptionsTable.userId, user.id));

      // Reset user to free tier
      await db
        .update(usersTable)
        .set({
          premiumTier: "free",
          premiumEnabled: false,
        })
        .where(eq(usersTable.id, user.id));
    } catch (e) {
      logger.error("DB error cancelling subscription");
    }

    res.json({ success: true, message: "Subscription cancelled successfully." });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to cancel subscription" });
  }
});

// ── 5. GET /admin/stats — Subscription statistics for Admin Console ────────────
router.get("/admin/stats", adminAuth, async (req: Request, res: Response) => {
  try {
    // Fetch all subscriptions from DB
    const allSubs = await db.select().from(subscriptionsTable).orderBy(desc(subscriptionsTable.createdAt));
    const activeSubs = allSubs.filter(s => s.status === "active");

    const basic = activeSubs.filter(s => s.plan === "basic").length;
    const pro = activeSubs.filter(s => s.plan === "pro").length;
    const elite = activeSubs.filter(s => s.plan === "elite").length;
    const revenueInPaise = activeSubs.reduce((sum, s) => sum + (s.amount || 0), 0);

    // Fetch recent signups with user info
    const recentSubs = allSubs.slice(0, 10);
    const recentSignups: any[] = [];
    for (const sub of recentSubs) {
      try {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, sub.userId)).limit(1);
        if (user) {
          recentSignups.push({
            name: user.name || "Anonymous",
            email: user.email,
            plan: sub.plan,
            status: sub.status,
            date: sub.createdAt,
          });
        }
      } catch (_) {}
    }

    // Fetch all registered users count
    const allUsers = await db.select().from(usersTable);

    res.json({
      success: true,
      stats: {
        totalUsers: allUsers.length,
        totalSubscribers: activeSubs.length,
        activeBasic: basic,
        activePro: pro,
        activeElite: elite,
        totalMtdRevenueInRupees: Math.round(revenueInPaise / 100),
        recentSignups,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch admin stats" });
  }
});

// ── 6. Admin Coupon Management Endpoints ────────────────────────

// GET /admin/coupons — List all coupons
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

// POST /admin/coupons — Create new coupon
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

    // Validate date range
    const validFrom = new Date(couponData.validFrom);
    const validUntil = new Date(couponData.validUntil);
    
    if (validFrom >= validUntil) {
      return res.status(400).json({ error: "Valid from date must be before valid until date" });
    }

    // Check if coupon code already exists
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
        createdBy: req.headers["x-admin-username"] ? undefined : null, // Will be set from auth header
      })
      .returning();

    res.json({ success: true, coupon: newCoupon });
  } catch (err: any) {
    if (err.code === "23505") { // Unique violation
      res.status(400).json({ error: "Coupon code already exists" });
    } else {
      res.status(500).json({ error: err.message || "Failed to create coupon" });
    }
  }
});

// PUT /admin/coupons/:id — Update coupon
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

    // Check if coupon exists
    const [existingCoupon] = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.id, couponId))
      .limit(1);

    if (!existingCoupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    // If code is being changed, check if new code already exists
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

    // Validate date range if both dates are provided
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
    if (err.code === "23505") { // Unique violation
      res.status(400).json({ error: "Coupon code already exists" });
    } else {
      res.status(500).json({ error: err.message || "Failed to update coupon" });
    }
  }
});

// DELETE /admin/coupons/:id — Delete coupon
router.delete("/admin/coupons/:id", adminAuth, async (req: Request, res: Response) => {
  try {
    const couponId = req.params.id as string;

    // Check if coupon exists
    const [existingCoupon] = await db
      .select()
      .from(couponsTable)
      .where(eq(couponsTable.id, couponId))
      .limit(1);

    if (!existingCoupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    // Delete coupon usages first (due to foreign key constraint)
    await db.delete(couponUsagesTable).where(eq(couponUsagesTable.couponId, couponId));

    // Delete coupon
    await db.delete(couponsTable).where(eq(couponsTable.id, couponId));

    res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete coupon" });
  }
});

// POST /admin/coupons/:id/toggle — Toggle coupon active status
router.post("/admin/coupons/:id/toggle", adminAuth, async (req: Request, res: Response) => {
  try {
    const couponId = req.params.id as string;

    // Check if coupon exists
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
router.post("/webhook", async (req: Request, res: Response) => {
  const signature = req.headers["x-razorpay-signature"] as string;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

  logger.info({ body: req.body }, "Received Razorpay webhook payload");

  if (secret && signature) {
    const crypto = await import("node:crypto");
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(typeof req.body === "string" ? req.body : JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature !== signature) {
      logger.error("Invalid Razorpay webhook signature");
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }
  }

  try {
    const event = req.body?.event;
    const payload = req.body?.payload;

    if (event === "order.paid" || event === "payment.captured") {
      const payment = payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;

      if (orderId) {
        const [sub] = await db
          .select()
          .from(subscriptionsTable)
          .where(eq(subscriptionsTable.razorpayOrderId, orderId))
          .limit(1);

        if (sub && sub.status !== "active") {
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);

          await db
            .update(subscriptionsTable)
            .set({
              status: "active",
              razorpayPaymentId: paymentId,
              currentPeriodStart: new Date(),
              currentPeriodEnd: expiresAt,
              updatedAt: new Date(),
            })
            .where(eq(subscriptionsTable.id, sub.id));

          await db
            .update(usersTable)
            .set({
              premiumTier: sub.plan,
              premiumEnabled: true,
              updatedAt: new Date(),
            })
            .where(eq(usersTable.id, sub.userId));

          // Trigger referrer upgrade rewards check
          await handleUserReferrerUpgradeReward(sub.userId);

          // Record coupon usage if a coupon was applied
          if (sub.couponCode) {
            // Find the coupon
            const [coupon] = await db
              .select()
              .from(couponsTable)
              .where(eq(couponsTable.code, sub.couponCode))
              .limit(1);

            if (coupon) {
              // Calculate discount amount
              let discountAmount = 0;
              const basePrice = PLAN_PRICES[sub.plan as keyof typeof PLAN_PRICES];
              
              switch (coupon.type) {
                case "percentage":
                  discountAmount = Math.round(basePrice * (coupon.value / 100));
                  break;
                case "fixed":
                  discountAmount = coupon.value; // already in paise
                  break;
                // free_uploads and extended_validity don't apply to subscription payments
              }
              
              // Ensure we don't exceed the original amount
              discountAmount = Math.min(discountAmount, basePrice);
              
              // Record coupon usage
              await db.insert(couponUsagesTable).values({
                userId: sub.userId,
                couponId: coupon.id,
                discountAmount,
                originalAmount: basePrice,
              });

              // Update coupon used count
              await db
                .update(couponsTable)
                .set({
                  usedCount: coupon.usedCount + 1,
                  updatedAt: new Date(),
                })
                .where(eq(couponsTable.id, coupon.id));
            }
          }

          logger.info({ orderId, userId: sub.userId }, "Successfully activated subscription via webhook");
        }
      }
    }
  } catch (err) {
    logger.error({ err }, "Error processing Razorpay webhook");
  }

  res.json({ status: "ok" });
});

export default router;
