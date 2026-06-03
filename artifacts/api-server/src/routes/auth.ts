import { Router, type Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { OAuth2Client } from "google-auth-library";
import { db, usersTable, sessionsTable, subscriptionsTable } from "@workspace/db";
import { eq, or, desc } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../utils/hash";
import { authMiddleware, AuthRequest } from "../middlewares/auth";
import { completeReferral, generateUniqueReferralCode } from "../services/referralService";
import { logger } from "../lib/logger";

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
    maxAge: SESSION_DURATION_MS,
  });

  return token;
}

// Helper to fetch subscription details and remaining days
async function getUserSubscriptionInfo(userId: string) {
  try {
    const subs = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, userId))
      .orderBy(desc(subscriptionsTable.createdAt));

    const activeSub = subs.find((s) => s.status === "active");

    let daysActive = null;
    if (activeSub && activeSub.currentPeriodEnd) {
      const msDiff = new Date(activeSub.currentPeriodEnd).getTime() - Date.now();
      daysActive = Math.max(0, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
    }

    return activeSub
      ? {
          plan: activeSub.plan,
          status: activeSub.status,
          expiresAt: activeSub.currentPeriodEnd,
          daysActive,
        }
      : null;
  } catch (err) {
    logger.error({ err, userId }, "Failed to fetch subscription info");
    return null;
  }
}

// ── 1. POST /signup ──
router.post("/signup", async (req, res): Promise<void> => {
  try {
    const bodySchema = z.object({
      email: z.string().email("Invalid email format"),
      phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").max(15).optional().nullable(),
      password: z.string().min(6, "Password must be at least 6 characters"),
      name: z.string().min(1, "Name is required").optional().nullable(),
      referralCode: z.string().max(8).optional().nullable(),
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
        premiumTier: "free",
        premiumEnabled: false,
        referralCode,
      })
      .returning();

    await completeReferral(parsed.referralCode, newUser.id, newUser.email);
    const token = await createSession(newUser.id, res);

    sendJson(res, {
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
        premiumTier: newUser.premiumTier,
        premiumEnabled: newUser.premiumEnabled,
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
    sendJson(res, { error: err.message || "Failed to create user" }, 500);
  }
});

// ── 2. POST /login ──
router.post("/login", async (req, res): Promise<void> => {
  try {
    const bodySchema = z.object({
      identifier: z.string().min(1, "Email or Phone Number is required"),
      password: z.string().min(1, "Password is required"),
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
        role: user.role,
        premiumTier: user.premiumTier,
        premiumEnabled: user.premiumEnabled,
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
    sendJson(res, { error: err.message || "Failed to authenticate" }, 500);
  }
});

// ── 3. POST /google ──
router.post("/google", async (req, res): Promise<void> => {
  try {
    const bodySchema = z.object({
      credential: z.string().min(1, "Google credential is required"),
      referralCode: z.string().max(8).optional().nullable(),
    });

    const parsed = bodySchema.parse(req.body);
    const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;

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
      // Update Google ID if not set
      if (!user.googleSubject) {
        const [updatedUser] = await db
          .update(usersTable)
          .set({ googleSubject: payload.sub, updatedAt: new Date() })
          .where(eq(usersTable.id, user.id))
          .returning();
        user = updatedUser;
      }
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
          premiumTier: "free",
          premiumEnabled: false,
          referralCode,
        })
        .returning();
      user = newUser;
      await completeReferral(parsed.referralCode, user.id, user.email);
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
        role: user.role,
        premiumTier: user.premiumTier,
        premiumEnabled: user.premiumEnabled,
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
    sendJson(res, { error: err.message || "Google auth processing failed" }, 500);
  }
});

// ── 4. GET /me ──
router.get("/me", authMiddleware, async (req: AuthRequest, res): Promise<void> => {
  try {
    if (!req.user) {
      sendJson(res, { success: true, user: null, subscription: null });
      return;
    }

    const subscription = await getUserSubscriptionInfo(req.user.id);

    sendJson(res, {
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        phoneNumber: req.user.phoneNumber,
        role: req.user.role,
        premiumTier: req.user.premiumTier,
        premiumEnabled: req.user.premiumEnabled,
        referralCode: req.user.referralCode,
      },
      subscription,
    });
  } catch (err: any) {
    logger.error({ err }, "/me endpoint error");
    sendJson(res, { success: true, user: null, subscription: null });
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

export default router;
