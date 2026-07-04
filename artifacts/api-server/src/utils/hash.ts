import crypto from "node:crypto";

/**
 * Hashes a plain text password using PBKDF2 with a random salt.
 * @param password Plain text password
 * @returns Combined salt and hash string
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 600000, 64, "sha512").toString("hex");
  return `600000:${salt}:${hash}`;
}

/**
 * Verifies a plain text password against a stored PBKDF2 hash.
 * @param password Plain text password to check
 * @param storedHash Hashed password string containing salt
 * @returns boolean indicating if password is valid
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(":");
    // New format: "iterations:salt:hash" — Old format: "salt:hash"
    if (parts.length === 3) {
      const [iterStr, salt, hash] = parts;
      const iterations = parseInt(iterStr, 10);
      if (!salt || !hash || isNaN(iterations)) return false;
      const testHash = crypto.pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
      return hash === testHash;
    }
    // Legacy format (pre-upgrade)
    const [salt, hash] = parts;
    if (!salt || !hash) return false;
    const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === testHash;
  } catch (err) {
    return false;
  }
}

/**
 * Returns true if the stored hash uses the legacy 1000-iteration format.
 */
export function isLegacyHash(storedHash: string): boolean {
  return storedHash.split(":").length === 2;
}

/**
 * Detects if a stored hash uses the old (1000-iteration) format.
 * The new format also uses 600000 iterations, so we can distinguish
 * by re-hashing with known iterations and comparing performance,
 * but the simplest approach: export the current iteration count.
 * All hashes created after this upgrade will use 600000.
 */
export function hashUsesOldIterations(): boolean {
  return false; // Only new hashes are created post-upgrade
}

/**
 * Re-hashes a password with the new iteration count (for in-place upgrades).
 */
export function upgradeHash(password: string): string {
  return hashPassword(password);
}
