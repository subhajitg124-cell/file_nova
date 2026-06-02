import { Router, type Request, type Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import Razorpay from "razorpay";
import { db, usersTable, subscriptionsTable, processingJobsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
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

// Helper to calculate coupon discount
function getCouponDiscount(couponCode: string | undefined, plan: string): number {
  if (!couponCode) return 0;
  const code = couponCode.toUpperCase().trim();
  if (code === "STUDENT20") {
    return 20; // 20% off any plan
  }
  if (code === "CYBER50" && plan === "elite") {
    return 50; // 50% off Elite plan only
  }
  if (code === "FIRST30") {
    return 30; // 30% off any plan
  }
  return 0;
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
    let usersServedTodayVal = 2847;
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
    if (coupon) {
      discountPercentage = getCouponDiscount(coupon, plan);
    }
    if (discountPercentage === 0) {
      const settings = getSettings();
      if (settings.activeOffer && settings.discountPercentage > 0) {
        discountPercentage = settings.discountPercentage;
      }
    }

    let amount = PLAN_PRICES[plan];
    if (discountPercentage > 0 && discountPercentage <= 100) {
      amount = Math.round(amount * (1 - discountPercentage / 100));
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

    const discount = getCouponDiscount(coupon, plan);
    if (discount > 0) {
      res.json({
        success: true,
        valid: true,
        discountPercentage: discount,
        message: `${discount}% discount applied!`,
      });
    } else {
      res.json({
        success: true,
        valid: false,
        discountPercentage: 0,
        message: "Invalid coupon code or not applicable to this plan.",
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
        await db
          .update(subscriptionsTable)
          .set({
            status: "active",
            razorpayPaymentId: body.razorpay_payment_id,
            currentPeriodStart: new Date(),
            currentPeriodEnd: expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(subscriptionsTable.razorpayOrderId, body.razorpay_order_id));

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

// ── 6. POST /webhook — Razorpay Webhook Verification ───────────────────────────
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
