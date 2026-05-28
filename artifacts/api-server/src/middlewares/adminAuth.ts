import type { Request, Response, NextFunction } from "express";

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const username = req.headers["x-admin-username"];
  const hash = req.headers["x-admin-hash"];

  // Default credentials: subhajitghosh / Subhajit@56 (base64 hash of password is U3ViaGFqaXRANTY=)
  const expectedUsername = process.env.ADMIN_USERNAME || "subhajitghosh";
  const expectedHash = process.env.ADMIN_HASH || "U3ViaGFqaXRANTY=";

  if (username === expectedUsername && hash === expectedHash) {
    return next();
  }

  return res.status(403).json({ error: "Access denied. Unauthorized admin access." });
}
