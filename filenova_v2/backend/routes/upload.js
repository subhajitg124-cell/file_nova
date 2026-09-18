'use strict';

/**
 * Step 3 — Encrypted chunked upload API. All file bytes are opaque to the server
 * (clients AES-256-GCM encrypt before sending; see frontend/js/crypto.js).
 *
 * POST /api/upload/init            { roomId, totalChunks, encName, encSize, encMime }
 * POST /api/upload/chunk           multipart: roomId, fileId, index, iv(b64), chunk(binary)
 * GET  /api/upload/:fileId/state?roomId=...
 * POST /api/upload/complete        { roomId, fileId }
 */

const express = require('express');
const multer = require('multer');
const roomStore = require('../utils/roomStore');
const fileStore = require('../utils/fileStore');
const { fingerprintRequired } = require('../middleware/auth');
const { initLimiter, chunkLimiter } = require('../middleware/rateLimit');

const router = express.Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: fileStore.CHUNK_UPLOAD_MAX_BYTES + 1024, files: 1, fields: 10 },
});

function requireLiveRoom(roomId, res) {
  if (typeof roomId !== 'string' || !UUID_RE.test(roomId)) {
    res.status(400).json({ error: 'invalid_room_id', message: 'roomId must be a valid UUID v4.' });
    return null;
  }
  const room = roomStore.findById(roomId);
  if (!room) {
    res.status(410).json({
      error: 'room_expired',
      message: 'This room has expired and was hard-deleted.',
      howToFix: 'Ask the sender to create a new room.',
    });
    return null;
  }
  return room;
}

function sendStoreError(res, err) {
  const status = err.status || 500;
  const body = { error: err.code || 'upload_error', message: err.message || 'Upload failed.' };
  if (err.code === 'chunk_out_of_order') body.expectedIndex = err.expected;
  return res.status(status).json(body);
}

router.post('/init', fingerprintRequired, initLimiter, (req, res) => {
  const { roomId, totalChunks, encName, encSize, encMime } = req.body || {};
  const room = requireLiveRoom(roomId, res);
  if (!room) return;
  try {
    const out = fileStore.initFile({ roomId, totalChunks, encName, encSize, encMime });
    const io = req.app.get('io');
    if (io) {
      roomStore.setStatus(roomId, 'sending');
      io.to(`room:${roomId}`).emit('room:status', { roomId, status: 'sending' });
    }
    return res.status(201).json(out);
  } catch (err) {
    return sendStoreError(res, err);
  }
});

router.post('/chunk', fingerprintRequired, chunkLimiter, upload.single('chunk'), (req, res) => {
  const { roomId, fileId, index, iv } = req.body || {};
  const room = requireLiveRoom(roomId, res);
  if (!room) return;
  if (typeof fileId !== 'string' || !UUID_RE.test(fileId)) {
    return res.status(400).json({ error: 'invalid_file_id', message: 'fileId must be a valid UUID v4.' });
  }
  const idx = Number(index);
  if (!Number.isInteger(idx) || idx < 0) {
    return res.status(400).json({ error: 'invalid_index', message: 'index must be a non-negative integer.' });
  }
  let ivBuf = null;
  try {
    ivBuf = Buffer.from(String(iv || ''), 'base64');
  } catch {
    ivBuf = null;
  }
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({
      error: 'missing_chunk',
      message: 'Attach the encrypted chunk as multipart field "chunk".',
    });
  }
  try {
    const out = fileStore.appendChunk({ roomId, fileId, index: idx, iv: ivBuf, data: req.file.buffer });
    return res.json(out);
  } catch (err) {
    return sendStoreError(res, err);
  }
});

router.get('/:fileId/state', fingerprintRequired, (req, res) => {
  const { fileId } = req.params;
  const { roomId } = req.query;
  const room = requireLiveRoom(roomId, res);
  if (!room) return;
  if (!UUID_RE.test(fileId)) {
    return res.status(400).json({ error: 'invalid_file_id', message: 'fileId must be a valid UUID v4.' });
  }
  try {
    return res.json(fileStore.getState(roomId, fileId));
  } catch (err) {
    return sendStoreError(res, err);
  }
});

router.post('/complete', fingerprintRequired, initLimiter, (req, res) => {
  const { roomId, fileId } = req.body || {};
  const room = requireLiveRoom(roomId, res);
  if (!room) return;
  if (typeof fileId !== 'string' || !UUID_RE.test(fileId)) {
    return res.status(400).json({ error: 'invalid_file_id', message: 'fileId must be a valid UUID v4.' });
  }
  try {
    const meta = fileStore.completeFile(roomId, fileId);
    const updated = roomStore.bumpFileCount(roomId);
    const io = req.app.get('io');
    if (io) {
      io.to(`room:${roomId}`).emit('room:status', {
        roomId,
        status: 'file-ready',
        file: meta,
        fileCount: updated ? updated.fileCount : undefined,
      });
    }
    return res.json({ ...meta, message: 'File received ✓' });
  } catch (err) {
    return sendStoreError(res, err);
  }
});

module.exports = router;
