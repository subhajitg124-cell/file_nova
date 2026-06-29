import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router: IRouter = Router();

// Health check - basic liveness probe (no auth required for load balancers)
router.get("/healthz", (_req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  });
  res.end(JSON.stringify({ status: "healthy" }));
});

// Readiness probe - checks database connectivity (minimal info for load balancers)
router.get("/ready", async (_req, res) => {
  try {
    const { db } = await import("@workspace/db");
    const { usersTable } = await import("@workspace/db");
    await db.select().from(usersTable).limit(1);
    res.json({ status: "ready", database: "connected" });
  } catch {
    res.status(503).json({ status: "not ready", database: "disconnected" });
  }
});

// Live probe - basic process health (minimal info for load balancers)
router.get("/live", (_req, res) => {
  res.json({ status: "alive" });
});

// Comprehensive health check with service status
router.get("/health", async (_req, res) => {
  // Default to available (or load overrides from settings.json)
  let libreofficeAvailable = true;
  let ffmpegAvailable = true;

  try {
    const settingsFile = path.join(__dirname, "../../../settings.json");
    if (fs.existsSync(settingsFile)) {
      const settings = JSON.parse(fs.readFileSync(settingsFile, "utf-8"));
      if (settings.libreofficeAvailableOverride !== undefined) {
        libreofficeAvailable = settings.libreofficeAvailableOverride;
      }
      if (settings.ffmpegAvailableOverride !== undefined) {
        ffmpegAvailable = settings.ffmpegAvailableOverride;
      }
    }
  } catch (e) {
    // Ignore error
  }

  const healthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.0.0",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    services: {
      database: "unknown",
      redis: process.env.REDIS_URL ? "configured" : "disabled",
      libreoffice_headless: libreofficeAvailable ? "available" : "unavailable",
      ffmpeg: ffmpegAvailable ? "available" : "unavailable",
    },
  };

  // Check database connectivity
  try {
    const { db } = await import("@workspace/db");
    const { usersTable } = await import("@workspace/db");
    await db.select().from(usersTable).limit(1);
    healthStatus.services.database = "connected";
  } catch {
    healthStatus.services.database = "disconnected";
    healthStatus.status = "degraded";
  }

  const statusCode = 200;
  res.status(statusCode).json(healthStatus);
});

export default router;
