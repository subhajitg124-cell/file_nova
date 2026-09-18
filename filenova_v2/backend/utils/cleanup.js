'use strict';

/**
 * Auto-delete expired rooms (hard delete: metadata + encrypted blobs).
 * Runs every minute via node-cron. Also callable directly in tests.
 */

const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

function resolveUploadDir() {
  const configured = process.env.UPLOAD_DIR || './uploads';
  return path.isAbsolute(configured)
    ? configured
    : path.resolve(__dirname, '..', configured);
}

function deleteRoomBlobs(roomId) {
  const dir = path.join(resolveUploadDir(), roomId);
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (err) {
    console.error(`[cleanup] failed to delete blobs for ${roomId}:`, err.message);
  }
}

function sweep(roomStore) {
  const removed = roomStore.purgeExpired(Date.now());
  for (const room of removed) {
    deleteRoomBlobs(room.id);
  }
  if (removed.length) {
    console.log(`[cleanup] hard-deleted ${removed.length} expired room(s).`);
  }
  return removed.length;
}

function startCleanup(roomStore) {
  const task = cron.schedule('* * * * *', () => sweep(roomStore));
  return task;
}

module.exports = { startCleanup, sweep, deleteRoomBlobs };
