'use strict';

/**
 * Step 2 — Room lifecycle API.
 *
 * POST /api/rooms       create room  { expiresIn: 10m|30m|1h|24h, pin?: "1234" }
 * POST /api/rooms/join  join room    { code: "AB12X9", pin?: "1234" }
 * GET  /api/rooms/:id/status         poll status (roomId is UUID, never the code)
 *
 * Security notes:
 * - Plain codes are returned ONCE at creation and never stored.
 * - Lookup is by SHA-256(code + pepper); brute-force is slowed by join rate-limit.
 * - PINs are salted + hashed, verified with timingSafeEqual.
 */

const express = require('express');
const crypto = require('../utils/crypto');
const roomStore = require('../utils/roomStore');
const { fingerprintRequired, fingerprintOptional } = require('../middleware/auth');
const { createRoomLimiter, joinLimiter, statusLimiter } = require('../middleware/rateLimit');

const router = express.Router();

const ALLOWED_TTLS = ['10m', '30m', '1h', '24h'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── Create ──────────────────────────────────────────────────────────

router.post('/', fingerprintRequired, createRoomLimiter, (req, res) => {
  const { expiresIn, pin } = req.body || {};

  if (!ALLOWED_TTLS.includes(expiresIn)) {
    return res.status(400).json({
      error: 'invalid_expiresIn',
      message: 'expiresIn must be one of: 10m, 30m, 1h, 24h.',
      howToFix: 'Send { "expiresIn": "30m" } in the request body.',
    });
  }

  if (pin !== undefined && pin !== null && pin !== '' && !crypto.isValidPin(pin)) {
    return res.status(400).json({
      error: 'invalid_pin',
      message: 'PIN must be exactly 4 digits, or omitted.',
      howToFix: 'Send { "pin": "4821" } or leave pin out.',
    });
  }

  // Unique code (retry on the astronomically unlikely collision).
  let code = null;
  let codeHash = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = crypto.generateRoomCode();
    const hashed = crypto.hashRoomCode(candidate);
    if (!roomStore.codeHashExists(hashed)) {
      code = candidate;
      codeHash = hashed;
      break;
    }
  }
  if (!code) {
    return res.status(503).json({
      error: 'code_collision',
      message: 'Could not allocate a room code. Please try again.',
    });
  }

  let pinSalt = null;
  let pinHash = null;
  if (crypto.isValidPin(pin)) {
    pinSalt = crypto.generateSalt();
    pinHash = crypto.hashPin(pin, pinSalt);
  }

  const ttl = crypto.ttlFor(expiresIn);
  const now = Date.now();
  const room = {
    id: crypto.generateRoomId(),
    codeHash,
    salt: crypto.generateSalt(8),
    hasPin: !!pinHash,
    pinSalt,
    pinHash,
    expiresIn,
    expiresAt: now + ttl,
    createdAt: now,
    creatorFingerprintHash: req.fingerprintHash,
    status: 'waiting',
    receiverJoined: false,
    fileCount: 0,
    textCount: 0,
  };
  roomStore.saveRoom(room);

  // Notify lobby listeners (Step 7 uses this for realtime sender UX).
  const io = req.app.get('io');
  if (io) io.emit('room:created', { roomId: room.id, expiresAt: room.expiresAt });

  return res.status(201).json({
    roomId: room.id,
    code, // plain code returned ONCE — never stored, never returned again
    salt: room.salt, // non-secret KDF salt so both browsers derive the same room key
    expiresIn,
    expiresAt: room.expiresAt,
    hasPin: room.hasPin,
  });
});

// ── Join ────────────────────────────────────────────────────────────

router.post('/join', fingerprintRequired, joinLimiter, (req, res) => {
  const { code, pin } = req.body || {};

  if (!crypto.isValidCodeFormat(code)) {
    return res.status(404).json({
      error: 'room_not_found',
      message: 'No active room matches that code.',
      howToFix: 'Check the 6-character code and try again before it expires.',
    });
  }

  const room = roomStore.findByCodeHash(crypto.hashRoomCode(code));
  if (!room) {
    // Same response as bad format — don't leak which codes exist.
    return res.status(404).json({
      error: 'room_not_found',
      message: 'No active room matches that code (it may have expired).',
      howToFix: 'Ask the sender for a fresh code.',
    });
  }

  if (room.hasPin) {
    if (!crypto.verifyPin(pin, room.pinSalt, room.pinHash)) {
      return res.status(403).json({
        error: 'invalid_pin',
        message: 'This room needs a 4-digit PIN.',
        howToFix: 'Ask the sender for the room PIN.',
      });
    }
  }

  const updated = roomStore.markJoined(room.id);
  const io = req.app.get('io');
  if (io) {
    io.to(`room:${room.id}`).emit('room:status', {
      roomId: room.id,
      status: 'receiver-joined',
      receiverJoined: true,
    });
  }

  return res.json({
    ...roomStore.toPublicStatus(updated || room),
    salt: room.salt, // non-secret KDF salt for client-side key derivation
    message: 'Receiver joined!',
  });
});

// ── Status ──────────────────────────────────────────────────────────

router.get('/:id/status', fingerprintOptional, statusLimiter, (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) {
    return res.status(400).json({
      error: 'invalid_room_id',
      message: 'Room ID must be a valid UUID v4.',
    });
  }
  const room = roomStore.findById(id);
  if (!room) {
    return res.status(410).json({
      error: 'room_expired',
      message: 'This room has expired and was hard-deleted.',
      howToFix: 'Ask the sender to create a new room.',
    });
  }
  return res.json(roomStore.toPublicStatus(room));
});

module.exports = router;
