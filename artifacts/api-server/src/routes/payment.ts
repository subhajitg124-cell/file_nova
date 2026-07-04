import crypto from 'crypto';
import { Router, type Response } from 'express';
import { eq } from 'drizzle-orm';
import { db, users, paymentOrders, subscriptionsTable } from '@workspace/db';
import { razorpay, PLAN_AMOUNTS, getPlanExpiry } from '../lib/razorpay';
import { requireAuth, type AuthRequest } from '../middlewares/auth';
import { verifyPaymentToken } from './otp';
import { logger } from '../lib/logger';

const router = Router();

// ── CREATE ORDER ──────────────────────────────────────────────
router.post('/create-order', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { planId, billingCycle = 'monthly' } = req.body;
    const userId = req.user!.id;
    
    // Verify payment token from OTP/CAPTCHA step
    const paymentToken = req.headers['x-payment-token'] as string;
    if (!paymentToken) {
      return res.status(403).json({
        error: 'Payment verification required',
        requireVerification: true,
      });
    }

    const isValidToken = verifyPaymentToken(userId, paymentToken);
    if (!isValidToken) {
      return res.status(403).json({
        error: 'Verification expired. Please verify again.',
        requireVerification: true,
      });
    }

    const key = `${planId}_${billingCycle}`;
    const amount = PLAN_AMOUNTS[key];
    if (!amount) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `fn_${userId}_${Date.now()}`,
      notes: { userId, planId, billingCycle },
    });

    await db.insert(paymentOrders).values({
      id: order.id,
      userId: userId,
      planId,
      billingCycle,
      amount,
      currency: 'INR',
      status: 'created',
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    logger.error({ error }, 'create-order error');
    return res.status(500).json({ error: 'Failed to create order' });
  }
});

// ── VERIFY PAYMENT ────────────────────────────────────────────
router.post('/verify', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    const userId = req.user!.id;

    // Signature verification — NEVER skip this
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Payment signature verification failed',
      });
    }

    const [order] = await db
      .select()
      .from(paymentOrders)
      .where(eq(paymentOrders.id, razorpay_order_id))
      .limit(1);

    if (!order || order.userId !== userId) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Mark order paid
    await db.update(paymentOrders)
      .set({ status: 'paid', paymentId: razorpay_payment_id,
             signature: razorpay_signature, paidAt: new Date() })
      .where(eq(paymentOrders.id, razorpay_order_id));

    // Upgrade user plan
    const planExpiry = getPlanExpiry(
      `${order.planId}_${order.billingCycle}`
    );
    const planTier = order.planId === 'pass'
      ? `pass_${order.billingCycle}`
      : order.planId.split('_')[0];

    await db.update(users)
      .set({ plan: planTier, planExpiresAt: planExpiry, premiumTier: planTier, premiumEnabled: true })
      .where(eq(users.id, userId));

    // Also write to subscriptionsTable so SubscriptionService.getUserStatus finds it
    await db.insert(subscriptionsTable).values({
      userId,
      plan: planTier,
      status: 'active',
      amount: order.amount,
      currency: order.currency || 'INR',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      currentPeriodStart: new Date(),
      currentPeriodEnd: planExpiry,
    }).onConflictDoNothing({ target: subscriptionsTable.razorpayOrderId });

    return res.json({
      success: true,
      plan: planTier,
      expiresAt: planExpiry,
    });
  } catch (error) {
    logger.error({ error }, 'verify error');
    return res.status(500).json({ error: 'Verification failed' });
  }
});

// ── WEBHOOK (public — no requireAuth) ─────────────────────────
router.post(
  '/webhook',
  async (req, res) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
      if (secret) {
        const sig = req.headers['x-razorpay-signature'];
        const bodyStr = (req as any).rawBody ? (req as any).rawBody.toString('utf8') : '';
        const expected = crypto
          .createHmac('sha256', secret)
          .update(bodyStr)
          .digest('hex');
        if (sig !== expected) {
          return res.status(400).json({ error: 'Invalid signature' });
        }
      }

      const bodyStr = (req as any).rawBody ? (req as any).rawBody.toString('utf8') : '';
      const event = JSON.parse(bodyStr);

      if (event.event === 'payment.captured') {
        const payment = event.payload.payment.entity;
        const [order] = await db
          .select()
          .from(paymentOrders)
          .where(eq(paymentOrders.id, payment.order_id))
          .limit(1);

        if (order && order.status !== 'paid') {
          await db.update(paymentOrders)
            .set({ status: 'paid', paymentId: payment.id })
            .where(eq(paymentOrders.id, payment.order_id));
          const expiry = getPlanExpiry(
            `${order.planId}_${order.billingCycle}`
          );
          const planTier = order.planId === 'pass'
            ? `pass_${order.billingCycle}`
            : order.planId.split('_')[0];
          await db.update(users)
            .set({ plan: planTier, planExpiresAt: expiry, premiumTier: planTier, premiumEnabled: true })
            .where(eq(users.id, order.userId));
          // Also write to subscriptionsTable
          await db.insert(subscriptionsTable).values({
            userId: order.userId,
            plan: planTier,
            status: 'active',
            amount: order.amount,
            currency: order.currency || 'INR',
            razorpayOrderId: payment.order_id,
            razorpayPaymentId: payment.id,
            currentPeriodStart: new Date(),
            currentPeriodEnd: expiry,
          }).onConflictDoNothing({ target: subscriptionsTable.razorpayOrderId });
        }
      }

      if (event.event === 'payment.failed') {
        const orderId = event.payload.payment.entity.order_id;
        await db.update(paymentOrders)
          .set({ status: 'failed' })
          .where(eq(paymentOrders.id, orderId));
      }

      return res.json({ received: true });
    } catch (error) {
      logger.error({ error }, 'webhook error');
      return res.status(500).json({ error: 'Webhook failed' });
    }
  }
);

export default router;
