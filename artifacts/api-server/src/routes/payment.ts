import { Router, type Response } from "express";
import crypto from "node:crypto";
import { razorpay } from "../lib/razorpay";
import { db, paymentOrders, usersTable, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, requireAuth, type AuthRequest } from "../middlewares/auth";
import { SubscriptionService } from "../services/SubscriptionService";
import { logger } from "../lib/logger";

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

    const order = await razorpay.orders.create({
      amount,                    // in paise
      currency: 'INR',
      receipt: `fn_${userId}_${Date.now()}`,
      notes: {
        userId,
        planId,
        billingCycle,
      },
    });

    // Save pending order to DB
    await db.insert(paymentOrders).values({
      id: order.id,
      userId,
      planId,
      amount,
      currency: 'INR',
      status: 'created',
    });

    logger.info({ orderId: order.id, userId, planId }, "Created Razorpay payment order successfully");

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // public key for frontend
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
      razorpay_signature 
    } = req.body;

    const userId = req.user!.id;

    // CRITICAL: Verify signature server-side
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      logger.warn({ orderId: razorpay_order_id, userId }, "Signature verification mismatch on verification endpoint");
      return res.status(400).json({ 
        success: false, 
        error: 'Payment verification failed — invalid signature' 
      });
    }

    // Fetch order from DB to get plan details
    const order = await db.query.paymentOrders.findFirst({
      where: eq(paymentOrders.id, razorpay_order_id)
    });

    if (!order || order.userId !== userId) {
      logger.warn({ orderId: razorpay_order_id, userId }, "Payment order not found or owner mismatch");
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status
    await db.update(paymentOrders)
      .set({ 
        status: 'paid', 
        paymentId: razorpay_payment_id,
        paidAt: new Date() 
      })
      .where(eq(paymentOrders.id, razorpay_order_id));

    // Map plan id to target tier
    const planTier = order.planId.includes('pass_24hr') ? 'pass_24h' : 
                     order.planId.includes('pass_weekly') ? 'pass_7d' : 
                     order.planId.split('_')[0];

    // Ensure subscriptionsTable record exists for this purchase
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
        amount: order.amount,
        currency: order.currency || 'INR',
        razorpayOrderId: razorpay_order_id,
      });
    }

    // Activate subscription via standard SubscriptionService
    await SubscriptionService.activateSubscription(razorpay_order_id, razorpay_payment_id, planTier);

    const planExpiry = SubscriptionService.calculateExpiry(planTier);

    logger.info({ orderId: razorpay_order_id, userId, planTier }, "Verified payment and upgraded user successfully");

    return res.json({ 
      success: true, 
      plan: order.planId,
      expiresAt: planExpiry
    });
  } catch (error: any) {
    logger.error({ error }, "Razorpay verify error");
    return res.status(500).json({ error: 'Payment verification failed' });
  }
});

// ── 2C. RAZORPAY WEBHOOK ─────────────────────────────────────────────────────
router.post('/webhook', async (req: any, res: Response) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (webhookSecret) {
      const signature = req.headers['x-razorpay-signature'] as string;
      const rawBody = req.rawBody || JSON.stringify(req.body);
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');
      
      if (signature !== expectedSig) {
        logger.warn("Invalid webhook signature received");
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = req.body;

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      
      if (orderId) {
        // Update payment_orders DB if not already updated via verify endpoint
        const order = await db.query.paymentOrders.findFirst({
          where: eq(paymentOrders.id, orderId)
        });
        
        if (order && order.status !== 'paid') {
          await db.update(paymentOrders)
            .set({ status: 'paid', paymentId, paidAt: new Date() })
            .where(eq(paymentOrders.id, orderId));
          
          const planTier = order.planId.includes('pass_24hr') ? 'pass_24h' : 
                           order.planId.includes('pass_weekly') ? 'pass_7d' : 
                           order.planId.split('_')[0];

          // Ensure subscriptionsTable record exists
          const [existingSub] = await db
            .select()
            .from(subscriptionsTable)
            .where(eq(subscriptionsTable.razorpayOrderId, orderId))
            .limit(1);

          if (!existingSub) {
            await db.insert(subscriptionsTable).values({
              userId: order.userId,
              plan: planTier,
              status: 'pending',
              amount: order.amount,
              currency: order.currency || 'INR',
              razorpayOrderId: orderId,
            });
          }

          // Activate using SubscriptionService
          await SubscriptionService.activateSubscription(orderId, paymentId, planTier);
          logger.info({ orderId, paymentId }, "Processed payment webhook captured successfully");
        }
      }
    }

    if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      
      if (orderId) {
        await db.update(paymentOrders)
          .set({ status: 'failed', paymentId })
          .where(eq(paymentOrders.id, orderId));

        await db.update(subscriptionsTable)
          .set({ status: 'failed', razorpayPaymentId: paymentId, updatedAt: new Date() })
          .where(eq(subscriptionsTable.razorpayOrderId, orderId));
          
        logger.info({ orderId, paymentId }, "Processed payment webhook failed");
      }
    }

    return res.json({ received: true });
  } catch (error: any) {
    logger.error({ error }, "Webhook processing failed");
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
