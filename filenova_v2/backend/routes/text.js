'use strict';

/**
 * Encrypted text / code-snippet API.
 * Clients encrypt {text} with the room key before POST; the server stores
 * ciphertext only, plus the (plaintext) language tag for highlighting.
 *
 * POST /api/texts   { roomId, iv, data, language?, title? }
 * GET  /api/texts?roomId=...
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const roomStore = require('../utils/roomStore');
const { fingerprintRequired } = require('../middleware/auth');
const { textLimiter } = require('../middleware/rateLimit');

const router = express.Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_TEXTS_PER_ROOM = Number(process.env.MAX_TEXTS_PER_ROOM || 50);
const MAX_TEXT_CIPHERTEXT_CHARS = Number(process.env.MAX_TEXT_CIPHERTEXT_CHARS || 180 * 1024);
const LANGUAGES = new Set([
  'plain', 'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
  'go', 'rust', 'php', 'ruby', 'html', 'css', 'json', 'bash', 'sql', 'yaml', 'markdown',
]);

function textsPath(roomId) {
  const base = process.env.UPLOAD_DIR || './uploads';
  const dir = path.isAbsolute(base) ? base : path.resolve(__dirname, '..', base);
  return path.join(dir, roomId, 'texts.json');
}

function readTexts(roomId) {
  try {
    const arr = JSON.parse(fs.readFileSync(textsPath(roomId), 'utf8'));
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeTexts(roomId, arr) {
  const p = textsPath(roomId);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(arr), 'utf8');
  fs.renameSync(tmp, p);
}

function requireLiveRoom(roomId, res) {
  if (typeof roomId !== 'string' || !UUID_RE.test(roomId)) {
    res.status(400).json({ error: 'invalid_room_id', message: 'roomId must be a valid UUID v4.' });
    return null;
  }
  const room = roomStore.findById(roomId);
  if (!room) {
    res.status(410).json({ error: 'room_expired', message: 'This room has expired and was hard-deleted.' });
    return null;
  }
  return room;
}

router.post('/', fingerprintRequired, textLimiter, (req, res) => {
  const { roomId, iv, data, language, title } = req.body || {};
  const room = requireLiveRoom(roomId, res);
  if (!room) return;
  if (typeof iv !== 'string' || typeof data !== 'string' || !iv || !data) {
    return res.status(400).json({
      error: 'invalid_payload',
      message: 'Send client-encrypted { iv, data } (base64 AES-256-GCM).',
    });
  }
  if (iv.length > 64 || data.length > MAX_TEXT_CIPHERTEXT_CHARS) {
    return res.status(400).json({ error: 'text_too_large', message: 'Snippet exceeds the size limit (~130 KB of text).' });
  }
  const lang = typeof language === 'string' && LANGUAGES.has(language.toLowerCase()) ? language.toLowerCase() : 'plain';
  const cleanTitle = typeof title === 'string' ? title.slice(0, 80) : '';
  const existing = readTexts(roomId);
  if (existing.length >= MAX_TEXTS_PER_ROOM) {
    return res.status(400).json({ error: 'room_text_limit', message: `Room text limit reached (${MAX_TEXTS_PER_ROOM}).` });
  }
  const item = { id: uuidv4(), iv, data, language: lang, title: cleanTitle, createdAt: Date.now() };
  existing.push(item);
  writeTexts(roomId, existing);
  const updated = roomStore.bumpTextCount(roomId);
  const io = req.app.get('io');
  if (io) {
    io.to(`room:${roomId}`).emit('room:status', {
      roomId, status: 'text-added', text: item, textCount: updated ? updated.textCount : undefined,
    });
  }
  return res.status(201).json(item);
});

router.get('/', fingerprintRequired, textLimiter, (req, res) => {
  const room = requireLiveRoom(req.query.roomId, res);
  if (!room) return;
  return res.json({ texts: readTexts(room.id) });
});

module.exports = router;
