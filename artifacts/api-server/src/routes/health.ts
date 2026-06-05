import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// Health check - basic liveness probe (no auth required for load balancers)
router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "healthy" });
  res.json(data);
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
  const healthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "0.0.0",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    services: {
      database: "unknown",
      redis: process.env.REDIS_URL ? "configured" : "disabled",
      libreoffice_headless: process.env.ENABLE_VIRUS_SCAN === "true" ? "available" : "disabled",
      ffmpeg: process.env.ENABLE_VIRUS_SCAN === "true" ? "available" : "disabled",
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

  const statusCode = healthStatus.status === "healthy" ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

export default router;
