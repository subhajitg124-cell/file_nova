import type { VercelRequest, VercelResponse } from "@vercel/node";
import { put } from "@vercel/blob";
import pool from "../../lib/vercel-db";
import { verifyToken } from "../../lib/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-filename");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get file from request
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk as Buffer);
    }
    const buffer = Buffer.concat(chunks);

    if (buffer.length === 0) {
      return res.status(400).json({ error: "Empty request body" });
    }

    // Upload to Vercel Blob
    const filename = `uploads/${Date.now()}-${req.headers["x-filename"] || "file.pdf"}`;
    const blob = await put(filename, buffer, {
      access: "public",
    });

    // Save to database
    const result = await pool.query(
      `INSERT INTO files (user_id, filename, original_name, size, mime_type, storage_url, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        decoded.userId,
        filename,
        req.headers["x-filename"] || "file.pdf",
        buffer.length,
        req.headers["content-type"] || "application/pdf",
        blob.url,
        "uploaded",
      ]
    );

    res.status(200).json({
      success: true,
      file_id: result.rows[0].id,
      filename: blob.url,
      size: buffer.length,
      message: "File uploaded successfully",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
}
