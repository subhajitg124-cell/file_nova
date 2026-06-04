// =====================================================================
// FILE: api/health.ts
// PLACE THIS AT YOUR PROJECT ROOT: /api/health.ts
// Vercel auto-detects this as a Serverless Function.
// This makes the "Server Unavailable" banner disappear immediately.
// =====================================================================

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Allow CORS from your own domain
  res.setHeader("Access-Control-Allow-Origin", "https://filenova.in");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: "ok",
    service: "FileNova API",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "production",
    // These will show as "Unavailable" in admin until you deploy the full backend
    features: {
      libreOffice: false,   // needs full server deployment
      ffmpeg: false,         // needs full server deployment
      database: false,       // set to true after Railway deployment
      mimeValidation: true,  // client-side, always active
      rateLimit: true,       // client-side, always active
      adminGuard: true,      // client-side, always active
      secureFileDeletion: true, // client-side, always active
    },
    message: "FileNova static services are running. Full backend coming soon.",
  });
}
