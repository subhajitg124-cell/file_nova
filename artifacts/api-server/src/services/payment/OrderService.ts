import crypto from "node:crypto";
import { PaymentProvider } from "../PaymentProvider";
import { logger } from "../../lib/logger";
import type { CreateOrderResult } from "./types";
import { getPlanAmount } from "./types";

export class OrderService {
  static async createRazorpayOrder(
    userId: string,
    planId: string,
    billingCycle: string,
    couponCode?: string
  ): Promise<CreateOrderResult> {
    const amount = getPlanAmount(planId, billingCycle);
    const currency = PaymentProvider.getCurrency();
    const isMock = PaymentProvider.isMockEnabled();

    if (isMock) {
      const orderId = `order_mock_${crypto.randomBytes(8).toString("hex")}`;
      return {
        orderId,
        amount,
        currency,
        keyId: "rzp_test_mockkey",
        isMock: true,
      };
    }

    const rp = PaymentProvider.getRazorpayInstance();
    if (!rp) {
      throw new Error("Order creation failed: Razorpay not configured");
    }

    try {
      const order = await rp.orders.create({
        amount,
        currency,
        receipt: `fn_${Date.now()}_${userId.substring(0, 8)}`,
        notes: { userId, planId, billingCycle, coupon: couponCode || "" },
      });

      return {
        orderId: order.id,
        amount,
        currency,
        keyId: PaymentProvider.getRazorpayKeyId(),
      };
    } catch (err: any) {
      logger.error({ err, planId, billingCycle }, "Razorpay order creation failed");
      throw new Error(`Order creation failed: ${err.message || "Razorpay unavailable"}`);
    }
  }

  static verifySignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    if (orderId.startsWith("order_mock_")) {
      return true;
    }
    try {
      const secret = PaymentProvider.getRazorpayKeySecret();
      const expected = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");
      return expected === signature;
    } catch {
      return false;
    }
  }
}
