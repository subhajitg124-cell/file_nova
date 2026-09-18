'use strict';

/**
 * Server-side crypto helpers for FileNova v2.
 * - Room codes: 6-char unambiguous alphabet, hashed with pepper (never stored plain).
 * - Room PIN: salted SHA-256 + timing-safe verify.
 * - AES-256-GCM helpers are ready for Step 3 (encrypted blobs at rest).
 */

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const CODE_LENGTH = 6;
// No 0/O/1/I — avoids typing mistakes on mid-range phones.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const ROOM_TTL_MS = {
  '10m': 10 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
};

function getPepper() {
  const pepper = process.env.ROOM_CODE_PEPPER || '';
  if (!pepper || pepper.length < 16) {
    throw new Error(
      'ROOM_CODE_PEPPER is missing or too short. Set a 32+ char random string in backend/.env (see .env.example).'
    );
  }
  return pepper;
}

function normalizeCode(input) {
  return String(input || '').trim().toUpperCase();
}

function isValidCodeFormat(code) {
  const c = normalizeCode(code);
  if (c.length !== CODE_LENGTH) return false;
  for (const ch of c) {
    if (!CODE_ALPHABET.includes(ch)) return false;
  }
  return true;
}

/** Unique 6-char room code, e.g. "AB12X9". Uses crypto.randomBytes (CSPRNG). */
function generateRoomCode() {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

/** Deterministic hash for code lookup. Server never stores the plain code. */
function hashRoomCode(code) {
  const c = normalizeCode(code);
  return crypto.createHash('sha256').update(c + '::' + getPepper(), 'utf8').digest('hex');
}

function generateRoomId() {
  return uuidv4();
}

function generateSalt(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex');
}

function isValidPin(pin) {
  return typeof pin === 'string' && /^\d{4}$/.test(pin);
}

function hashPin(pin, salt) {
  return crypto.createHash('sha256').update(`${salt}::${pin}`, 'utf8').digest('hex');
}

/** Timing-safe PIN comparison (hex strings). */
function verifyPin(pin, salt, expectedHash) {
  if (!isValidPin(pin) || !salt || !expectedHash) return false;
  const actual = hashPin(pin, salt);
  const a = Buffer.from(actual, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** SHA-256 of an opaque client fingerprint (browser fp + timestamp). Raw value never stored. */
function hashFingerprint(fp) {
  return crypto.createHash('sha256').update(String(fp), 'utf8').digest('hex');
}

function ttlFor(expiresIn) {
  return ROOM_TTL_MS[expiresIn] || null;
}

// ── AES-256-GCM (used by Step 3 upload encryption; provided now so the API is stable) ──

function encryptBufferAES256GCM(plaintext, key) {
  if (!Buffer.isBuffer(plaintext)) throw new TypeError('plaintext must be a Buffer');
  if (!Buffer.isBuffer(key) || key.length !== 32) throw new TypeError('key must be a 32-byte Buffer');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv, ciphertext, tag };
}

function decryptBufferAES256GCM({ iv, ciphertext, tag }, key) {
  if (!Buffer.isBuffer(key) || key.length !== 32) throw new TypeError('key must be a 32-byte Buffer');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

module.exports = {
  CODE_LENGTH,
  CODE_ALPHABET,
  ROOM_TTL_MS,
  getPepper,
  normalizeCode,
  isValidCodeFormat,
  generateRoomCode,
  hashRoomCode,
  generateRoomId,
  generateSalt,
  isValidPin,
  hashPin,
  verifyPin,
  hashFingerprint,
  ttlFor,
  encryptBufferAES256GCM,
  decryptBufferAES256GCM,
};
