import type { VercelRequest, VercelResponse } from "@vercel/node";
import pool from "../lib/vercel-db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS (already covered by vercel.json headers, but kept here for safety)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Test database connection
    const start = Date.now();
    await pool.query("SELECT 1");
    const dbLatency = Date.now() - start;

    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: "2.0.0",
      services: {
        database: "connected",
        database_latency_ms: dbLatency,
        storage: "available",
        api: "operational",
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error: any) {
    console.error("Health check failed:", error);

    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        database: "disconnected",
        storage: "unavailable",
        api: "degraded",
      },
    });
  }
}
