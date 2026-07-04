import type { Request, Response, NextFunction } from "express";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// Throttle lastActiveAt updates to at most once per 5 minutes per user
const lastActiveCache = new Set<string>();
setInterval(() => lastActiveCache.clear(), 5 * 60 * 1000);

export interface AuthRequest extends Request {
  user?: typeof usersTable.$inferSelect;
  sessionToken?: string;
  dbError?: unknown;
}

const SESSION_REFRESH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Middleware to authenticate requests via session token in headers, cookies, or query params.
 */
export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
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
      // Ignore cookie parsing issues
    }
  }

  // Fallback to query parameter (helpful for direct file downloads or testing)
  if (!token && req.query.token) {
    token = String(req.query.token);
  }

  if (!token) {
    return next();
  }

  if (token.startsWith("local_") && process.env.NODE_ENV !== "production") {
    req.user = {
      id: "local_dev",
      email: "subhajitgho123@gmail.com",
      name: "Developer Test",
      phoneNumber: null,
      phoneVerified: true,
      role: "developer",
      premiumTier: "elite",
      premiumEnabled: true,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      referralCode: "FN-DEV",
    } as any;
    req.sessionToken = token;
    return next();
  }

  // ── Store token on request immediately so requireAuth can see it even if
  // the DB lookup below throws (e.g. when the DB is unreachable in dev).
  req.sessionToken = token;

  try {
    const [session] = await db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.token, token))
      .limit(1);

    if (!session || new Date(session.expiresAt) < new Date()) {
      return next();
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.userId))
      .limit(1);

    if (user) {
      req.user = user;

      // Refresh session expiry for active users (fire-and-forget)
      const newExpiresAt = new Date(Date.now() + SESSION_REFRESH_MS);
      db.update(sessionsTable)
        .set({ expiresAt: newExpiresAt })
        .where(eq(sessionsTable.token, token))
        .catch(() => {});

      // Update user activity timestamp (throttled to once per 5 minutes)
      if (!lastActiveCache.has(user.id)) {
        lastActiveCache.add(user.id);
        db.update(usersTable)
          .set({ lastActiveAt: new Date() })
          .where(eq(usersTable.id, user.id))
          .catch(() => {});
      }
    }
  } catch (err) {
    // Database connection could be down, fallback silently but flag the error
    req.dbError = err;
  }
  next();
}

/**
 * Guard middleware that rejects unauthenticated requests with a 401 response.
 * In development, if the DB is unreachable but a token was provided, we fall
 * back to a mock developer user so that payment testing can proceed.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.dbError) {
    // In production always return 500 so we don't silently bypass auth
    if (process.env.NODE_ENV === "production") {
      res.status(500).json({ error: "Database connection failed. Please try again in a few seconds." });
      return;
    }
    // In development, if a token was presented but the DB lookup failed,
    // inject a fallback developer user so API endpoints remain testable.
    if (!req.user && req.sessionToken) {
      req.user = {
        id: "local_dev_fallback",
        email: "subhajitgho123@gmail.com",
        name: "Developer (DB offline)",
        phoneNumber: null,
        phoneVerified: true,
        role: "developer",
        premiumTier: "elite",
        premiumEnabled: true,
        createdAt: new Date(),
        lastActiveAt: new Date(),
        referralCode: "FN-DEV",
      } as any;
    }
  }
  if (!req.user) {
    res.status(401).json({ error: "Authentication required. Please log in first." });
    return;
  }
  next();
}
