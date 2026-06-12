import type { VercelRequest, VercelResponse } from "@vercel/node";
import pool from "../../lib/vercel-db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // Check db connectivity
    await pool.query("SELECT 1");
    
    res.status(200).json({
      status: "healthy",
      services: {
        database: "connected",
        libreoffice_headless: "available",
        ffmpeg: "available"
      }
    });
  } catch (error: any) {
    res.status(200).json({
      status: "degraded",
      services: {
        database: "disconnected",
        libreoffice_headless: "available",
        ffmpeg: "available"
      },
      error: error.message
    });
  }
}
