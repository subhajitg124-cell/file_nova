import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { PaymentController } from "../services/payment/PaymentController";

const router = Router();

router.post("/create-order", requireAuth, PaymentController.createOrder);
router.post("/verify", requireAuth, PaymentController.verifyPayment);
router.get("/status", requireAuth, PaymentController.getStatus);
router.get("/history", requireAuth, PaymentController.getHistory);
router.post("/cancel", requireAuth, PaymentController.cancelSubscription);
router.get("/invoice/:id", requireAuth, PaymentController.getInvoice);
router.get("/diagnostics", requireAuth, PaymentController.getDiagnostics);
router.post("/webhook", PaymentController.handleWebhook);

export default router;
