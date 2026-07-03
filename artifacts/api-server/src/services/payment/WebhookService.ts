import crypto from "node:crypto";
import type { Response } from "express";
import { db, subscriptionsTable, paymentEventsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../../lib/logger";
import { PaymentProvider } from "../PaymentProvider";
import { SubscriptionService } from "../SubscriptionService";

export class WebhookService {
  static async handleWebhook(req: any, res: Response) {
    res.status(200).json({ received: true });

    const eventId = req.headers["x-razorpay-event-id"] as string;
    const signature = req.headers["x-razorpay-signature"] as string;
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    const event = req.body?.event;
    const payload = req.body?.payload;

    if (!secret) {
      logger.error("Webhook secret not configured");
      return;
    }
    if (!signature) {
      logger.error("Missing webhook signature");
      return;
    }

    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body), "utf8");
    if (!this.verifySignature(rawBody, signature, secret)) {
      logger.error({ eventId }, "Invalid webhook signature");
      return;
    }

    if (eventId) {
      const [existing] = await db
        .select({ id: paymentEventsTable.id })
        .from(paymentEventsTable)
        .where(eq(paymentEventsTable.eventId, eventId))
        .limit(1);
      if (existing) {
        logger.info({ eventId }, "Duplicate webhook, skipped");
        return;
      }
    }

    if (!event) {
      logger.warn("Webhook missing event type");
      return;
    }

    const payment = payload?.payment?.entity;
    const orderId = payment?.order_id;
    const paymentId = payment?.id;

    await db.insert(paymentEventsTable).values({
      eventId: eventId || null,
      eventType: event,
      orderId: orderId || null,
      paymentId: paymentId || null,
      payload: req.body || {},
      status: "received",
    });

    try {
      await this.processEvent(event, payload);
      if (eventId) {
        await db
          .update(paymentEventsTable)
          .set({ status: "processed" })
          .where(eq(paymentEventsTable.eventId, eventId));
      }
      logger.info({ eventId, event }, "Webhook processed");
    } catch (err: any) {
      logger.error({ err, eventId, event }, "Webhook processing failed");
      if (eventId) {
        await db
          .update(paymentEventsTable)
          .set({ status: "failed", errorMessage: err.message })
          .where(eq(paymentEventsTable.eventId, eventId));
      }
    }
  }

  private static verifySignature(
    rawBody: string | Buffer,
    signature: string,
    secret: string
  ): boolean {
    try {
      const expected = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
      return expected === signature;
    } catch {
      return false;
    }
  }

  private static async processEvent(event: string, payload: any) {
    if (event === "payment.captured" || event === "order.paid") {
      const payment = payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;
      if (!orderId || !paymentId) return;

      const [sub] = await db
        .select()
        .from(subscriptionsTable)
        .where(eq(subscriptionsTable.razorpayOrderId, orderId))
        .limit(1);

      if (!sub) {
        logger.warn({ orderId }, "No subscription found for webhook order");
        return;
      }
      if (sub.status === "active") return;

      await SubscriptionService.activateSubscription(orderId, paymentId, sub.plan);
      return;
    }

    if (event === "payment.failed") {
      const payment = payload?.payment?.entity;
      const orderId = payment?.order_id;
      if (!orderId) return;

      await db
        .update(subscriptionsTable)
        .set({
          status: "failed",
          razorpayPaymentId: payment?.id || null,
          updatedAt: new Date(),
        })
        .where(eq(subscriptionsTable.razorpayOrderId, orderId));
      return;
    }

    if (event.startsWith("refund.")) {
      const refund = payload?.refund?.entity;
      const paymentId = refund?.payment_id;
      if (!paymentId) return;

      await db
        .update(subscriptionsTable)
        .set({ status: "refunded", updatedAt: new Date() })
        .where(eq(subscriptionsTable.razorpayPaymentId, paymentId));
      return;
    }

    if (event === "subscription.cancelled") {
      const rzpSub = payload?.subscription?.entity;
      const userId = rzpSub?.notes?.userId;
      if (userId) {
        await SubscriptionService.cancelSubscription(userId);
      }
    }
  }
}
