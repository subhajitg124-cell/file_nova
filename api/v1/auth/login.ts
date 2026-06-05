import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import pool from "../../../lib/vercel-db";
import { generateToken } from "../../../lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: "Email/Username and password required" });
    }

    // Find user by email (in the frontend, 'identifier' is passed as email)
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [identifier]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      tier: user.tier,
    });

    res.status(200).json({
      success: true,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: "user",
        premiumTier: user.tier.toLowerCase(),
        premiumEnabled: user.tier !== "FREE",
      },
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
}
