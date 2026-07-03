import type { Request, Response } from "express";
import type { AuthRequest } from "../../middlewares/auth";
import { db, usersTable, subscriptionsTable, paymentOrders } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { logger } from "../../lib/logger";
import { PaymentService } from "../PaymentService";
import { SubscriptionService } from "../SubscriptionService";
import { InvoiceService } from "../InvoiceService";
import { getPlanAmount, resolveTier } from "./types";

export class PaymentController {
  static async createOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { planId, billingCycle } = req.body;

      if (!planId || !billingCycle) {
        res.status(400).json({ error: "Missing planId or billingCycle" });
        return;
      }

      const amount = getPlanAmount(planId, billingCycle);
      const plan = resolveTier(planId);
      const order = await PaymentService.createOrder(userId, planId, amount);

      await db.insert(paymentOrders).values({
        id: order.orderId,
        userId,
        planId: `${planId}_${billingCycle}`,
        amount,
        currency: order.currency,
        status: "created",
      });

      await SubscriptionService.createPendingSubscription(userId, plan, amount, order.orderId);

      res.json({
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        keyId: order.keyId,
        isMock: order.isMock,
      });
    } catch (err: any) {
      logger.error({ err }, "Order creation failed");
      res.status(500).json({ error: err.message || "Order creation failed" });
    }
  }

  static async verifyPayment(req: AuthRequest, res: Response) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, billingCycle } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400).json({ error: "Missing payment verification fields" });
        return;
      }

      const valid = await PaymentService.verifyPayment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        planId,
        billingCycle,
      });
      if (!valid) {
        res.status(400).json({ success: false, error: "Payment signature verification failed" });
        return;
      }

      const resolvedPlan = resolveTier(planId || "basic");
      const activated = await SubscriptionService.activateSubscription(
        razorpay_order_id,
        razorpay_payment_id,
        resolvedPlan
      );

      if (!activated) {
        res.status(500).json({ success: false, error: "Premium activation failed" });
        return;
      }

      const [sub] = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.razorpayPaymentId, razorpay_payment_id))
        .limit(1);

      res.json({
        success: true,
        plan: sub?.plan || resolvedPlan,
        expiresAt: sub?.currentPeriodEnd?.toISOString() || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (err: any) {
      logger.error({ err }, "Payment verification failed");
      res.status(500).json({ success: false, error: err.message || "Payment verification failed" });
    }
  }

  static async getHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const offset = (page - 1) * limit;

      const items = await db
        .select()
        .from(subscriptionsTable)
        .where(
          and(
            eq(subscriptionsTable.userId, userId),
            eq(subscriptionsTable.isDeleted, false)
          )
        )
        .orderBy(desc(subscriptionsTable.createdAt))
        .limit(limit)
        .offset(offset);

      res.json({ success: true, history: items });
    } catch (err: any) {
      logger.error({ err }, "Failed to fetch payment history");
      res.status(500).json({ success: false, error: "Failed to fetch history" });
    }
  }

  static async getInvoice(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const [sub] = await db
        .select()
        .from(subscriptionsTable)
        .where(
          and(
            eq(subscriptionsTable.id, id as string),
            eq(subscriptionsTable.userId, userId),
            eq(subscriptionsTable.isDeleted, false)
          )
        )
        .limit(1);

      if (!sub) {
        res.status(404).json({ error: "Invoice not found" });
        return;
      }

      const invoice = await InvoiceService.generateInvoiceForSubscription(sub.id);
      res.json({ success: true, invoice });
    } catch (err: any) {
      logger.error({ err }, "Invoice generation failed");
      res.status(500).json({ error: "Invoice generation failed" });
    }
  }

  static async getStatus(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const status = await SubscriptionService.getUserStatus(userId);
      res.json(status);
    } catch (err: any) {
      logger.error({ err }, "Failed to get subscription status");
      res.status(500).json({ error: "Failed to get status" });
    }
  }

  static async cancelSubscription(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const cancelled = await SubscriptionService.cancelSubscription(userId);
      if (cancelled) {
        res.json({ success: true, message: "Subscription cancelled" });
      } else {
        res.status(400).json({ error: "No active subscription to cancel" });
      }
    } catch (err: any) {
      logger.error({ err }, "Cancel subscription failed");
      res.status(500).json({ error: "Cancel failed" });
    }
  }

  static async handleWebhook(req: any, res: Response) {
    await PaymentService.handleWebhook(req, res);
  }

  static async getDiagnostics(req: AuthRequest, res: Response) {
    const razorpayConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
    const mockMode = PaymentService.isMockEnabled();
    const keyLoaded = !!process.env.RAZORPAY_KEY_ID;
    const secretLoaded = !!process.env.RAZORPAY_KEY_SECRET;
    const webhookConfigured = !!process.env.RAZORPAY_WEBHOOK_SECRET;

    let databaseConnected = false;
    try {
      await db.select().from(usersTable).limit(1);
      databaseConnected = true;
    } catch (err) {
      databaseConnected = false;
    }

    res.json({
      razorpayConfigured,
      mockMode,
      keyLoaded,
      secretLoaded,
      webhookConfigured,
      databaseConnected,
      lastOrderCreation: PaymentService.getLastOrderCreationStatus(),
      lastSignatureVerification: PaymentService.getLastSignatureVerificationStatus(),
    });
  }
}
