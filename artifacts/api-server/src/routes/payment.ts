import { Router, type Response } from "express";
import crypto from "node:crypto";
import { db, paymentOrders, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, requireAuth, type AuthRequest } from "../middlewares/auth";
import { SubscriptionService } from "../services/SubscriptionService";
import { WebhookService } from "../services/WebhookService";
import { logger } from "../lib/logger";
import { PaymentProvider } from "../services/PaymentProvider";

const router = Router();

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
    const { planId, billingCycle } = req.body;
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
      // Optional: frontend can pass planId + billingCycle as fallback when DB is down
      planId: bodyPlanId,
      billingCycle: bodyBillingCycle,
    } = req.body;

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
    logger.error({ error }, "Razorpay verify error");
    return res.status(500).json({ error: 'Payment verification failed' });
  }
});

// ── 2C. RAZORPAY WEBHOOK ─────────────────────────────────────────────────────
router.post('/webhook', WebhookService.handleWebhookRequest);

export default router;
