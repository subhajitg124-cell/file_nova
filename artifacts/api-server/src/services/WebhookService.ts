import crypto from "node:crypto";
import { db, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
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
