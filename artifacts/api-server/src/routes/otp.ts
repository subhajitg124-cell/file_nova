import { Router, type Response } from "express";
import crypto from "node:crypto";
import { db, usersTable, otpVerificationsTable } from "@workspace/db";
import { eq, and, gt, isNull, desc, count } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { sendOtpEmail } from "../services/emailService";
import { verifyTurnstile } from "../services/sms";
import { logger } from "../lib/logger";

const router = Router();

// In-memory payment token store (no Redis dependency)
const paymentTokens = new Map<string, { token: string; userId: string; expiresAt: number }>();

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  return user.slice(0, 3) + "***@" + domain;
}

function hashOTP(otp: string, userId: string): string {
  return crypto.createHash("sha256").update(otp + userId).digest("hex");
}

// POST /otp/send — email OTP only
router.post("/otp/send", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Rate limit: max 3 OTP requests per 15 minutes per user
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentOtps = await db
      .select({ value: count() })
      .from(otpVerificationsTable)
      .where(
        and(
          eq(otpVerificationsTable.userId, userId),
          eq(otpVerificationsTable.purpose, "payment"),
          gt(otpVerificationsTable.createdAt, fifteenMinAgo)
        )
      );

    const recentCount = recentOtps[0]?.value || 0;
    if (recentCount >= 3) {
      res.status(429).json({ error: "Too many OTP requests. Please wait 15 minutes." });
      return;
    }

    const user = req.user!;
    const otpTarget = user.email;

    if (!otpTarget) {
      res.status(400).json({ error: "No email address on your account." });
      return;
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate existing pending OTPs
    await db
      .update(otpVerificationsTable)
      .set({ expiresAt: new Date(0) })
      .where(
        and(
          eq(otpVerificationsTable.userId, userId),
          eq(otpVerificationsTable.purpose, "payment"),
          isNull(otpVerificationsTable.verifiedAt)
        )
      );

    // Save new OTP (hashed)
    await db.insert(otpVerificationsTable).values({
      userId,
      code: hashOTP(otp, userId),
      type: "email",
      target: otpTarget,
      purpose: "payment",
      expiresAt,
    });

    await sendOtpEmail(otpTarget, otp, user.name || undefined);
    const masked = maskEmail(otpTarget);
    res.json({ success: true, message: `OTP sent to ${masked}`, maskedTarget: masked });
  } catch (error: any) {
    logger.error({ error }, "OTP send error");
    res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
});

// POST /otp/verify
router.post("/otp/verify", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    const userId = req.user!.id;

    if (!code || typeof code !== "string" || code.length !== 6) {
      res.status(400).json({ error: "Invalid OTP format. Enter the 6-digit code." });
      return;
    }

    // Find latest pending, non-expired OTP
    const otpRecords = await db
      .select()
      .from(otpVerificationsTable)
      .where(
        and(
          eq(otpVerificationsTable.userId, userId),
          eq(otpVerificationsTable.purpose, "payment"),
          isNull(otpVerificationsTable.verifiedAt),
          gt(otpVerificationsTable.expiresAt, new Date())
        )
      )
      .orderBy(desc(otpVerificationsTable.createdAt))
      .limit(1);

    const otpRecord = otpRecords[0];
    if (!otpRecord) {
      res.status(400).json({ error: "No valid OTP found. Please request a new one." });
      return;
    }

    // Max 5 attempts
    if (otpRecord.attempts >= 5) {
      res.status(400).json({ error: "Too many failed attempts. Request a new OTP." });
      return;
    }

    // Increment attempt count
    await db
      .update(otpVerificationsTable)
      .set({ attempts: otpRecord.attempts + 1 })
      .where(eq(otpVerificationsTable.id, otpRecord.id));

    // Verify hash
    const hashedInput = hashOTP(code, userId);
    if (hashedInput !== otpRecord.code) {
      const remaining = 5 - (otpRecord.attempts + 1);
      res.status(400).json({ error: `Incorrect OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` });
      return;
    }

    // Mark OTP as verified
    await db
      .update(otpVerificationsTable)
      .set({ verifiedAt: new Date() })
      .where(eq(otpVerificationsTable.id, otpRecord.id));

    // Mark user as payment-verified (valid for 30 minutes)
    await db
      .update(usersTable)
      .set({ paymentVerifiedAt: new Date() })
      .where(eq(usersTable.id, userId));

    // Issue short-lived payment token
    const paymentToken = crypto.randomBytes(32).toString("hex");
    paymentTokens.set(`payment_token:${userId}`, {
      token: paymentToken,
      userId,
      expiresAt: Date.now() + 30 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Verification successful! Proceeding to checkout...",
      paymentToken,
      expiresIn: 1800,
    });
  } catch (error: any) {
    logger.error({ error }, "OTP verify error");
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// POST /otp/verify-captcha — Cloudflare Turnstile
router.post("/otp/verify-captcha", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { turnstileToken } = req.body;
    const userId = req.user!.id;

    if (!turnstileToken) {
      res.status(400).json({ error: "CAPTCHA token missing" });
      return;
    }

    const ip = (req.headers["cf-connecting-ip"] as string) || req.ip;
    const result = await verifyTurnstile(turnstileToken, ip);

    if (!result.success) {
      res.status(400).json({ error: "CAPTCHA verification failed. Please try again.", code: result.error });
      return;
    }

    // Mark user as payment-verified (same as email OTP path)
    await db
      .update(usersTable)
      .set({ paymentVerifiedAt: new Date() })
      .where(eq(usersTable.id, userId));

    // Issue payment token (same logic as email OTP verify)
    const paymentToken = crypto.randomBytes(32).toString("hex");
    paymentTokens.set(`payment_token:${userId}`, {
      token: paymentToken,
      userId,
      expiresAt: Date.now() + 30 * 60 * 1000,
    });

    res.json({
      success: true,
      paymentToken,
      message: "Verification successful! Proceeding to checkout...",
      expiresIn: 1800,
    });
  } catch (error: any) {
    logger.error({ error }, "CAPTCHA verify error");
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// Cleanup expired tokens periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of paymentTokens) {
    if (value.expiresAt < now) {
      paymentTokens.delete(key);
    }
  }
}, 60_000);

// Exported for use by payment routes
export function verifyPaymentToken(userId: string, token: string): boolean {
  const entry = paymentTokens.get(`payment_token:${userId}`);
  if (!entry) return false;
  if (entry.expiresAt < Date.now()) {
    paymentTokens.delete(`payment_token:${userId}`);
    return false;
  }
  if (entry.token !== token) return false;
  // Invalidate after single use
  paymentTokens.delete(`payment_token:${userId}`);
  return true;
}

export default router;
