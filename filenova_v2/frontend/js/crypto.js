// FileNova v2 — client-side E2E crypto (Web Crypto API).
// Files/texts are AES-256-GCM encrypted BEFORE upload. The key is derived
// via PBKDF2 from (room code + PIN) with the server-provided salt, so both
// browsers independently derive the same key and the server only ever
// stores ciphertext. Wire framing per chunk: [4B BE len][12B IV][ciphertext].
'use strict';

window.FileNova = window.FileNova || {};

const te = new TextEncoder();
const td = new TextDecoder();
const PBKDF2_ITERATIONS = 60000;

function bufToB64(buf) {
  const bytes = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function b64ToBuf(b64) {
  const s = atob(b64);
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes.buffer;
}

async function deriveRoomKey(code, pin, saltHex) {
  const material = await crypto.subtle.importKey(
    'raw', te.encode(`${String(code).toUpperCase()}::${pin || ''}`), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: te.encode(String(saltHex)), iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

async function encryptChunk(key, plaintextU8) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintextU8);
  return { ivB64: bufToB64(iv.buffer), cipher };
}

async function decryptChunk(key, ivB64, cipherBuf) {
  const iv = new Uint8Array(b64ToBuf(ivB64));
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBuf);
}

async function encryptJSON(key, obj) {
  const { ivB64, cipher } = await encryptChunk(key, te.encode(JSON.stringify(obj)));
  return { iv: ivB64, data: bufToB64(cipher) };
}

async function decryptJSON(key, field) {
  const plain = await decryptChunk(key, field.iv, b64ToBuf(field.data));
  return JSON.parse(td.decode(plain));
}

async function encryptText(key, text) {
  const { ivB64, cipher } = await encryptChunk(key, te.encode(text));
  return { iv: ivB64, data: bufToB64(cipher) };
}

async function decryptText(key, iv, data) {
  const plain = await decryptChunk(key, iv, b64ToBuf(data));
  return td.decode(plain);
}

/** Parse server-framed ciphertext, decrypt each frame, concat into plaintext bytes. */
async function decryptFramed(key, arrayBuffer, onProgress) {
  const buf = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  const parts = [];
  let pos = 0, done = 0;
  while (pos + 4 <= buf.length) {
    const len = view.getUint32(pos); pos += 4;
    if (len < 12 || pos + len > buf.length) throw new Error('Corrupt download data.');
    const iv = buf.slice(pos, pos + 12); pos += 12;
    const cipher = buf.slice(pos, pos + len - 12); pos += len - 12;
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv }, key, cipher
    );
    parts.push(new Uint8Array(plain));
    done += 1;
    if (onProgress) onProgress(done);
  }
  if (pos !== buf.length) throw new Error('Corrupt download data.');
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

window.FileNova.crypto = {
  bufToB64, b64ToBuf, deriveRoomKey, encryptChunk, decryptChunk,
  encryptJSON, decryptJSON, encryptText, decryptText, decryptFramed,
};
