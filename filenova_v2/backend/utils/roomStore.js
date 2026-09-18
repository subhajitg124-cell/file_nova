'use strict';

/**
 * Minimal room persistence: in-memory Map + JSON-file snapshot.
 * Stores ONLY: id, codeHash, salt, pinHash?, expiry, status flags, counts.
 * Never stores plain room codes.
 */

const fs = require('fs');
const path = require('path');

function resolveDataFile() {
  const configured = process.env.DATA_FILE || './data/rooms.json';
  return path.isAbsolute(configured)
    ? configured
    : path.resolve(__dirname, '..', configured);
}

const DATA_FILE = resolveDataFile();

/** @type {Map<string, object>} id -> room */
const roomsById = new Map();
/** @type {Map<string, string>} codeHash -> id */
const idByCodeHash = new Map();

function isExpired(room, now = Date.now()) {
  return !room || typeof room.expiresAt !== 'number' || room.expiresAt <= now;
}

function toPublicStatus(room) {
  return {
    roomId: room.id,
    status: room.status,
    receiverJoined: !!room.receiverJoined,
    fileCount: room.fileCount || 0,
    textCount: room.textCount || 0,
    expiresAt: room.expiresAt,
    expiresIn: room.expiresIn,
    hasPin: !!room.hasPin,
  };
}

function persist() {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    const tmp = DATA_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify([...roomsById.values()], null, 2), 'utf8');
    fs.renameSync(tmp, DATA_FILE);
  } catch (err) {
    console.error('[roomStore] persist failed:', err.message);
  }
}

function load() {
  try {
    if (!fs.existsSync(DATA_FILE)) return;
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return;
    const now = Date.now();
    for (const r of arr) {
      if (!r || !r.id || !r.codeHash || isExpired(r, now)) continue;
      roomsById.set(r.id, r);
      idByCodeHash.set(r.codeHash, r.id);
    }
  } catch (err) {
    console.error('[roomStore] load failed (starting empty):', err.message);
  }
}

function codeHashExists(codeHash) {
  const id = idByCodeHash.get(codeHash);
  if (!id) return false;
  const room = roomsById.get(id);
  if (!room || isExpired(room)) {
    if (room) deleteRoom(room.id);
    return false;
  }
  return true;
}

function saveRoom(room) {
  roomsById.set(room.id, room);
  idByCodeHash.set(room.codeHash, room.id);
  persist();
}

function findByCodeHash(codeHash) {
  const id = idByCodeHash.get(codeHash);
  if (!id) return null;
  const room = roomsById.get(id) || null;
  if (room && isExpired(room)) {
    deleteRoom(room.id);
    return null;
  }
  return room;
}

function findById(id) {
  const room = roomsById.get(id) || null;
  if (room && isExpired(room)) {
    deleteRoom(room.id);
    return null;
  }
  return room;
}

function markJoined(id) {
  const room = findById(id);
  if (!room) return null;
  room.receiverJoined = true;
  room.status = 'receiver-joined';
  room.joinedAt = Date.now();
  persist();
  return room;
}

function setStatus(id, status) {
  const room = findById(id);
  if (!room) return null;
  room.status = status;
  persist();
  return room;
}

function bumpFileCount(id) {
  const room = findById(id);
  if (!room) return null;
  room.fileCount = (room.fileCount || 0) + 1;
  room.status = 'done';
  persist();
  return room;
}

function bumpTextCount(id) {
  const room = findById(id);
  if (!room) return null;
  room.textCount = (room.textCount || 0) + 1;
  persist();
  return room;
}

function deleteRoom(id) {
  const room = roomsById.get(id);
  if (!room) return false;
  roomsById.delete(id);
  if (room.codeHash && idByCodeHash.get(room.codeHash) === id) {
    idByCodeHash.delete(room.codeHash);
  }
  persist();
  return true;
}

/** Remove expired rooms; returns array of removed rooms (caller deletes blobs). */
function purgeExpired(now = Date.now()) {
  const removed = [];
  for (const [id, room] of roomsById) {
    if (isExpired(room, now)) {
      roomsById.delete(id);
      if (room.codeHash && idByCodeHash.get(room.codeHash) === id) {
        idByCodeHash.delete(room.codeHash);
      }
      removed.push(room);
    }
  }
  if (removed.length) persist();
  return removed;
}

function count() {
  return roomsById.size;
}

load();

module.exports = {
  codeHashExists,
  saveRoom,
  findByCodeHash,
  findById,
  markJoined,
  setStatus,
  bumpFileCount,
  bumpTextCount,
  deleteRoom,
  purgeExpired,
  toPublicStatus,
  isExpired,
  count,
};
