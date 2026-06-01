import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db, subscriptionsTable, upiPaymentsTable, usersTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { adminAuth } from "../middlewares/adminAuth";
import { logger } from "../lib/logger";

const router = Router();

const planSchema = z.enum(["basic", "pro", "elite"]);

const upiVerifySchema = z.object({
  utrId: z.string().regex(/^\d{12}$/, "UTR/Transaction ID must be a 12 digit number"),
  email: z.string().email(),
  plan: planSchema,
  amount: z.number().int().positive(),
});

router.post("/upi-payment-verify", async (req: Request, res: Response) => {
  try {
    const payload = upiVerifySchema.parse(req.body);

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

router.get("/upi-payments", adminAuth, async (_req: Request, res: Response) => {
  try {
    const payments = await db
      .select()
      .from(upiPaymentsTable)
      .where(eq(upiPaymentsTable.status, "pending"))
      .orderBy(desc(upiPaymentsTable.createdAt));

    res.json({ success: true, payments });
  } catch (err: any) {
    logger.error({ err }, "Failed to fetch pending UPI payments");
    res.status(500).json({ success: false, error: err.message || "Failed to fetch UPI payments." });
  }
});

router.post("/upi-payments/:id/approve", adminAuth, async (req: Request, res: Response) => {
  try {
    const paymentId = String(req.params.id);
    const [payment] = await db
      .select()
      .from(upiPaymentsTable)
      .where(eq(upiPaymentsTable.id, paymentId))
      .limit(1);

    if (!payment) {
      return res.status(404).json({ success: false, error: "UPI payment not found." });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({ success: false, error: "UPI payment is already processed." });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, payment.email))
      .limit(1);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "No FileNova user exists for this email. Ask the customer to sign up first.",
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await db.insert(subscriptionsTable).values({
      userId: user.id,
      plan: payment.plan,
      status: "active",
      amount: payment.amount * 100,
      currency: "INR",
      razorpayPaymentId: `upi_${payment.utrId}`,
      currentPeriodStart: new Date(),
      currentPeriodEnd: expiresAt,
    });

    await db
      .update(usersTable)
      .set({
        premiumTier: payment.plan,
        premiumEnabled: true,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));

    await db
      .update(upiPaymentsTable)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(upiPaymentsTable.id, payment.id));

    res.json({ success: true, message: `Approved ${payment.plan} subscription for ${payment.email}.` });
  } catch (err: any) {
    logger.error({ err }, "Failed to approve UPI payment");
    res.status(500).json({ success: false, error: err.message || "Failed to approve UPI payment." });
  }
});

export default router;
