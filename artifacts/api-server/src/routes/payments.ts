import { Router, type NextFunction, type Request, type Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import Razorpay from "razorpay";
import { db, usersTable, subscriptionsTable, upiPaymentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { authMiddleware, requireAuth, type AuthRequest } from "../middlewares/auth";
import { handleUserReferrerUpgradeReward } from "../services/referralService";

const router = Router();

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    return null;
  }
  // @ts-ignore
  return new Razorpay({ key_id, key_secret });
};

// POST /create-order
router.post("/create-order", authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { plan, amount, coupon } = z.object({
      plan: z.enum(["basic", "pro", "elite"]),
      amount: z.number().int().positive(),
      coupon: z.string().optional(),
    }).parse(req.body);

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
        logger.error({ err }, "Razorpay order creation failed, using mock fallback order id");
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
      logger.error("DB error creating subscription row in payments router");
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

// POST /verify
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
      try {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

        // Update subscriptions table status
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
        logger.error({ err: e }, "DB error in verification handler in payments router");
      }

      res.json({
        success: true,
        plan: body.plan,
        message: `🎉 Welcome to Pro! Your account is now upgraded.`,
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to verify payment" });
  }
});

// GET /history
router.get("/history", authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    // 1. Fetch from subscriptionsTable
    const subs = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, user.id));

    // 2. Fetch from upiPaymentsTable
    let upiPayments: any[] = [];
    if (user.email) {
      upiPayments = await db
        .select()
        .from(upiPaymentsTable)
        .where(eq(upiPaymentsTable.email, user.email.toLowerCase()));
    }

    const history = [];

    // Add subscriptions
    for (const sub of subs) {
      history.push({
        id: sub.razorpayPaymentId || sub.razorpayOrderId || sub.id,
        plan: sub.plan,
        amount: sub.amount, // in paise
        status: sub.status,
        createdAt: sub.createdAt || new Date(),
      });
    }

    // Add pending UPI payments (approved ones are already in subscriptions)
    for (const upi of upiPayments) {
      if (upi.status === "pending") {
        history.push({
          id: `upi_${upi.utrId}`,
          plan: upi.plan,
          amount: upi.amount * 100, // convert rupees to paise
          status: "pending verification",
          createdAt: upi.createdAt || new Date(),
        });
      }
    }

    // Sort by date descending
    history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      history,
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to fetch payment history");
    res.status(500).json({ success: false, error: err.message || "Failed to fetch payment history" });
  }
});

export default router;
