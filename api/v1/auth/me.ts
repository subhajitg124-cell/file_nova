import type { VercelRequest, VercelResponse } from "@vercel/node";
import pool from "../../../lib/vercel-db";
import { verifyToken } from "../../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    // Handle GET - Fetch user profile
    if (req.method === "GET") {
      const result = await pool.query("SELECT id, email, name, tier FROM users WHERE id = $1", [decoded.userId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      const user = result.rows[0];
      return res.status(200).json({
        success: true,
        user: {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: "user",
          premiumTier: user.tier.toLowerCase(),
          premiumEnabled: user.tier !== "FREE",
        },
        subscription: {
          plan: user.tier.toLowerCase(),
          status: "active",
          expiresAt: null,
          daysActive: null,
        },
      });
    }

    // Handle PUT - Update user profile
    if (req.method === "PUT") {
      const { name } = req.body;
      const result = await pool.query(
        "UPDATE users SET name = $1 WHERE id = $2 RETURNING id, email, name, tier",
        [name || "", decoded.userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: "User not found" });
      }

      const user = result.rows[0];
      return res.status(200).json({
        success: true,
        user: {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: "user",
          premiumTier: user.tier.toLowerCase(),
          premiumEnabled: user.tier !== "FREE",
        },
      });
    }

    // Handle DELETE - Delete account
    if (req.method === "DELETE") {
      await pool.query("DELETE FROM users WHERE id = $1", [decoded.userId]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("Auth me error:", error);
    res.status(500).json({ error: error.message });
  }
}
