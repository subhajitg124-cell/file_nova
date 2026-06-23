import Razorpay from "razorpay";
import { logger } from "../lib/logger";

export class PaymentProvider {
  private static instance: Razorpay | null = null;

  public static getRazorpayKeyId(): string {
    return process.env.RAZORPAY_KEY_ID || "rzp_test_mockkey";
  }

  public static getRazorpayKeySecret(): string {
    return process.env.RAZORPAY_KEY_SECRET || "rzp_test_mocksecret";
  }

  public static getMerchantName(): string {
    return process.env.PAYMENT_MERCHANT_NAME || "FileNova";
  }

  public static getUpiId(): string {
    return process.env.UPI_ID || "9064560741@upi";
  }

  public static getSupportEmail(): string {
    return process.env.SUPPORT_EMAIL || "support@filenova.in";
  }

  public static getSupportWhatsapp(): string {
    return process.env.SUPPORT_WHATSAPP || "+919064560741";
  }

  public static getCurrency(): string {
    return process.env.PAYMENT_CURRENCY || "INR";
  }

  public static getRazorpayInstance(): Razorpay | null {
    if (this.instance) {
      return this.instance;
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      logger.warn("⚠️ RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set. Falling back to Mock Payment Provider.");
      return null;
    }

    try {
      // @ts-ignore
      this.instance = new Razorpay({ key_id, key_secret });
      return this.instance;
    } catch (err) {
      logger.error({ err }, "Failed to initialize Razorpay SDK instance");
      return null;
    }
  }

  public static isMockEnabled(): boolean {
    return !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || process.env.PAYMENT_PROVIDER === "mock";
  }
}
