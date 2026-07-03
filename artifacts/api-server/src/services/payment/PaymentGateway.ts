import type { Request, Response } from "express";
import type { CreateOrderResult, VerifyPaymentInput, RefundInput, RefundResult } from "./types";

export interface CreateOrderGatewayInput {
  userId: string;
  plan: string;
  amount: number;
  couponCode?: string;
  notes?: Record<string, string>;
}

export interface PaymentGateway {
  createOrder(input: CreateOrderGatewayInput): Promise<CreateOrderResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<boolean>;
  handleWebhook(req: Request, res: Response): Promise<void>;
  refund(input: RefundInput): Promise<RefundResult>;
}
