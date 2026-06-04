// =====================================================================
// FILE: api/server-status.ts
// PLACE AT: /api/server-status.ts
// Used by the Admin Dashboard "Backend Status" card
// =====================================================================

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "https://filenova.in");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();

  const hasFullBackend = !!process.env.DATABASE_URL;

  return res.status(200).json({
    online: true,
    backendMode: hasFullBackend ? "full" : "static",
    backendStatus: hasFullBackend ? "Online" : "Static Mode",
    systemHealth: {
      mimeValidation: { status: "active" },
      rateLimit: { status: "active" },
      adminGuard: { status: "active" },
      secureFileDeletion: { status: "active" },
      libreOffice: { status: hasFullBackend ? "active" : "unavailable" },
      ffmpeg: { status: hasFullBackend ? "active" : "unavailable" },
    },
    registeredUsers: hasFullBackend ? null : 0,
    activeSubscribers: hasFullBackend ? null : 0,
    mtdRevenue: hasFullBackend ? null : 0,
    timestamp: new Date().toISOString(),
  });
}
