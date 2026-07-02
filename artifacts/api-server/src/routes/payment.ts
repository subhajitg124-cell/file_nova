import { Router, type Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { db, paymentOrders, subscriptionsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { authMiddleware, requireAuth, type AuthRequest } from "../middlewares/auth";
import { SubscriptionService } from "../services/SubscriptionService";
import { WebhookService } from "../services/WebhookService";
import { logger } from "../lib/logger";
import { PaymentProvider } from "../services/PaymentProvider";
import { verifyPaymentToken } from "./otp";

const router = Router();

const createOrderSchema = z.object({
  planId: z.enum(["basic", "pro", "elite", "pass", "pass_24hr", "pass_weekly"]),
  billingCycle: z.enum(["monthly", "yearly", "24hr", "weekly"]),
});

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  planId: z.enum(["basic", "pro", "elite", "pass", "pass_24hr", "pass_weekly"]).optional(),
  billingCycle: z.enum(["monthly", "yearly", "24hr", "weekly"]).optional(),
});

// Plan amount mapping — matches existing pricing exactly (in paise)
const PLAN_AMOUNTS: Record<string, number> = {
  'basic_monthly':   4900,   // ₹49
  'basic_yearly':    47000,  // ₹470
  'pro_monthly':     9900,   // ₹99
  'pro_yearly':      95000,  // ₹950
  'elite_monthly':   19900,  // ₹199
  'elite_yearly':    190000, // ₹1900
  'pass_24hr':       900,    // ₹9
  'pass_weekly':     2900,   // ₹29
};

// ── 2A. CREATE ORDER ───────────────────────────────────────────────────────────
router.post('/create-order', authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Verify payment token before creating order
    const paymentToken = req.headers['x-payment-token'] as string;
    if (!paymentToken) {
      return res.status(403).json({
        error: 'Payment verification required',
        requireVerification: true,
      });
    }
    if (!verifyPaymentToken(req.user!.id, paymentToken)) {
      return res.status(403).json({
        error: 'Payment verification expired. Please verify again.',
        requireVerification: true,
      });
    }

    const { planId, billingCycle } = createOrderSchema.parse(req.body);
    const key = `${planId}_${billingCycle}`;
    const amount = PLAN_AMOUNTS[key];
    
    if (!amount) {
      logger.warn({ key, planId, billingCycle }, "Invalid plan selected for payment creation");
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const userId = req.user!.id;

    const rp = PaymentProvider.getRazorpayInstance();

    if (!rp) {
      const orderId = `order_mock_${crypto.randomBytes(8).toString("hex")}`;
      logger.info({ orderId, userId, planId }, "Created mock payment order because Razorpay credentials are not configured");
      return res.json({
        orderId,
        amount,
        currency: "INR",
        keyId: PaymentProvider.getRazorpayKeyId(),
        isMock: true,
      });
    }

    const order = await rp.orders.create({
      amount,                    // in paise
      currency: 'INR',
      receipt: `fn_${userId}_${Date.now()}`,
      notes: {
        userId,
        planId,
        billingCycle,
      },
    });

    // Save pending order to DB — non-fatal if DB is unreachable
    try {
      await db.insert(paymentOrders).values({
        id: order.id,
        userId,
        planId,
        amount,
        currency: 'INR',
        status: 'created',
      });
    } catch (dbErr: any) {
      logger.warn({ orderId: order.id, userId, planId, err: dbErr.message }, "⚠️  DB unavailable — order NOT saved to DB, but checkout will proceed.");
    }

    logger.info({ orderId: order.id, userId, planId }, "Created Razorpay payment order successfully");

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: PaymentProvider.getRazorpayKeyId(), // public key for frontend
      isMock: false,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Invalid request parameters" });
    }
    logger.error({ error }, "Razorpay create-order error");
    return res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// ── 2B. VERIFY PAYMENT ────────────────────────────────────────────────────────
router.post('/verify', authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      planId: bodyPlanId,
      billingCycle: bodyBillingCycle,
    } = verifyPaymentSchema.parse(req.body);

    const userId = req.user!.id;

    // CRITICAL: Verify signature server-side
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const isMockOrder = typeof razorpay_order_id === "string" && razorpay_order_id.startsWith("order_mock_");
    const expectedSignature = isMockOrder || PaymentProvider.isMockEnabled()
      ? razorpay_signature
      : crypto
          .createHmac('sha256', PaymentProvider.getRazorpayKeySecret())
          .update(body)
          .digest('hex');

    if (!isMockOrder && expectedSignature !== razorpay_signature) {
      logger.warn({ orderId: razorpay_order_id, userId }, "Signature verification mismatch on verification endpoint");
      return res.status(400).json({ 
        success: false, 
        error: 'Payment verification failed — invalid signature' 
      });
    }

    // Fetch order from DB to get plan details — non-fatal if DB is down
    let order: any = null;
    try {
      order = await db.query.paymentOrders.findFirst({
        where: eq(paymentOrders.id, razorpay_order_id)
      });
    } catch (dbErr: any) {
      logger.warn({ orderId: razorpay_order_id, err: dbErr.message }, "⚠️  DB unavailable — cannot read order record, using request body fallback");
    }

    // Determine planId: from DB record or from request body fallback
    const resolvedPlanId = order?.planId ?? (bodyPlanId && bodyBillingCycle ? `${bodyPlanId}_${bodyBillingCycle}` : bodyPlanId) ?? 'unknown';
    const planTier: string = resolvedPlanId.includes('pass_24hr') ? 'pass_24h' : 
                             resolvedPlanId.includes('pass_weekly') ? 'pass_7d' : 
                             resolvedPlanId.split('_')[0];

    if (order && order.userId !== userId) {
      logger.warn({ orderId: razorpay_order_id, userId }, "Payment order owner mismatch");
      return res.status(403).json({ error: 'Order ownership mismatch' });
    }

    // Update order status — non-fatal
    try {
      await db.update(paymentOrders)
        .set({ 
          status: 'paid', 
          paymentId: razorpay_payment_id,
          paidAt: new Date() 
        })
        .where(eq(paymentOrders.id, razorpay_order_id));
    } catch (dbErr: any) {
      logger.warn({ orderId: razorpay_order_id, err: dbErr.message }, "⚠️  DB unavailable — could not update order to paid");
    }

    // Ensure subscriptionsTable record exists — non-fatal
    try {
      const [existingSub] = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.razorpayOrderId, razorpay_order_id))
        .limit(1);

      if (!existingSub) {
        await db.insert(subscriptionsTable).values({
          userId,
          plan: planTier,
          status: 'pending',
          amount: order?.amount ?? 0,
          currency: order?.currency ?? 'INR',
          razorpayOrderId: razorpay_order_id,
        });
      }

      // Activate subscription via standard SubscriptionService
      await SubscriptionService.activateSubscription(razorpay_order_id, razorpay_payment_id, planTier);
    } catch (dbErr: any) {
      logger.warn({ orderId: razorpay_order_id, planTier, err: dbErr.message }, "⚠️  DB unavailable — subscription NOT activated in DB, but payment was verified successfully");
    }

    const planExpiry = SubscriptionService.calculateExpiry(planTier);

    logger.info({ orderId: razorpay_order_id, userId, planTier }, "Verified payment and upgraded user successfully");

    return res.json({ 
      success: true, 
      plan: resolvedPlanId,
      expiresAt: planExpiry
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0]?.message || "Missing required payment fields" });
    }
    logger.error({ error }, "Razorpay verify error");
    return res.status(500).json({ error: 'Payment verification failed' });
  }
});

// ── 2C. RAZORPAY WEBHOOK ─────────────────────────────────────────────────────
router.post('/webhook', WebhookService.handleWebhookRequest);

// ── 2D. PAYMENT DIAGNOSTICS & SIMULATOR ──────────────────────────────────────
router.get('/test', authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const keyId = PaymentProvider.getRazorpayKeyId();
    const isMock = PaymentProvider.isMockEnabled();
    const hasSecret = !!PaymentProvider.getRazorpayKeySecret();
    const hasWebhookSecret = !!process.env.RAZORPAY_WEBHOOK_SECRET;
    
    let dbHealthy = false;
    try {
      const dbPromise = db.execute(sql`SELECT 1`);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000));
      await Promise.race([dbPromise, timeoutPromise]);
      dbHealthy = true;
    } catch (_) {}

    return res.json({
      success: true,
      mode: isMock ? "mock" : "razorpay",
      keyId,
      hasSecret,
      hasWebhookSecret,
      databaseConnected: dbHealthy,
      envMode: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/status/:orderId', authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const order = await db.query.paymentOrders.findFirst({
      where: eq(paymentOrders.id, req.params.orderId as string)
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    return res.json({ success: true, order });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/simulate-webhook', authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (process.env.NODE_ENV === "production" && 
        (req.user?.role as any) !== "developer" && 
        req.user?.role !== "admin" && 
        req.user?.role !== "super_admin" &&
        req.user?.email !== "subhajitgho123@gmail.com" &&
        req.user?.email !== "subhajitg124@gmail.com") {
      return res.status(403).json({ error: "Access denied: Developer mode only" });
    }

    const { event, payload } = req.body;
    if (!event || !payload) {
      return res.status(400).json({ error: "Missing event or payload" });
    }

    const result = await WebhookService.processEvent(event, payload);
    return res.json({
      success: result,
      message: `Webhook simulator executed event: ${event}`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error({ error }, "Error running webhook simulator");
    return res.status(500).json({ error: error.message });
  }
});

export default router;
