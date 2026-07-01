import crypto from "node:crypto";
import { PaymentProvider } from "./PaymentProvider";
import { logger } from "../lib/logger";

export interface OrderDetails {
  id: string;
  amount: number;
  currency: string;
  plan: string;
  keyId: string;
  isMock: boolean;
}

export class PaymentService {
  public static async createOrder(
    userId: string,
    plan: string,
    amount: number,
    couponCode?: string
  ): Promise<OrderDetails> {
    const isMock = PaymentProvider.isMockEnabled();
    const currency = PaymentProvider.getCurrency();

    if (isMock) {
      const orderId = `order_mock_${crypto.randomBytes(8).toString("hex")}`;
      return {
        id: orderId,
        amount,
        currency,
        plan,
        keyId: "rzp_test_mockkey",
        isMock: true,
      };
    }

    const rp = PaymentProvider.getRazorpayInstance();
    if (!rp) {
      throw new Error("Payment provider initialization failed. Use mock mode or configure credentials.");
    }

    try {
      const order = await rp.orders.create({
        amount,
        currency,
        receipt: `receipt_${Date.now()}`,
        notes: {
          userId,
          plan,
          coupon: couponCode || "",
        },
      });

      return {
        id: order.id,
        amount,
        currency,
        plan,
        keyId: PaymentProvider.getRazorpayKeyId(),
        isMock: false,
      };
    } catch (err: any) {
      logger.error({ err }, "Razorpay API call to create order failed");
      throw new Error(`Razorpay order creation failed: ${err.message || err}`);
    }
  }

  public static verifySignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    if (PaymentProvider.isMockEnabled() && orderId.startsWith("order_mock_")) {
      return true; // Auto-pass mock orders
    }

    try {
      const secret = PaymentProvider.getRazorpayKeySecret();
      const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

      return generatedSignature === signature;
    } catch (err) {
      logger.error({ err }, "HMAC signature verification failed");
      return false;
    }
  }
}
