// FileNova v2 — UI primitives: toasts, skeletons, confetti, helpers.
'use strict';

window.FileNova = window.FileNova || {};

function ensureToastBox() {
  let box = document.getElementById('toasts');
  if (!box) {
    box = document.createElement('div');
    box.id = 'toasts';
    box.setAttribute('aria-live', 'polite');
    document.body.appendChild(box);
  }
  return box;
}

function toast(message, type = '') {
  const box = ensureToastBox();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.setAttribute('role', 'status');
  el.textContent = message;
  box.appendChild(el);
  setTimeout(() => el.remove(), 3200);
  while (box.children.length > 3) box.firstChild.remove();
}

async function copyText(text, label = 'Copied ✓') {
  try {
    await navigator.clipboard.writeText(text);
    toast(label, 'success');
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast(label, 'success'); return true; }
    catch { toast('Copy failed — long-press to copy manually.', 'error'); return false; }
    finally { ta.remove(); }
  }
}

function fmtBytes(n) {
  if (!Number.isFinite(n)) return '?';
  if (n < 1024) return `${n} B`;
  const units = ['KB', 'MB', 'GB'];
  let v = n / 1024, u = 0;
  while (v >= 1024 && u < units.length - 1) { v /= 1024; u++; }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[u]}`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function timeLeft(expiresAt) {
  const ms = expiresAt - Date.now();
  if (ms <= 0) return 'expired';
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'under a minute';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h} hour${h > 1 ? 's' : ''}` : `${Math.floor(h / 24)} day`;
}

const loadedScripts = new Map();
function loadScript(src) {
  if (!loadedScripts.has(src)) {
    loadedScripts.set(src, new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.defer = true;
      s.onload = resolve; s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    }));
  }
  return loadedScripts.get(src);
}

function getFingerprint() {
  let fp = localStorage.getItem('fnova_fp');
  if (!fp) {
    const rand = [...crypto.getRandomValues(new Uint8Array(8))]
      .map((b) => b.toString(16).padStart(2, '0')).join('');
    fp = `${rand}-${Date.now()}`;
    localStorage.setItem('fnova_fp', fp);
  }
  return fp;
}

async function api(path, { method = 'GET', body, fingerprint = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (fingerprint) headers['x-session-fingerprint'] = getFingerprint();
  const res = await fetch(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status; err.code = data.error; err.howToFix = data.howToFix;
    throw err;
  }
  return data;
}

function friendlyError(err) {
  if (err.code === 'room_not_found') return 'No active room matches that code. Check it and try again.';
  if (err.code === 'invalid_pin') return 'Wrong PIN. Ask the sender for the 4-digit PIN.';
  if (err.code === 'room_expired') return 'This room expired and was deleted. Ask for a new room.';
  if (err.code === 'rate_limited') return err.message || 'Too many attempts. Please wait and try again.';
  return err.howToFix ? `${err.message} ${err.howToFix}` : (err.message || 'Something went wrong.');
}

// Confetti on successful transfer ✓ (tiny canvas, no dependency).
function confetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:80;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width = innerWidth; canvas.height = innerHeight;
  const colors = ['#4f46e5', '#818cf8', '#22c55e', '#f59e0b', '#f8fafc'];
  const pieces = Array.from({ length: 90 }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 200,
    y: innerHeight / 2,
    vx: (Math.random() - 0.5) * 10,
    vy: -Math.random() * 9 - 3,
    s: Math.random() * 7 + 3,
    c: colors[Math.floor(Math.random() * colors.length)],
    r: Math.random() * Math.PI,
  }));
  let frames = 0;
  (function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.r += 0.1;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6);
      ctx.restore();
    }
    if (++frames < 90) requestAnimationFrame(tick);
    else canvas.remove();
  })();
}

window.FileNova.ui = {
  toast, copyText, fmtBytes, escapeHtml, timeLeft, loadScript,
  getFingerprint, api, friendlyError, confetti,
};
