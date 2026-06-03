import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// Health check - basic liveness probe (no auth required for load balancers)
router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// Readiness probe - checks database connectivity (minimal info for load balancers)
router.get("/ready", async (_req, res) => {
  try {
    const { db } = await import("@workspace/db");
    const { usersTable } = await import("@workspace/db");
    await db.select().from(usersTable).limit(1);
    res.json({ status: "ready" });
  } catch {
    res.status(503).json({ status: "not ready" });
  }
});

// Live probe - basic process health (minimal info for load balancers)
router.get("/live", (_req, res) => {
  res.json({ status: "alive" });
});

export default router;
