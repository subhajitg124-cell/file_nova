import type { Request, Response, NextFunction } from "express";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_HASH = process.env.ADMIN_HASH;

if (!ADMIN_USERNAME || !ADMIN_HASH) {
  console.warn('⚠️  ADMIN_USERNAME or ADMIN_HASH not configured in environment — admin routes will be inaccessible');
}

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const username = req.headers["x-admin-username"];
  const hash = req.headers["x-admin-hash"];

  if (ADMIN_USERNAME && ADMIN_HASH && username === ADMIN_USERNAME && hash === ADMIN_HASH) {
    return next();
  }

  return res.status(403).json({ error: "Access denied. Unauthorized admin access." });
}
