import { Router, type Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { eq, ne, or, and, desc } from "drizzle-orm";
import { hashPassword, verifyPassword, isLegacyHash } from "../utils/hash";
import { authMiddleware, requireAuth, AuthRequest } from "../middlewares/auth";
import { completeReferral, generateUniqueReferralCode, ensureUserReferralCode } from "../services/referralService";
import { logger } from "../lib/logger";
import { NotificationService } from "../services/NotificationService";
import { sendOtpEmail } from "../services/emailService";

const router = Router();
const googleOAuthClient = new OAuth2Client();

// 30 days session duration
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

// Helper to safely send JSON response
function sendJson<T>(res: Response, data: T, statusCode: number = 200) {
  if (!res.headersSent) {
    res.status(statusCode).json(data);
  }
}

// Helper to create a session token and store it in database
async function createSession(userId: string, res: Response) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessionsTable).values({
    userId,
    token,
    expiresAt,
  });

  // Set HTTP-only cookie
  res.cookie("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS,
  });

  return token;
}

// Helper to fetch subscription details and remaining days
async function getUserSubscriptionInfo(userId: string) {
  return {
    plan: "elite",
    status: "active",
    expiresAt: null,
    daysActive: null,
  };
}

// ── 1. POST /signup ──
router.post("/signup", async (req, res): Promise<void> => {
  try {
    const bodySchema = z.object({
      email: z.string().email("Invalid email format"),
      phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number").optional().nullable(),
      password: z.string().min(6, "Password must be at least 6 characters"),
      name: z.string().min(1, "Name is required").optional().nullable(),
      referralCode: z.string().max(8).optional().nullable(),
      referralTrackingId: z.string().uuid().optional().nullable(),
    });

    const parsed = bodySchema.parse(req.body);
    const passwordHash = hashPassword(parsed.password);
    const referralCode = await generateUniqueReferralCode();

    // Check if email already exists
    const [existingEmail] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, parsed.email.toLowerCase()))
      .limit(1);

    if (existingEmail) {
      sendJson(res, { error: "Email is already registered" }, 400);
      return;
    }

    // Check if phone number already exists (if provided)
    if (parsed.phoneNumber) {
      const [existingPhone] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.phoneNumber, parsed.phoneNumber))
        .limit(1);

      if (existingPhone) {
        sendJson(res, { error: "Phone number is already registered" }, 400);
        return;
      }
    }

    const [newUser] = await db
      .insert(usersTable)
      .values({
        email: parsed.email.toLowerCase(),
        phoneNumber: parsed.phoneNumber || null,
        passwordHash,
        name: parsed.name || null,
        role: "user",
        referralCode,
      })
      .returning();

    try {
      await completeReferral(
        parsed.referralCode,
        newUser.id,
        newUser.email,
        parsed.referralTrackingId ?? undefined,
        req.ip || undefined,
        req.headers["user-agent"] || undefined
      );
    } catch (referralErr) {
      logger.warn({ err: referralErr }, "Referral completion failed (non-critical)");
    }

    // Seed welcome notification (non-blocking)
    NotificationService.sendWelcome(newUser.id, newUser.name).catch((err) =>
      logger.warn({ err }, "Failed to send welcome notification")
    );

    const token = await createSession(newUser.id, res);

    sendJson(res, {
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        phoneVerified: newUser.phoneVerified,
        role: newUser.role,
        premiumTier: "elite",
        premiumEnabled: true,
        referralCode: newUser.referralCode,
      },
      subscription: null,
    }, 201);
  } catch (err: any) {
    logger.error({ err }, "Signup error");
    if (err instanceof z.ZodError) {
      sendJson(res, { error: err.errors[0].message }, 400);
      return;
    }
    sendJson(res, { error: "Failed to create user" }, 500);
  }
});

// ── 2. POST /login ──
router.post("/login", async (req, res): Promise<void> => {
  try {
    const bodySchema = z.object({
      identifier: z.string().min(1, "Email or Phone Number is required"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    });

    const parsed = bodySchema.parse(req.body);
    const id = parsed.identifier.toLowerCase();

    // Query by email OR phone number
    const conditions = [eq(usersTable.email, id)];
    if (/^\+?[0-9]+$/.test(id)) {
      conditions.push(eq(usersTable.phoneNumber, id));
    }

    const users = await db
      .select()
      .from(usersTable)
      .where(or(...conditions))
      .limit(1);

    const user = users[0];
    if (!user || !user.passwordHash || !verifyPassword(parsed.password, user.passwordHash)) {
      sendJson(res, { error: "Invalid email/phone number or password" }, 401);
      return;
    }

    // Upgrade legacy password hashes (1000 → 600000 PBKDF2 iterations)
    if (isLegacyHash(user.passwordHash)) {
      try {
        const newHash = hashPassword(parsed.password);
        await db.update(usersTable).set({ passwordHash: newHash }).where(eq(usersTable.id, user.id));
      } catch (upgradeErr) {
        logger.warn({ err: upgradeErr }, "Failed to upgrade password hash on login");
      }
    }

    const token = await createSession(user.id, res);
    const subscription = await getUserSubscriptionInfo(user.id);

    sendJson(res, {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        phoneVerified: user.phoneVerified,
        role: user.role,
        premiumTier: "elite",
        premiumEnabled: true,
        referralCode: user.referralCode,
      },
      subscription,
    });
  } catch (err: any) {
    logger.error({ err }, "Login error");
    if (err instanceof z.ZodError) {
      sendJson(res, { error: err.errors[0].message }, 400);
      return;
    }
    sendJson(res, { error: "Failed to authenticate" }, 500);
  }
});

// ── 3. POST /google ──
router.post("/google", async (req, res): Promise<void> => {
  try {
    const bodySchema = z.object({
      credential: z.string().min(1, "Google credential is required"),
      referralCode: z.string().max(8).optional().nullable(),
      referralTrackingId: z.string().uuid().optional().nullable(),
    });

    const parsed = bodySchema.parse(req.body);
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId || googleClientId === "your_google_client_id") {
      sendJson(res, { error: "Google OAuth client ID is not configured" }, 500);
      return;
    }

    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: parsed.credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      sendJson(res, { error: "Invalid Google credential" }, 401);
      return;
    }

    const email = payload.email.toLowerCase();
    const name = payload.name || payload.email.split("@")[0] || "Google User";

    // Find by email or googleSubject
    let user;
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(or(eq(usersTable.email, email), eq(usersTable.googleSubject, payload.sub)))
      .limit(1);

    if (existingUsers.length > 0) {
      user = existingUsers[0];
      // Always update Google ID and lastActiveAt on login to prevent account cleanup
      const [updatedUser] = await db
        .update(usersTable)
        .set({ 
          googleSubject: payload.sub, 
          lastActiveAt: new Date(),
          updatedAt: new Date() 
        })
        .where(eq(usersTable.id, user.id))
        .returning();
      user = updatedUser;
    } else {
      // Create user
      const referralCode = await generateUniqueReferralCode();
      const [newUser] = await db
        .insert(usersTable)
        .values({
          email,
          name,
          googleSubject: payload.sub,
          role: "user",
          referralCode,
        })
        .returning();
      user = newUser;
      try {
        await completeReferral(
          parsed.referralCode,
          user.id,
          user.email,
          parsed.referralTrackingId ?? undefined,
          req.ip || undefined,
          req.headers["user-agent"] || undefined
        );
      } catch (referralErr) {
        logger.warn({ err: referralErr }, "Referral completion failed (non-critical) during Google signup");
      }
    }

    const token = await createSession(user.id, res);
    const subscription = await getUserSubscriptionInfo(user.id);

    sendJson(res, {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        phoneVerified: user.phoneVerified,
        role: user.role,
        premiumTier: "elite",
        premiumEnabled: true,
        referralCode: user.referralCode,
      },
      subscription,
    });
  } catch (err: any) {
    logger.error({ err }, "Google auth error");
    if (err instanceof z.ZodError) {
      sendJson(res, { error: err.errors[0].message }, 400);
      return;
    }
    sendJson(res, { error: "Google auth processing failed" }, 500);
  }
});

// ── 4. GET /me ──
router.get("/me", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  try {
    const referralCode = await ensureUserReferralCode(req.user!.id);
    const subscription = await getUserSubscriptionInfo(req.user!.id);

    sendJson(res, {
      success: true,
      user: {
        id: req.user!.id,
        email: req.user!.email,
        name: req.user!.name,
        phoneNumber: req.user!.phoneNumber,
        phoneVerified: req.user!.phoneVerified,
        role: req.user!.role,
        premiumTier: "elite",
        premiumEnabled: true,
        referralCode,
      },
      subscription,
    });
  } catch (err: any) {
    logger.error({ err }, "/me endpoint error");
    sendJson(res, { success: false, error: "Failed to fetch user profile" }, 500);
  }
});

// ── 4.5. POST /refresh ──
router.post("/refresh", async (req, res): Promise<void> => {
  let token = req.headers["authorization"]?.replace("Bearer ", "");

  // Fallback to cookie
  if (!token && req.headers.cookie) {
    try {
      const cookies = req.headers.cookie.split(";").reduce((acc, c) => {
        const parts = c.trim().split("=");
        const k = parts[0];
        const v = parts.slice(1).join("=");
        if (k && v) acc[k] = decodeURIComponent(v);
        return acc;
      }, {} as Record<string, string>);
      token = cookies["session_token"];
    } catch (_) {
      // Ignore
    }
  }

  if (!token) {
    sendJson(res, { error: "No token provided for refresh" }, 401);
    return;
  }

  try {
    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.token, token))
      .limit(1);

    if (!session) {
      sendJson(res, { error: "Session not found" }, 401);
      return;
    }

    // Check if session has expired, allowing a 30-day grace period for refresh
    const maxGracePeriod = 30 * 24 * 60 * 60 * 1000;
    const sessionExpiredTime = new Date(session.expiresAt).getTime();
    if (Date.now() > sessionExpiredTime + maxGracePeriod) {
      try {
        await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
      } catch (err) {
        logger.error({ err }, "Failed to delete expired session during refresh");
      }
      res.clearCookie("session_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      sendJson(res, { error: "Session expired beyond grace period" }, 401);
      return;
    }

    // Generate new session token and update in database
    const newToken = crypto.randomBytes(32).toString("hex");
    const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await db
      .update(sessionsTable)
      .set({
        token: newToken,
        expiresAt: newExpiresAt,
      })
      .where(eq(sessionsTable.token, token));

    // Set cookie
    res.cookie("session_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_MS,
    });

    sendJson(res, { success: true, token: newToken });
  } catch (err: any) {
    logger.error({ err }, "Session refresh error");
    sendJson(res, { error: "Failed to refresh session" }, 500);
  }
});

// ── 5. POST /logout ──
router.post("/logout", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    if (req.sessionToken) {
      try {
        await db.delete(sessionsTable).where(eq(sessionsTable.token, req.sessionToken));
      } catch (err) {
        logger.error({ err }, "Failed to delete session");
      }
    }

    res.clearCookie("session_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    sendJson(res, { success: true, message: "Logged out successfully" });
  } catch (err: any) {
    logger.error({ err }, "Logout error");
    res.clearCookie("session_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    sendJson(res, { success: true, message: "Logged out successfully" });
  }
});

// ── 6. PUT /me (Update profile) ──
router.put("/me", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    if (!req.user) {
      sendJson(res, { error: "Authentication required" }, 401);
      return;
    }

    const bodySchema = z.object({
      name: z.string().min(1, "Name is required").optional().nullable(),
      phoneNumber: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number").optional().nullable(),
    });

    const parsed = bodySchema.parse(req.body);

    // Check phone number uniqueness if being updated
    if (parsed.phoneNumber) {
      const [existingPhone] = await db
        .select()
        .from(usersTable)
        .where(and(eq(usersTable.phoneNumber, parsed.phoneNumber), ne(usersTable.id, req.user.id)))
        .limit(1);
      if (existingPhone) {
        sendJson(res, { error: "This phone number is already registered" }, 409);
        return;
      }
    }

    const [updatedUser] = await db
      .update(usersTable)
      .set({
        name: parsed.name !== undefined ? parsed.name : undefined,
        phoneNumber: parsed.phoneNumber !== undefined ? parsed.phoneNumber : undefined,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, req.user.id))
      .returning();

    if (!updatedUser) {
      sendJson(res, { error: "User not found" }, 404);
      return;
    }

    const subscription = await getUserSubscriptionInfo(req.user.id);

    sendJson(res, {
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phoneNumber: updatedUser.phoneNumber,
        phoneVerified: updatedUser.phoneVerified,
        role: updatedUser.role,
        premiumTier: "elite",
        premiumEnabled: true,
        referralCode: updatedUser.referralCode,
      },
      subscription,
    });
  } catch (err: any) {
    logger.error({ err }, "Profile update error");
    if (err instanceof z.ZodError) {
      sendJson(res, { error: err.errors[0].message }, 400);
      return;
    }
    sendJson(res, { error: "Failed to update profile" }, 500);
  }
});

// ── 7. POST /change-password ──
router.post("/change-password", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    if (!req.user) {
      sendJson(res, { error: "Authentication required" }, 401);
      return;
    }

    const bodySchema = z.object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(6, "New password must be at least 6 characters"),
    });

    const parsed = bodySchema.parse(req.body);

    // Fetch full user record to check passwordHash
    const [dbUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user.id))
      .limit(1);

    if (!dbUser) {
      sendJson(res, { error: "User not found" }, 404);
      return;
    }

    // If signed up via Google and has no password set
    if (!dbUser.passwordHash) {
      sendJson(res, { error: "Google authenticated accounts cannot change password directly" }, 400);
      return;
    }

    if (!verifyPassword(parsed.currentPassword, dbUser.passwordHash)) {
      sendJson(res, { error: "Current password is incorrect" }, 400);
      return;
    }

    const newPasswordHash = hashPassword(parsed.newPassword);

    await db
      .update(usersTable)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, req.user.id));

    sendJson(res, {
      success: true,
      message: "Password changed successfully",
    });
  } catch (err: any) {
    logger.error({ err }, "Change password error");
    if (err instanceof z.ZodError) {
      sendJson(res, { error: err.errors[0].message }, 400);
      return;
    }
    sendJson(res, { error: "Failed to change password" }, 500);
  }
});

// ── 8. DELETE /me (Delete account) ──
router.delete("/me", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    if (!req.user) {
      sendJson(res, { error: "Authentication required" }, 401);
      return;
    }

    // Delete user
    await db.delete(usersTable).where(eq(usersTable.id, req.user.id));

    // Clear sessions
    if (req.sessionToken) {
      await db.delete(sessionsTable).where(eq(sessionsTable.token, req.sessionToken));
    }

    res.clearCookie("session_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    sendJson(res, {
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err: any) {
    logger.error({ err }, "Delete account error");
    sendJson(res, { error: "Failed to delete account" }, 500);
  }
});

// Memory store for OTPs
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

// Clean up expired OTP entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (value.expiresAt < now) {
      otpStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ── 9. POST /send-otp ──
router.post("/send-otp", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    if (!req.user) {
      sendJson(res, { error: "Authentication required" }, 401);
      return;
    }

    const bodySchema = z.object({
      type: z.enum(["mobile", "email"]),
      target: z.string().min(1, "Target is required"),
    });

    const parsed = bodySchema.parse(req.body);
    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit code
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    // Store in memory
    const storeKey = `${req.user.id}:${parsed.type}:${parsed.target}`;
    otpStore.set(storeKey, { otp, expiresAt });

    logger.info({ userId: req.user.id, type: parsed.type, target: parsed.target, otp }, "Generated verification OTP");

    if (parsed.type === "email") {
      const emailSent = await sendOtpEmail(parsed.target, otp);
      if (!emailSent) {
        sendJson(res, { error: "Failed to send verification email" }, 500);
        return;
      }
    } else {
      // Mock SMS logging
      logger.info(`[SMS MOCK] Sending OTP ${otp} to phone ${parsed.target}`);
    }

    sendJson(res, { success: true, message: `Verification code sent to your ${parsed.type}` });
  } catch (err: any) {
    logger.error({ err }, "Send OTP error");
    if (err instanceof z.ZodError) {
      sendJson(res, { error: err.errors[0].message }, 400);
      return;
    }
    sendJson(res, { error: "Failed to send OTP" }, 500);
  }
});

// ── 10. POST /verify-otp ──
router.post("/verify-otp", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    if (!req.user) {
      sendJson(res, { error: "Authentication required" }, 401);
      return;
    }

    const bodySchema = z.object({
      type: z.enum(["mobile", "email"]),
      target: z.string().min(1, "Target is required"),
      otp: z.string().length(4, "OTP must be 4 digits"),
    });

    const parsed = bodySchema.parse(req.body);
    const storeKey = `${req.user.id}:${parsed.type}:${parsed.target}`;
    const record = otpStore.get(storeKey);

    const isValidOtp = record && record.otp === parsed.otp && record.expiresAt > Date.now();

    if (!isValidOtp) {
      sendJson(res, { error: "Invalid or expired verification code" }, 400);
      return;
    }

    // Clean up used OTP
    otpStore.delete(storeKey);

    // Update user in DB
    const updateData: Record<string, any> = {
      phoneVerified: true,
      updatedAt: new Date(),
    };

    if (parsed.type === "mobile") {
      updateData.phoneNumber = parsed.target;
    }

    const [updatedUser] = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, req.user.id))
      .returning();

    if (!updatedUser) {
      sendJson(res, { error: "User not found" }, 404);
      return;
    }

    const subscription = await getUserSubscriptionInfo(req.user.id);

    sendJson(res, {
      success: true,
      message: "Account verified successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phoneNumber: updatedUser.phoneNumber,
        phoneVerified: updatedUser.phoneVerified,
        role: updatedUser.role,
        premiumTier: "elite",
        premiumEnabled: true,
        referralCode: updatedUser.referralCode,
      },
      subscription,
    });
  } catch (err: any) {
    logger.error({ err }, "Verify OTP error");
    if (err instanceof z.ZodError) {
      sendJson(res, { error: err.errors[0].message }, 400);
      return;
    }
    sendJson(res, { error: "Verification failed" }, 500);
  }
});

export default router;
