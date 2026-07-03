import type { Request, Response } from "express";
import { PaymentProvider } from "./PaymentProvider";
import { RazorpayGateway } from "./payment/RazorpayGateway";
import type { PaymentGateway } from "./payment/PaymentGateway";
import type { OrderDetails, VerifyPaymentInput, RefundInput, RefundResult } from "./payment/types";

export class PaymentService {
  private static gateway: PaymentGateway = new RazorpayGateway();
  private static lastOrderCreationStatus: "success" | "failure" | "unknown" = "unknown";
  private static lastSignatureVerificationStatus: "success" | "failure" | "unknown" = "unknown";

  public static getKeyId(): string {
    return PaymentProvider.getRazorpayKeyId();
  }

  public static isMockEnabled(): boolean {
    return PaymentProvider.isMockEnabled();
  }

  public static getLastOrderCreationStatus(): "success" | "failure" | "unknown" {
    return this.lastOrderCreationStatus;
  }

  public static getLastSignatureVerificationStatus(): "success" | "failure" | "unknown" {
    return this.lastSignatureVerificationStatus;
  }

  public static async createOrder(
    userId: string,
    plan: string,
    amount: number,
    couponCode?: string
  ): Promise<OrderDetails> {
    try {
      const order = await this.gateway.createOrder({
        userId,
        plan,
        amount,
        couponCode,
        notes: { service: "file-nova" },
      });
      this.lastOrderCreationStatus = "success";
      return order;
    } catch (err) {
      this.lastOrderCreationStatus = "failure";
      throw err;
    }
  }

  public static async verifyPayment(input: VerifyPaymentInput): Promise<boolean> {
    if (process.env.RAZORPAY_SKIP_SIGNATURE_VERIFICATION === "true") {
      this.lastSignatureVerificationStatus = "success";
      return true;
    }

    const verified = await this.gateway.verifyPayment(input);
    this.lastSignatureVerificationStatus = verified ? "success" : "failure";
    return verified;
  }

  public static async handleWebhook(req: Request, res: Response): Promise<void> {
    return this.gateway.handleWebhook(req, res);
  }

  public static async refund(input: RefundInput): Promise<RefundResult> {
    return this.gateway.refund(input);
  }
}
