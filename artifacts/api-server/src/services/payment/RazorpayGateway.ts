import crypto from "node:crypto";
import type { Request, Response } from "express";
import { db, subscriptionsTable, paymentEventsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { PaymentProvider } from "../PaymentProvider";
import { SubscriptionService } from "../SubscriptionService";
import { logger } from "../../lib/logger";
import type { CreateOrderGatewayInput, PaymentGateway } from "./PaymentGateway";
import type { CreateOrderResult, VerifyPaymentInput, RefundInput, RefundResult } from "./types";

export class RazorpayGateway implements PaymentGateway {
  public async createOrder(input: CreateOrderGatewayInput): Promise<CreateOrderResult> {
    const { userId, plan, amount, couponCode, notes } = input;
    const currency = PaymentProvider.getCurrency();
    const isMock = PaymentProvider.isMockEnabled();

    if (isMock) {
      const orderId = `order_mock_${crypto.randomBytes(8).toString("hex")}`;
      return {
        id: orderId,
        orderId,
        amount,
        currency,
        keyId: PaymentProvider.getRazorpayKeyId(),
        isMock: true,
      };
    }

    const razorpay = PaymentProvider.getRazorpayInstance();
    if (!razorpay) {
      throw new Error("Razorpay is not configured. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
    }

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `fn_${Date.now()}_${userId.slice(0, 8)}`,
      notes: {
        userId,
        plan,
        coupon: couponCode || "",
        ...notes,
      },
    });

    return {
      id: order.id,
      orderId: order.id,
      amount,
      currency,
      keyId: PaymentProvider.getRazorpayKeyId(),
      isMock: false,
    };
  }

  public async verifyPayment(input: VerifyPaymentInput): Promise<boolean> {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;

    if (PaymentProvider.isMockEnabled() && razorpay_order_id.startsWith("order_mock_")) {
      return true;
    }

    const secret = PaymentProvider.getRazorpayKeySecret();
    if (!secret) {
      logger.error("Razorpay secret is not configured for payment verification");
      return false;
    }

    try {
      const expected = crypto
        .createHmac("sha256", secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      return expected === razorpay_signature;
    } catch (err: any) {
      logger.error({ err, razorpay_order_id, razorpay_payment_id }, "Failed to verify Razorpay signature");
      return false;
    }
  }

  public async handleWebhook(req: Request, res: Response): Promise<void> {
    const secret = PaymentProvider.getRazorpayWebhookSecret();
    const signature = req.headers["x-razorpay-signature"] as string;
    const eventId = req.headers["x-razorpay-event-id"] as string;
    const event = req.body?.event;
    const payload = req.body?.payload;

    res.status(200).json({ received: true });

    if (!secret) {
      logger.error("RAZORPAY_WEBHOOK_SECRET is not configured");
      return;
    }
    if (!signature) {
      logger.error({ eventId }, "Missing webhook signature header");
      return;
    }

    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body), "utf8");
    if (!this.verifyWebhookSignature(rawBody, signature, secret)) {
      logger.error({ eventId, event }, "Invalid Razorpay webhook signature");
      return;
    }

    if (eventId) {
      const [existing] = await db
        .select({ id: paymentEventsTable.id })
        .from(paymentEventsTable)
        .where(eq(paymentEventsTable.eventId, eventId))
        .limit(1);

      if (existing) {
        logger.info({ eventId }, "Duplicate webhook event skipped");
        return;
      }
    }

    await db.insert(paymentEventsTable).values({
      eventId: eventId || null,
      eventType: event || null,
      orderId: req.body?.payload?.payment?.entity?.order_id || null,
      paymentId: req.body?.payload?.payment?.entity?.id || null,
      payload: req.body || {},
      status: "received",
    });

    try {
      await this.processEvent(event || "", payload);
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

  public async refund(_input: RefundInput): Promise<RefundResult> {
    return {
      success: false,
      error: "Refunds are not implemented yet",
    };
  }

  private verifyWebhookSignature(rawBody: Buffer | string, signature: string, secret: string): boolean {
    try {
      const expected = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");
      return expected === signature;
    } catch (err: any) {
      logger.error({ err }, "Webhook signature verification failed");
      return false;
    }
  }

  private async processEvent(event: string, payload: any): Promise<void> {
    if (event === "order.paid" || event === "payment.captured") {
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
        logger.warn({ orderId }, "Subscription not found for payment event");
        return;
      }
      if (sub.status === "active") {
        logger.info({ orderId }, "Subscription already active, skipping webhook activation");
        return;
      }

      await SubscriptionService.activateSubscription(orderId, paymentId, sub.plan);
      return;
    }

    if (event === "payment.failed") {
      const payment = payload?.payment?.entity;
      const orderId = payment?.order_id;
      const paymentId = payment?.id;
      if (!orderId) return;

      await db
        .update(subscriptionsTable)
        .set({ status: "failed", razorpayPaymentId: paymentId, updatedAt: new Date() })
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
      if (!userId) return;

      await SubscriptionService.cancelSubscription(userId);
      return;
    }
  }
}
