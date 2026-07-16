import "./load-env";
import app from "./app";
import { logger } from "./lib/logger";
import net from "net";
import { cleanupOldFiles } from "./utils/cleanup";
import os from "os";
import path from "path";
import { db, usersTable } from "@workspace/db";
import { eq, and, lt } from "drizzle-orm";
import { backfillMissingReferralCodes } from "./services/referralService";
import { NotificationService } from "./services/NotificationService";

// ── Startup environment checks ────────────────────────────────────────────────
if (!process.env["DATABASE_URL"]) {
  logger.warn(
    "DATABASE_URL env var is not set. " +
      "The API server will start but any database calls will fail. " +
      "Set DATABASE_URL in Replit Secrets.",
  );
}

// ── Scheduled temp-file cleanup (every 5 minutes) ────────────────────────────
const TMP_DIR = path.join(os.tmpdir(), "file-nova");
const cleanupTimer = setInterval(() => {
  cleanupOldFiles(TMP_DIR, 10 * 60 * 1000).catch(() => {
    // Ignore cleanup errors
  });
}, 5 * 60 * 1000);
cleanupTimer.unref();

// Run backfill for missing referral codes on start
backfillMissingReferralCodes().catch(() => {});

// ── Holiday greeting scheduler (fires daily at 6:00 AM IST) ──────────────────
// Calculate milliseconds until 6:00 AM IST (UTC+5:30 = UTC+330 minutes)
function msUntilNextIST6AM(): number {
  const now = new Date();
  // Current time in IST
  const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const istTarget = new Date(istNow);
  istTarget.setHours(6, 0, 0, 0); // 6:00:00.000 AM IST
  if (istTarget <= istNow) {
    istTarget.setDate(istTarget.getDate() + 1); // Already past 6AM today → aim for tomorrow
  }
  return istTarget.getTime() - istNow.getTime();
}

function scheduleHolidayGreetings() {
  const delay = msUntilNextIST6AM();
  logger.info({ nextFireInMinutes: Math.round(delay / 60000) }, "Holiday greeting scheduler armed");
  const timer = setTimeout(() => {
    NotificationService.sendDailyHolidayGreetings().catch((err) =>
      logger.error({ err }, "Holiday greeting dispatch failed")
    );
    // Re-schedule for next day
    scheduleHolidayGreetings();
  }, delay);
  timer.unref();
}

scheduleHolidayGreetings();

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

function findFreePort(startPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (err: any) => {
      if (err.code === "EADDRINUSE") {
        logger.warn(`Port ${startPort} is in use, trying ${startPort + 1}...`);
        resolve(findFreePort(startPort + 1));
      } else {
        resolve(startPort);
      }
    });
    server.once("listening", () => {
      server.close(() => {
        resolve(startPort);
      });
    });
    server.listen(startPort, "0.0.0.0");
  });
}

const startServer = async () => {
  try {
    const finalPort = await findFreePort(port);
    const server = app.listen(finalPort, () => {
      logger.info({ port: finalPort }, "Server listening");
    });
    server.on("error", (err) => {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    });
  } catch (err) {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  }
};

startServer();
