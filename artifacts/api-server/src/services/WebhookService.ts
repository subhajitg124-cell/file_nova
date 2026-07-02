import crypto from "node:crypto";
import { db, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Response } from "express";
import { logger } from "../lib/logger";
import { PaymentProvider } from "./PaymentProvider";
import { SubscriptionService } from "./SubscriptionService";

export class WebhookService {
  private static processedEvents: Set<string> = new Set();

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

  public static async handleWebhookRequest(req: any, res: Response) {
    const eventId = req.headers["x-razorpay-event-id"] as string;
    const signature = req.headers["x-razorpay-signature"] as string;
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    logger.info({ eventId, event: req.body?.event }, "Received Razorpay webhook");

    // Always acknowledge receipt immediately with 200 OK
    res.status(200).json({ received: true });

    // Validate configuration (log-only, response already sent)
    if (!secret) {
      logger.error("RAZORPAY_WEBHOOK_SECRET is not configured — webhook cannot be verified");
      return;
    }
    if (!signature) {
      logger.error({ eventId }, "Missing x-razorpay-signature header");
      return;
    }

    // Reconstruct raw body for signature verification
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body), "utf8");
    const verified = WebhookService.verifySignature(rawBody, signature, secret);

    if (!verified) {
      logger.error({ eventId, event: req.body?.event }, "Invalid webhook signature");
      return;
    }

    // Idempotency check
    if (eventId && WebhookService.processedEvents.has(eventId)) {
      logger.info({ eventId }, "Duplicate webhook event, skipping");
      return;
    }

    // Process event asynchronously
    try {
      const event = req.body?.event;
      const payload = req.body?.payload;

      if (event) {
        await WebhookService.processEvent(event, payload);
      }

      if (eventId) {
        WebhookService.processedEvents.add(eventId);
        logger.info({ eventId, event }, "Webhook processed successfully");
      }
    } catch (err: any) {
      logger.error({ err, eventId, event: req.body?.event }, "Webhook processing failed");
    }
  }

  public static async processEvent(event: string, payload: any): Promise<boolean> {
    logger.info({ event }, "Processing webhook event");

    if (event === "order.paid" || event === "payment.captured") {
      const payment = payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;

      if (!orderId || !paymentId) {
        logger.warn({ orderId, paymentId }, "Missing orderId or paymentId in webhook payload");
        return false;
      }

      try {
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
          logger.info({ orderId }, "Subscription already active, skipping");
          return true;
        }

        const activated = await SubscriptionService.activateSubscription(
          orderId,
          paymentId,
          sub.plan
        );

        if (activated) {
          logger.info({ orderId, paymentId }, "Subscription activated via webhook");
          return true;
        } else {
          logger.error({ orderId, paymentId }, "Failed to activate subscription via webhook");
          return false;
        }
      } catch (err) {
        logger.error({ err, orderId, paymentId }, "Error processing payment webhook event");
        return false;
      }
    }

    if (event === "payment.failed") {
      const payment = payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;

      if (!orderId) {
        logger.warn("Missing orderId in payment.failed webhook");
        return false;
      }

      try {
        await db
          .update(subscriptionsTable)
          .set({ status: "failed", razorpayPaymentId: paymentId, updatedAt: new Date() })
          .where(eq(subscriptionsTable.razorpayOrderId, orderId));

        logger.info({ orderId, paymentId }, "Marked subscription as failed via webhook");
        return true;
      } catch (err) {
        logger.error({ err, orderId }, "Error processing payment.failed event");
        return false;
      }
    }

    if (event === "payment.authorized") {
      logger.info("Payment authorized webhook received (waiting for capture)");
      return true;
    }

    if (event.startsWith("refund.")) {
      const refund = payload?.refund?.entity;
      const paymentId = refund?.payment_id;

      if (!paymentId) {
        logger.warn("Missing paymentId in refund webhook");
        return false;
      }

      try {
        await db
          .update(subscriptionsTable)
          .set({ status: "refunded", updatedAt: new Date() })
          .where(eq(subscriptionsTable.razorpayPaymentId, paymentId));

        logger.info({ paymentId }, "Marked subscription as refunded via webhook");
        return true;
      } catch (err) {
        logger.error({ err, paymentId }, "Error processing refund event");
        return false;
      }
    }

    if (event === "subscription.cancelled") {
      const rzpSub = payload?.subscription?.entity;
      const notes = rzpSub?.notes || {};
      const userId = notes.userId;

      if (userId) {
        try {
          const cancelled = await SubscriptionService.cancelSubscription(userId);
          if (cancelled) {
            logger.info({ userId }, "Cancelled subscription via webhook");
            return true;
          }
        } catch (err) {
          logger.error({ err, userId }, "Error cancelling subscription from webhook");
        }
      }
    }

    return false;
  }
}
