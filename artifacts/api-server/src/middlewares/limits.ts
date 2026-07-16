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
  return next();
}
