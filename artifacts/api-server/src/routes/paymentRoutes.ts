import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { PaymentController } from "../services/payment/PaymentController";

const router = Router();

// Create Razorpay order
router.post("/create-order", requireAuth, PaymentController.createOrder);

// Verify payment and activate subscription
router.post("/verify", requireAuth, PaymentController.verifyPayment);

// Subscription status
router.get("/status", requireAuth, PaymentController.getStatus);

// Payment history
router.get("/history", requireAuth, PaymentController.getHistory);

// Cancel subscription
router.post("/cancel", requireAuth, PaymentController.cancelSubscription);

// Invoice
router.get("/invoice/:id", requireAuth, PaymentController.getInvoice);

// Diagnostics
router.get("/diagnostics", requireAuth, PaymentController.getDiagnostics);

// Webhook
router.post("/webhook", PaymentController.handleWebhook);

export default router;
