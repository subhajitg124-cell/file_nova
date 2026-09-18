'use strict';

/**
 * Encrypted-blob file store (Step 3).
 *
 * The server treats all bytes as OPAQUE: clients encrypt with AES-256-GCM
 * (key derived from the room code) before upload, so the server never sees
 * plaintext, filenames, or MIME types. Metadata fields below (encName,
 * encSize, encMime) are client-encrypted JSON {iv, data} objects.
 *
 * On-disk layout per room (roomId is a validated UUID, so no traversal):
 *   uploads/<roomId>/<fileId>.meta.json   — counters + encrypted metadata
 *   uploads/<roomId>/<fileId>.bin         — framed encrypted chunks:
 *                                          [4B big-endian len][12B IV][ciphertext]*
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const CHUNK_PLAIN_BYTES = Number(process.env.CHUNK_PLAIN_BYTES || 1048576); // 1 MiB (low-bandwidth friendly)
const CHUNK_UPLOAD_MAX_BYTES = Number(process.env.CHUNK_UPLOAD_MAX_BYTES || 2 * 1024 * 1024);
const MAX_FILE_BYTES = Number(process.env.MAX_FILE_BYTES || 2 * 1024 * 1024 * 1024); // 2 GB
const MAX_FILES_PER_ROOM = Number(process.env.MAX_FILES_PER_ROOM || 20);
const IV_BYTES = 12;
const FRAME_HEADER_BYTES = 4;

function resolveUploadDir() {
  const configured = process.env.UPLOAD_DIR || './uploads';
  return path.isAbsolute(configured)
    ? configured
    : path.resolve(__dirname, '..', configured);
}

function roomDir(roomId) {
  return path.join(resolveUploadDir(), roomId);
}

function metaPath(roomId, fileId) {
  return path.join(roomDir(roomId), `${fileId}.meta.json`);
}

function binPath(roomId, fileId) {
  return path.join(roomDir(roomId), `${fileId}.bin`);
}

function readMeta(roomId, fileId) {
  try {
    return JSON.parse(fs.readFileSync(metaPath(roomId, fileId), 'utf8'));
  } catch {
    return null;
  }
}

function writeMeta(roomId, fileId, meta) {
  fs.mkdirSync(roomDir(roomId), { recursive: true });
  const tmp = metaPath(roomId, fileId) + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(meta), 'utf8');
  fs.renameSync(tmp, metaPath(roomId, fileId));
}

/** Metadata the server may return to receivers (no raw fingerprints). */
function publicMeta(meta) {
  if (!meta) return null;
  const { creatorHash, ...rest } = meta;
  return rest;
}

function isEncField(v) {
  return (
    v &&
    typeof v === 'object' &&
    typeof v.iv === 'string' &&
    typeof v.data === 'string' &&
    v.iv.length <= 64 &&
    v.data.length <= 4 * 1024 * 1024
  );
}

function initFile({ roomId, totalChunks, encName, encSize, encMime }) {
  if (!Number.isInteger(totalChunks) || totalChunks < 1 || totalChunks > 2048) {
    const err = new Error('totalChunks must be an integer between 1 and 2048.');
    err.status = 400;
    err.code = 'invalid_totalChunks';
    throw err;
  }
  if (!isEncField(encName) || !isEncField(encSize) || !isEncField(encMime)) {
    const err = new Error('encName, encSize and encMime must be {iv, data} encrypted fields.');
    err.status = 400;
    err.code = 'invalid_encmeta';
    throw err;
  }
  const existing = listRoomFiles(roomId);
  if (existing.length >= MAX_FILES_PER_ROOM) {
    const err = new Error(`Room file limit reached (${MAX_FILES_PER_ROOM}).`);
    err.status = 400;
    err.code = 'room_file_limit';
    throw err;
  }
  const fileId = uuidv4();
  const meta = {
    fileId,
    roomId,
    totalChunks,
    receivedChunks: 0,
    complete: false,
    encName,
    encSize,
    encMime,
    createdAt: Date.now(),
  };
  writeMeta(roomId, fileId, meta);
  fs.writeFileSync(binPath(roomId, fileId), Buffer.alloc(0));
  return { fileId, chunkPlainBytes: CHUNK_PLAIN_BYTES, receivedChunks: 0 };
}

function appendChunk({ roomId, fileId, index, iv, data }) {
  const meta = readMeta(roomId, fileId);
  if (!meta) {
    const err = new Error('Unknown file. Initialise the upload first.');
    err.status = 404;
    err.code = 'file_not_found';
    throw err;
  }
  if (meta.complete) {
    const err = new Error('Upload already completed.');
    err.status = 400;
    err.code = 'already_complete';
    throw err;
  }
  if (index !== meta.receivedChunks) {
    const err = new Error(`Chunk out of order. Expected index ${meta.receivedChunks}.`);
    err.status = 400;
    err.code = 'chunk_out_of_order';
    err.expected = meta.receivedChunks;
    throw err;
  }
  if (!Buffer.isBuffer(iv) || iv.length !== IV_BYTES) {
    const err = new Error('IV must be exactly 12 bytes.');
    err.status = 400;
    err.code = 'invalid_iv';
    throw err;
  }
  if (!Buffer.isBuffer(data) || data.length < 1 || data.length > CHUNK_UPLOAD_MAX_BYTES) {
    const err = new Error(`Chunk must be 1–${CHUNK_UPLOAD_MAX_BYTES} bytes.`);
    err.status = 400;
    err.code = 'invalid_chunk_size';
    throw err;
  }
  const currentSize = fs.statSync(binPath(roomId, fileId)).size;
  if (currentSize + FRAME_HEADER_BYTES + IV_BYTES + data.length > MAX_FILE_BYTES + 16 * 2048 + 4096) {
    const err = new Error('File exceeds the 2 GB limit.');
    err.status = 400;
    err.code = 'file_too_large';
    throw err;
  }
  const header = Buffer.alloc(FRAME_HEADER_BYTES);
  header.writeUInt32BE(IV_BYTES + data.length, 0);
  fs.appendFileSync(binPath(roomId, fileId), Buffer.concat([header, iv, data]));
  meta.receivedChunks += 1;
  writeMeta(roomId, fileId, meta);
  return { receivedChunks: meta.receivedChunks, totalChunks: meta.totalChunks };
}

function getState(roomId, fileId) {
  const meta = readMeta(roomId, fileId);
  if (!meta) {
    const err = new Error('Unknown file.');
    err.status = 404;
    err.code = 'file_not_found';
    throw err;
  }
  return {
    fileId,
    receivedChunks: meta.receivedChunks,
    totalChunks: meta.totalChunks,
    complete: meta.complete,
  };
}

function completeFile(roomId, fileId) {
  const meta = readMeta(roomId, fileId);
  if (!meta) {
    const err = new Error('Unknown file.');
    err.status = 404;
    err.code = 'file_not_found';
    throw err;
  }
  if (meta.receivedChunks !== meta.totalChunks) {
    const err = new Error(`Incomplete upload (${meta.receivedChunks}/${meta.totalChunks} chunks).`);
    err.status = 400;
    err.code = 'incomplete_upload';
    throw err;
  }
  meta.complete = true;
  meta.completedAt = Date.now();
  try {
    meta.storedBytes = fs.statSync(binPath(roomId, fileId)).size;
  } catch {
    meta.storedBytes = 0;
  }
  writeMeta(roomId, fileId, meta);
  return publicMeta(meta);
}

function listRoomFiles(roomId) {
  const dir = roomDir(roomId);
  let entries = [];
  try {
    entries = fs.readdirSync(dir).filter((f) => f.endsWith('.meta.json'));
  } catch {
    return [];
  }
  const out = [];
  for (const e of entries) {
    try {
      const meta = JSON.parse(fs.readFileSync(path.join(dir, e), 'utf8'));
      if (meta && meta.fileId) out.push(publicMeta(meta));
    } catch {
      // skip corrupt entries; cleanup cron removes them with the room
    }
  }
  out.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  return out;
}

function openDownloadStream(roomId, fileId) {
  const meta = readMeta(roomId, fileId);
  if (!meta || !meta.complete) {
    const err = new Error('File not available (unknown or upload incomplete).');
    err.status = meta ? 409 : 404;
    err.code = meta ? 'incomplete_upload' : 'file_not_found';
    throw err;
  }
  return { meta: publicMeta(meta), stream: fs.createReadStream(binPath(roomId, fileId)) };
}

function deleteRoomFiles(roomId) {
  const dir = roomDir(roomId);
  try {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  } catch (err) {
    console.error(`[fileStore] failed to delete ${roomId}:`, err.message);
  }
}

module.exports = {
  CHUNK_PLAIN_BYTES,
  CHUNK_UPLOAD_MAX_BYTES,
  MAX_FILE_BYTES,
  MAX_FILES_PER_ROOM,
  IV_BYTES,
  FRAME_HEADER_BYTES,
  initFile,
  appendChunk,
  getState,
  completeFile,
  listRoomFiles,
  openDownloadStream,
  deleteRoomFiles,
  publicMeta,
};
