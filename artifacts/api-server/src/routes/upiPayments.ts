import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db, upiPaymentsTable } from "@workspace/db";
import { adminAuth } from "../middlewares/adminAuth";
import { authMiddleware, requireAuth, type AuthRequest } from "../middlewares/auth";
import { logger } from "../lib/logger";
import { AdminPaymentService } from "../services/AdminPaymentService";
import rateLimit from "express-rate-limit";

const router = Router();

const planSchema = z.enum(["basic", "pro", "elite"]);

const upiVerifySchema = z.object({
  utrId: z.string().regex(/^\d{12}$/, "UTR/Transaction ID must be a 12 digit number"),
  email: z.string().email(),
  plan: planSchema,
  amount: z.number().int().positive(),
});

// Rate limiting for UPI verification (Production Readiness)
const upiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 submissions per 15 minutes to prevent spamming random UTRs
  message: { success: false, error: "Too many payment verification submissions. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /upi-payment-verify (Public endpoint for submitting UTR - Authenticated)
router.post("/upi-payment-verify", upiRateLimiter, authMiddleware, requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const payload = upiVerifySchema.parse(req.body);
    const user = req.user!;

    // Enforce email matching for security (Issue 3.6)
    if (payload.email.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(400).json({ success: false, error: "The billing email does not match your logged-in account email." });
    }

    await db.insert(upiPaymentsTable).values({
      email: payload.email.toLowerCase(),
      utrId: payload.utrId,
      plan: payload.plan,
      amount: payload.amount,
      status: "pending",
    });

    res.json({
      success: true,
      message: "Payment received! Your account will be upgraded within 2-4 hours after verification.",
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to create UPI payment verification request");
    const message = err instanceof z.ZodError
      ? err.issues[0]?.message || "Invalid payment details"
      : err?.code === "23505"
        ? "This UTR/Transaction ID has already been submitted."
        : err.message || "Failed to submit UPI payment verification.";
    res.status(400).json({ success: false, error: message });
  }
});

// GET /upi-payments (Admin-only list of pending UPI checkouts)
router.get("/upi-payments", adminAuth, async (_req: Request, res: Response) => {
  try {
    const payments = await AdminPaymentService.getPendingUpiPayments();
    res.json({ success: true, payments });
  } catch (err: any) {
    logger.error({ err }, "Failed to fetch pending UPI payments");
    res.status(500).json({ success: false, error: err.message || "Failed to fetch UPI payments." });
  }
});

// POST /upi-payments/:id/approve (Admin-only approve endpoint)
router.post("/upi-payments/:id/approve", adminAuth, async (req: Request, res: Response) => {
  try {
    const paymentId = String(req.params.id);
    const approved = await AdminPaymentService.approveUpiPayment(paymentId);
    
    if (approved) {
      res.json({ success: true, message: "UPI payment approved and subscriber upgraded successfully." });
    } else {
      res.status(400).json({ success: false, error: "Failed to approve UPI payment." });
    }
  } catch (err: any) {
    logger.error({ err }, "Failed to approve UPI payment in route");
    res.status(500).json({ success: false, error: err.message || "Failed to approve UPI payment." });
  }
});

// POST /upi-payments/:id/reject (Admin-only reject endpoint)
router.post("/upi-payments/:id/reject", adminAuth, async (req: Request, res: Response) => {
  try {
    const paymentId = String(req.params.id);
    const rejected = await AdminPaymentService.rejectUpiPayment(paymentId);
    
    if (rejected) {
      res.json({ success: true, message: "UPI payment request has been rejected successfully." });
    } else {
      res.status(400).json({ success: false, error: "Failed to reject UPI payment." });
    }
  } catch (err: any) {
    logger.error({ err }, "Failed to reject UPI payment in route");
    res.status(500).json({ success: false, error: err.message || "Failed to reject UPI payment." });
  }
});

export default router;
