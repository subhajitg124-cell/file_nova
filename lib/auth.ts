import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "filenova-fallback-secret-key-123!";

export interface TokenPayload {
  userId: number;
  email: string;
  tier: string;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
  });
}
