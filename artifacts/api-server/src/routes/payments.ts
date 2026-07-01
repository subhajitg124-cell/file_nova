import { Router, type Response } from "express";
import { z } from "zod";
import { db, subscriptionsTable, upiPaymentsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { logger } from "../lib/logger";
import { authMiddleware, requireAuth, type AuthRequest } from "../middlewares/auth";
import { PaymentService } from "../services/PaymentService";
import { SubscriptionService } from "../services/SubscriptionService";
import { WebhookService } from "../services/WebhookService";
import { InvoiceService } from "../services/InvoiceService";
import { PaymentProvider } from "../services/PaymentProvider";

const router = Router();

const planSchema = z.enum(["basic", "pro", "elite", "pass_24h", "pass_7d"]);

// POST /create-order
router.post("/create-order", authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { plan, amount, coupon } = z.object({
      plan: planSchema,
      amount: z.number().int().positive(),
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
      logger.info({ userId: user.id, plan, orderId: existingPendingSub.razorpayOrderId }, "Reusing existing pending subscription order in payments router");
      return res.json({
        success: true,
        orderId: existingPendingSub.razorpayOrderId,
        amount: existingPendingSub.amount,
        currency: existingPendingSub.currency,
        plan,
        keyId: PaymentProvider.getRazorpayKeyId(),
      });
    }
    
    // Create order using central PaymentService
    const orderDetails = await PaymentService.createOrder(user.id, plan, amount, coupon);

    // Create pending subscription record using central SubscriptionService
    await SubscriptionService.createPendingSubscription(
      user.id,
      plan,
      amount,
      orderDetails.id,
      coupon
    );

    res.json({
      success: true,
      orderId: orderDetails.id,
      amount,
      currency: orderDetails.currency,
      plan,
      keyId: orderDetails.keyId,
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to create order in payments router");
    res.status(500).json({ success: false, error: err.message || "Failed to create order" });
  }
});

// POST /verify
router.post("/verify", authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const body = z.object({
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string().optional(),
      plan: planSchema,
    }).parse(req.body);

    const user = req.user!;
    
    // Verify signature using central PaymentService
    const isSignatureValid = PaymentService.verifySignature(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature || ""
    );

    if (!isSignatureValid) {
      return res.status(400).json({ success: false, error: "Payment verification signature mismatch" });
    }

    // Activate subscription using central SubscriptionService
    const activated = await SubscriptionService.activateSubscription(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.plan
    );

    if (!activated) {
      return res.status(500).json({ success: false, error: "Could not activate subscription on verification" });
    }

    res.json({
      success: true,
      plan: body.plan,
      message: `🎉 Welcome to Pro/Premium! Your account is now upgraded.`,
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to verify payment in payments router");
    res.status(500).json({ success: false, error: err.message || "Failed to verify payment" });
  }
});

// GET /history
router.get("/history", authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    // Fetch subscriptions
    const subs = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, user.id));

    // Fetch UPI payments
    let upiPayments: any[] = [];
    if (user.email) {
      upiPayments = await db
        .select()
        .from(upiPaymentsTable)
        .where(eq(upiPaymentsTable.email, user.email.toLowerCase()));
    }

    const history = [];

    // Add subscription payments
    for (const sub of subs) {
      history.push({
        id: sub.razorpayPaymentId || sub.razorpayOrderId || sub.id,
        plan: sub.plan,
        amount: sub.amount, // in paise
        status: sub.status,
        createdAt: sub.createdAt || new Date(),
      });
    }

    // Add pending UPI payments (approved ones are already converted to active subscriptions)
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

    // Sort descending by date
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

// POST /webhook (Razorpay Webhook verification endpoint)
router.post("/webhook", WebhookService.handleWebhookRequest);

// GET /invoice/:id (Fetch detailed invoice for a subscription)
router.get("/invoice/:id", authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const subId = req.params.id;
    if (typeof subId !== "string") {
      return res.status(400).json({ success: false, error: "Invalid subscription ID." });
    }
    
    // Fetch the subscription first to verify ownership
    const [sub] = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.id, subId))
      .limit(1);

    if (!sub) {
      return res.status(404).json({ success: false, error: "Subscription record not found." });
    }

    if (sub.userId !== req.user!.id) {
      return res.status(403).json({ success: false, error: "Unauthorized access to this invoice." });
    }

    const invoice = await InvoiceService.generateInvoiceForSubscription(subId);
    if (!invoice) {
      return res.status(500).json({ success: false, error: "Failed to generate invoice details." });
    }

    res.json({ success: true, invoice });
  } catch (err: any) {
    logger.error({ err, subId: req.params.id }, "Failed to fetch invoice");
    res.status(500).json({ success: false, error: err.message || "Failed to retrieve invoice." });
  }
});

export default router;
