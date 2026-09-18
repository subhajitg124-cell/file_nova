'use strict';

/**
 * Encrypted file read API (receiver side).
 * Bytes stay opaque: the server streams framed ciphertext; only the receiver's
 * browser (which knows the room code) can decrypt.
 *
 * GET /api/files?roomId=...                 list metas (encrypted name/size/type)
 * GET /api/files/:fileId/meta?roomId=...    single meta
 * GET /api/files/:fileId/download?roomId=.. ciphertext stream (attachment)
 */

const express = require('express');
const roomStore = require('../utils/roomStore');
const fileStore = require('../utils/fileStore');
const { fingerprintRequired } = require('../middleware/auth');
const { fileReadLimiter } = require('../middleware/rateLimit');

const router = express.Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

router.get('/', fingerprintRequired, fileReadLimiter, (req, res) => {
  const room = requireLiveRoom(req.query.roomId, res);
  if (!room) return;
  return res.json({ files: fileStore.listRoomFiles(room.id) });
});

router.get('/:fileId/meta', fingerprintRequired, fileReadLimiter, (req, res) => {
  const room = requireLiveRoom(req.query.roomId, res);
  if (!room) return;
  const { fileId } = req.params;
  if (!UUID_RE.test(fileId)) {
    return res.status(400).json({ error: 'invalid_file_id', message: 'fileId must be a valid UUID v4.' });
  }
  const found = fileStore.listRoomFiles(room.id).find((f) => f.fileId === fileId);
  if (!found) return res.status(404).json({ error: 'file_not_found', message: 'Unknown file.' });
  return res.json(found);
});

router.get('/:fileId/download', fingerprintRequired, fileReadLimiter, (req, res) => {
  const room = requireLiveRoom(req.query.roomId, res);
  if (!room) return;
  const { fileId } = req.params;
  if (!UUID_RE.test(fileId)) {
    return res.status(400).json({ error: 'invalid_file_id', message: 'fileId must be a valid UUID v4.' });
  }
  try {
    const { stream } = fileStore.openDownloadStream(room.id, fileId);
    // Ciphertext only: generic name + attachment so nothing executes in-browser.
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileId}.bin"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    stream.on('error', () => {
      if (!res.headersSent) res.status(500).json({ error: 'read_error', message: 'Could not read file.' });
      else res.end();
    });
    stream.pipe(res);
  } catch (err) {
    return res.status(err.status || 500).json({
      error: err.code || 'download_error',
      message: err.message,
    });
  }
});

module.exports = router;
