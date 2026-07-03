import crypto from "node:crypto";

const TOKEN_TTL_MS = 30 * 60 * 1000;
const tokens = new Map<string, { token: string; userId: string; expiresAt: number }>();

export class PaymentTokenService {
  static issueToken(userId: string): string {
    const token = crypto.randomBytes(32).toString("hex");
    tokens.set(`payment_token:${userId}`, {
      token,
      userId,
      expiresAt: Date.now() + TOKEN_TTL_MS,
    });
    return token;
  }

  static verifyToken(userId: string, token: string): boolean {
    const entry = tokens.get(`payment_token:${userId}`);
    if (!entry) return false;
    if (entry.expiresAt < Date.now()) {
      tokens.delete(`payment_token:${userId}`);
      return false;
    }
    if (entry.token !== token) return false;
    tokens.delete(`payment_token:${userId}`);
    return true;
  }

  static cleanup() {
    const now = Date.now();
    for (const [key, value] of tokens) {
      if (value.expiresAt < now) tokens.delete(key);
    }
  }
}

setInterval(() => PaymentTokenService.cleanup(), 60_000);
