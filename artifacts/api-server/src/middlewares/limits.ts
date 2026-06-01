import type { Response, NextFunction } from "express";
import { db, usersTable, ipUsageTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { AuthRequest } from "./auth";

/**
 * Gets current date in Indian Standard Time (IST) in YYYY-MM-DD format
 */
export const getISTDate = (): string => {
  const d = new Date();
  // IST offset is UTC +5.30 (330 minutes)
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const ist = new Date(utc + 3600000 * 5.5);
  const year = ist.getFullYear();
  const month = String(ist.getMonth() + 1).padStart(2, "0");
  const date = String(ist.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
};

/**
 * Middleware to check daily usage limits based on subscription tier.
 * Resets limits daily at midnight IST.
 */
export async function checkUsageLimit(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const today = getISTDate();

    // 1. Authenticated User limits checking
    if (req.user) {
      const tier = req.user.premiumTier || "free";
      
      // Pro, Elite, Enterprise, and Admins have unlimited usage
      if (
        tier === "pro" || 
        tier === "elite" || 
        tier === "enterprise" || 
        req.user.role === "admin" || 
        req.user.role === "super_admin" ||
        req.user.premiumEnabled === true && (tier === "pro" || tier === "elite")
      ) {
        return next();
      }

      const limit = tier === "basic" ? 20 : 3;
      let usage = req.user.usageToday;
      let lastReset = req.user.lastUsageReset;

      if (lastReset !== today) {
        usage = 0;
        lastReset = today;
        await db
          .update(usersTable)
          .set({ usageToday: 0, lastUsageReset: today, updatedAt: new Date() })
          .where(eq(usersTable.id, req.user.id));
      }

      if (usage >= limit) {
        return res.status(403).json({
          error: `Daily limit reached. ${tier === "basic" ? "Basic" : "Free"} users are limited to ${limit} actions per day. Please upgrade to a higher tier to continue.`,
          limitReached: true,
          limit,
          usage,
        });
      }

      // Increment usage
      await db
        .update(usersTable)
        .set({ usageToday: usage + 1, updatedAt: new Date() })
        .where(eq(usersTable.id, req.user.id));

      return next();
    }

    // 2. Anonymous/Guest User limits checking (IP-based)
    const ip = req.headers["x-forwarded-for"]
      ? (req.headers["x-forwarded-for"] as string).split(",")[0].trim()
      : req.ip || "127.0.0.1";

    const [ipRecord] = await db
      .select()
      .from(ipUsageTable)
      .where(eq(ipUsageTable.ipAddress, ip))
      .limit(1);

    if (!ipRecord) {
      // First action today for this IP
      await db.insert(ipUsageTable).values({
        ipAddress: ip,
        usageToday: 1,
        lastUsedAt: today,
        updatedAt: new Date(),
      });
      return next();
    }

    let ipUsage = ipRecord.usageToday;
    let ipLastUsed = ipRecord.lastUsedAt;

    if (ipLastUsed !== today) {
      // Reset usage for new day
      await db
        .update(ipUsageTable)
        .set({ usageToday: 1, lastUsedAt: today, updatedAt: new Date() })
        .where(eq(ipUsageTable.ipAddress, ip));
      return next();
    }

    if (ipUsage >= 3) {
      return res.status(403).json({
        error: "Daily limit reached. Guest users are limited to 3 actions per day. Please sign in or upgrade to a premium plan to continue.",
        limitReached: true,
        limit: 3,
        usage: ipUsage,
      });
    }

    // Increment guest usage
    await db
      .update(ipUsageTable)
      .set({ usageToday: ipUsage + 1, updatedAt: new Date() })
      .where(eq(ipUsageTable.ipAddress, ip));

    return next();
  } catch (err) {
    console.error("Error in checkUsageLimit middleware:", err);
    // Silent failover to prevent service disruption if DB check fails
    return next();
  }
}
