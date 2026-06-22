import { Router, type Request, type Response } from "express";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

const router = Router();
const SHARES_DIR = path.join(os.tmpdir(), "filenova-shares");

if (!fs.existsSync(SHARES_DIR)) {
  fs.mkdirSync(SHARES_DIR, { recursive: true });
}

// In-memory daily share counts tracker
const dailyShares = new Map<string, { count: number; date: string }>();

function checkAndIncrementShareLimit(identifier: string, isPro: boolean): boolean {
  if (isPro) return true;
  const today = new Date().toISOString().split("T")[0];
  const record = dailyShares.get(identifier);
  if (record && record.date === today) {
    if (record.count >= 3) {
      return false;
    }
    record.count += 1;
  } else {
    dailyShares.set(identifier, { count: 1, date: today });
  }
  return true;
}

// Helper to cleanup expired files periodically
function cleanupExpiredShares() {
  try {
    const files = fs.readdirSync(SHARES_DIR);
    const now = Date.now();
    for (const file of files) {
      if (file.endsWith(".json")) {
        const metaPath = path.join(SHARES_DIR, file);
        try {
          const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
          if (now > meta.expiresAt) {
            fs.unlinkSync(metaPath);
            const binPath = path.join(SHARES_DIR, file.replace(".json", ".bin"));
            if (fs.existsSync(binPath)) {
              fs.unlinkSync(binPath);
            }
          }
        } catch (_) {
          // If metadata is corrupt, delete it
          fs.unlinkSync(metaPath);
        }
      }
    }
  } catch (err) {
    console.error("Error cleaning up expired shares:", err);
  }
}

// Run cleanup every 15 minutes
const shareCleanupTimer = setInterval(cleanupExpiredShares, 15 * 60 * 1000);
shareCleanupTimer.unref();

router.post("/share-file", (req: Request, res: Response): void => {
  const { fileData, fileName, mimeType } = req.body;

  if (!fileData || !fileName || !mimeType) {
    res.status(400).json({ error: "Missing required fields: fileData, fileName, mimeType" });
    return;
  }

  const user = (req as any).user;
  const isPro = user && (user.premiumTier === "pro" || user.premiumTier === "elite" || user.premiumTier === "basic" || user.role === "admin" || user.role === "super_admin");
  const identifier = user?.id || req.ip || "anonymous";

  if (!checkAndIncrementShareLimit(identifier, isPro)) {
    res.status(403).json({
      error: "LIMIT_EXCEEDED",
      message: "Daily sharing limit reached (3 files max for free tier). Upgrade to Pro for unlimited sharing."
    });
    return;
  }

  const shareId = crypto.randomBytes(6).toString("hex");
  const binPath = path.join(SHARES_DIR, `${shareId}.bin`);
  const metaPath = path.join(SHARES_DIR, `${shareId}.json`);

  try {
    const buffer = Buffer.from(fileData, "base64");
    fs.writeFileSync(binPath, buffer);

    const createdAt = Date.now();
    const expiresAt = createdAt + 24 * 60 * 60 * 1000; // 24 hours

    const metadata = {
      fileName,
      mimeType,
      createdAt,
      expiresAt,
      userId: user?.id || null
    };

    fs.writeFileSync(metaPath, JSON.stringify(metadata), "utf8");

    // Return short url structure
    res.json({
      success: true,
      shareId,
      shortUrl: `https://filenova.in/s/${shareId}`,
      downloadUrl: `https://filenova.in/api/share/${shareId}`
    });
  } catch (err) {
    console.error("Failed to save shareable file:", err);
    res.status(500).json({ error: "Internal server error saving shared file" });
  }
});

router.get("/share/:id", (req: Request, res: Response): void => {
  const { id } = req.params;
  const binPath = path.join(SHARES_DIR, `${id}.bin`);
  const metaPath = path.join(SHARES_DIR, `${id}.json`);

  if (!fs.existsSync(metaPath) || !fs.existsSync(binPath)) {
    res.status(404).send(`
      <html>
        <head><title>File Not Found</title></head>
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f8fafc; color: #0f172a; margin: 0;">
          <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <h1 style="margin: 0 0 1rem; color: #ef4444;">Shared Link Expired or Invalid</h1>
            <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 2rem;">Shared files automatically expire and are permanently deleted after 24 hours.</p>
            <a href="https://filenova.in" style="background: #4f46e5; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.5rem; font-weight: bold; font-size: 0.85rem;">Back to FileNova</a>
          </div>
        </body>
      </html>
    `);
    return;
  }

  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    if (Date.now() > meta.expiresAt) {
      // Clean up files
      fs.unlinkSync(metaPath);
      fs.unlinkSync(binPath);

      res.status(410).send(`
        <html>
          <head><title>Link Expired</title></head>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f8fafc; color: #0f172a; margin: 0;">
            <div style="text-align: center; padding: 2rem; background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
              <h1 style="margin: 0 0 1rem; color: #ef4444;">Link Expired</h1>
              <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 2rem;">This shared link has expired. Shared documents are only kept for 24 hours.</p>
              <a href="https://filenova.in" style="background: #4f46e5; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.5rem; font-weight: bold; font-size: 0.85rem;">Back to FileNova</a>
            </div>
          </body>
        </html>
      `);
      return;
    }

    res.setHeader("Content-Disposition", `attachment; filename="${meta.fileName}"`);
    res.setHeader("Content-Type", meta.mimeType);
    res.sendFile(binPath);
  } catch (err) {
    console.error("Failed to stream shared file:", err);
    res.status(500).send("Internal server error downloading file");
  }
});

export default router;
