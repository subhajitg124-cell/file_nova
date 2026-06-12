import type { VercelRequest, VercelResponse } from "@vercel/node";
import pool from "../lib/vercel-db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Get stats
    const userCount = await pool.query("SELECT COUNT(*) FROM users");
    const fileCount = await pool.query("SELECT COUNT(*) FROM files");
    const revenue = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM subscriptions 
      WHERE status = 'active'
    `);

    res.status(200).json({
      status: "online",
      backend: "operational",
      stats: {
        total_users: parseInt(userCount.rows[0].count),
        total_files: parseInt(fileCount.rows[0].count),
        total_revenue: parseFloat(revenue.rows[0].total),
        uptime: process.uptime(),
      },
      last_check: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(200).json({
      status: "online",
      backend: "degraded",
      stats: {
        total_users: 1,
        total_files: 0,
        total_revenue: 0,
        uptime: process.uptime(),
      },
      last_check: new Date().toISOString(),
      error: error.message,
    });
  }
}
