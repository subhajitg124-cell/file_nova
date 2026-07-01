import { Router, type Response } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import { PaymentProvider } from "../services/PaymentProvider";
import { authMiddleware, requireAuth, type AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

// Zod schema for order creation validation
const createOrderSchema = z.object({
  amount: z.number().int().min(100, "Amount must be at least 100 paise (1 INR)"),
  currency: z.string().default("INR"),
  receipt: z.string().optional(),
});

// Zod schema for payment verification validation
const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string({ required_error: "razorpay_order_id is required" }),
  razorpay_payment_id: z.string({ required_error: "razorpay_payment_id is required" }),
  razorpay_signature: z.string({ required_error: "razorpay_signature is required" }),
});

// POST /create-order
router.post("/create-order", authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, currency, receipt } = createOrderSchema.parse(req.body);
    const user = req.user!;

    // Check if we are running in mock payment mode
    const isMock = PaymentProvider.isMockEnabled();

    if (isMock) {
      const orderId = `order_mock_${crypto.randomBytes(8).toString("hex")}`;
      logger.info({ userId: user.id, amount, orderId }, "Created mock Razorpay order");
      res.json({
        order_id: orderId,
        amount,
        currency,
        isMock: true,
      });
      return;
    }

    const rp = PaymentProvider.getRazorpayInstance();
    if (!rp) {
      logger.error("Razorpay SDK instance not initialized");
      res.status(500).json({ error: "Payment gateway configuration error" });
      return;
    }

    const orderReceipt = receipt || `receipt_${Date.now()}`;
    const order = await rp.orders.create({
      amount,
      currency,
      receipt: orderReceipt,
      notes: {
        userId: user.id,
        email: user.email || "",
      },
    });

    logger.info({ orderId: order.id, amount, userId: user.id }, "Successfully created Razorpay order");
    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0]?.message || "Invalid input parameters" });
      return;
    }
    logger.error({ err }, "Error creating Razorpay order");
    res.status(500).json({ error: err.message || "Failed to create Razorpay order" });
  }
});

// POST /verify-payment
router.post("/verify-payment", authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verifyPaymentSchema.parse(req.body);
    const user = req.user!;

    // Handle mock verification
    const isMockOrder = razorpay_order_id.startsWith("order_mock_");
    if (isMockOrder || PaymentProvider.isMockEnabled()) {
      logger.info({ userId: user.id, orderId: razorpay_order_id }, "Verified mock Razorpay payment signature successfully");
      res.json({
        success: true,
        message: "Mock payment verified successfully",
      });
      return;
    }

    const secret = PaymentProvider.getRazorpayKeySecret();
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      logger.warn({ orderId: razorpay_order_id, userId: user.id }, "Razorpay signature verification mismatch");
      res.status(400).json({
        success: false,
        error: "Payment signature mismatch. Verification failed.",
      });
      return;
    }

    logger.info({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, userId: user.id }, "Verified Razorpay payment signature successfully");
    res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.errors[0]?.message || "Missing required payment fields" });
      return;
    }
    logger.error({ err }, "Error verifying Razorpay payment signature");
    res.status(500).json({ error: err.message || "Payment verification failed" });
  }
});

export default router;
