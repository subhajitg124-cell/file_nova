import crypto from "node:crypto";
import { db, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Response } from "express";
import { logger } from "../lib/logger";
import { PaymentProvider } from "./PaymentProvider";
import { SubscriptionService } from "./SubscriptionService";

export class WebhookService {
  /**
   * Verifies the webhook signature sent by Razorpay.
   */
  public static verifySignature(
    rawBody: string | Buffer,
    signature: string,
    secret: string
  ): boolean {
    if (!signature || !secret) {
      return false;
    }
    try {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      return expectedSignature === signature;
    } catch (err) {
      logger.error({ err }, "Error verifying webhook signature");
      return false;
    }
  }

  /**
   * Central Express Request Handler for Razorpay Webhooks.
   * Validates signature securely and delegates event processing.
   */
  public static async handleWebhookRequest(req: any, res: Response) {
    const signature = req.headers["x-razorpay-signature"] as string;
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    logger.info({ body: req.body }, "Received Razorpay webhook request");

    // Secure webhook signature validation (Issue 3.7):
    // Do not bypass validation. Require secret and signature.
    if (!secret) {
      logger.error("RAZORPAY_WEBHOOK_SECRET is not configured");
      return res.status(500).json({ success: false, error: "Webhook secret configuration missing" });
    }
    if (!signature) {
      logger.error("Missing X-Razorpay-Signature header");
      return res.status(400).json({ success: false, error: "Missing signature header" });
    }

    const rawBody = req.rawBody || JSON.stringify(req.body);
    const verified = WebhookService.verifySignature(rawBody, signature, secret);

    if (!verified) {
      logger.error("Invalid Razorpay webhook signature");
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }

    try {
      const event = req.body?.event;
      const payload = req.body?.payload;

      if (event) {
        await WebhookService.processEvent(event, payload);
      }
      res.json({ success: true, status: "ok" });
    } catch (err: any) {
      logger.error({ err }, "Error processing webhook request");
      res.status(500).json({ success: false, error: "Internal webhook error" });
    }
  }

  /**
   * Handles incoming Razorpay webhook event.
   * Processes order.paid and payment.captured to reconcile payments automatically.
   */
  public static async processEvent(event: string, payload: any): Promise<boolean> {
    logger.info({ event }, "Processing Razorpay webhook event");

    if (event === "order.paid" || event === "payment.captured") {
      const payment = payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;

      if (!orderId || !paymentId) {
        logger.warn({ orderId, paymentId }, "Missing orderId or paymentId in webhook payload");
        return false;
      }

      try {
        // Find subscription details to resolve the target plan
        const [sub] = await db
          .select()
          .from(subscriptionsTable)
          .where(eq(subscriptionsTable.razorpayOrderId, orderId))
          .limit(1);

        if (!sub) {
          logger.warn({ orderId }, "Subscription not found for webhook order");
          return false;
        }

        if (sub.status === "active") {
          logger.info({ orderId }, "Subscription is already active, skipping webhook reconciliation");
          return true;
        }

        // Activate the subscription using central subscription service
        const activated = await SubscriptionService.activateSubscription(
          orderId,
          paymentId,
          sub.plan
        );

        if (activated) {
          logger.info({ orderId, paymentId }, "Reconciled subscription successfully via WebhookService");
          return true;
        } else {
          logger.error({ orderId, paymentId }, "Failed to activate subscription during webhook reconciliation");
          return false;
        }
      } catch (err) {
        logger.error({ err, orderId, paymentId }, "Error processing payment/order webhook event");
        return false;
      }
    }

    if (event === "payment.failed") {
      const payment = payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;

      if (!orderId) {
        logger.warn("Missing orderId in payment.failed webhook payload");
        return false;
      }

      try {
        await db
          .update(subscriptionsTable)
          .set({ status: "failed", razorpayPaymentId: paymentId, updatedAt: new Date() })
          .where(eq(subscriptionsTable.razorpayOrderId, orderId));
        
        logger.info({ orderId, paymentId }, "Marked subscription as failed via webhook event");
        return true;
      } catch (err) {
        logger.error({ err, orderId }, "Error processing payment.failed event");
        return false;
      }
    }

    if (event === "payment.authorized") {
      logger.info({ payload }, "Payment authorized webhook received (no action taken, waiting for capture)");
      return true;
    }

    if (event.startsWith("refund.")) {
      const refund = payload?.refund?.entity;
      const paymentId = refund?.payment_id;

      if (!paymentId) {
        logger.warn("Missing paymentId in refund webhook payload");
        return false;
      }

      try {
        await db
          .update(subscriptionsTable)
          .set({ status: "refunded", updatedAt: new Date() })
          .where(eq(subscriptionsTable.razorpayPaymentId, paymentId));
        
        logger.info({ paymentId }, "Marked subscription as refunded/cancelled via webhook event");
        return true;
      } catch (err) {
        logger.error({ err, paymentId }, "Error processing refund event");
        return false;
      }
    }

    if (event === "subscription.cancelled") {
      // Handle automatic cancel events if subscriptions are recurring
      const rzpSub = payload?.subscription?.entity;
      const notes = rzpSub?.notes || {};
      const userId = notes.userId;

      if (userId) {
        try {
          const cancelled = await SubscriptionService.cancelSubscription(userId);
          if (cancelled) {
            logger.info({ userId }, "Cancelled recurring subscription via webhook event");
            return true;
          }
        } catch (err) {
          logger.error({ err, userId }, "Error cancelling subscription from webhook event");
        }
      }
    }

    return false;
  }
}
