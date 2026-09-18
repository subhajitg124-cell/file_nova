// FileNova v2 — High-Polish UI Engine
'use strict';

window.FileNova = window.FileNova || {};

(() => {
  function ensureToastBox() {
    let box = document.getElementById('toasts-hub');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toasts-hub';
      document.body.appendChild(box);
    }
    return box;
  }

  function toast(message, type = '') {
    const box = ensureToastBox();
    const el = document.createElement('div');
    el.className = `toast-item ${type}`;

    let iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    `;

    if (type === 'success') {
      iconSvg = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      `;
    } else if (type === 'error') {
      iconSvg = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      `;
    }

    el.innerHTML = `${iconSvg}<span>${escapeHtml(message)}</span>`;
    box.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = 'all 0.25s ease';
      setTimeout(() => el.remove(), 250);
    }, 3200);

    while (box.children.length > 4) box.firstChild.remove();
  }

  async function copyText(text, label = 'Copied to clipboard ✓') {
    try {
      await navigator.clipboard.writeText(text);
      toast(label, 'success');
      return true;
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        toast(label, 'success');
        return true;
      } catch {
        toast('Copy failed — please copy manually.', 'error');
        return false;
      } finally {
        ta.remove();
      }
    }
  }

  function fmtBytes(n) {
    if (!Number.isFinite(n) || n < 0) return '?';
    if (n < 1024) return `${n} B`;
    const units = ['KB', 'MB', 'GB', 'TB'];
    let v = n / 1024, u = 0;
    while (v >= 1024 && u < units.length - 1) {
      v /= 1024;
      u++;
    }
    return `${v.toFixed(v < 10 ? 1 : 0)} ${units[u]}`;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({
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
    return h < 24 ? `${h}h ${m % 60}m` : `${Math.floor(h / 24)} days`;
  }

  function getFileIcon(mime, name = '') {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (mime.startsWith('image/')) return '🖼️';
    if (mime.startsWith('audio/')) return '🎵';
    if (mime.startsWith('video/')) return '🎬';
    if (mime.includes('pdf') || ext === 'pdf') return '📕';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return '📦';
    if (['js', 'ts', 'py', 'html', 'css', 'json', 'sql', 'cpp', 'java', 'c', 'sh'].includes(ext)) return '💻';
    return '📄';
  }

  const loadedScripts = new Map();
  function loadScript(src) {
    if (!loadedScripts.has(src)) {
      loadedScripts.set(src, new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.defer = true;
        s.onload = resolve;
        s.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(s);
      }));
    }
    return loadedScripts.get(src);
  }

  function getFingerprint() {
    let fp = localStorage.getItem('fnova_fp');
    if (!fp) {
      const rand = [...crypto.getRandomValues(new Uint8Array(12))]
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
      err.status = res.status;
      err.code = data.error;
      err.howToFix = data.howToFix;
      throw err;
    }
    return data;
  }

  function friendlyError(err) {
    if (err.code === 'room_not_found') return 'No active room matches that code. Check it or ask the sender.';
    if (err.code === 'invalid_pin') return 'Wrong PIN entered. Please check the 4-digit PIN.';
    if (err.code === 'room_expired') return 'This room has expired and was automatically deleted.';
    if (err.code === 'rate_limited') return err.message || 'Too many requests. Please wait a moment.';
    return err.howToFix ? `${err.message} (${err.howToFix})` : (err.message || 'Something went wrong.');
  }

  // Particle Confetti Explosion
  function confetti() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#ffffff'];
    const count = 110;
    const particles = Array.from({ length: count }, () => ({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 12 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.2,
      opacity: 1,
    }));

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.vRot;
        p.opacity = Math.max(0, 1 - frame / 100);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      }
      if (++frame < 100) {
        requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    }
    requestAnimationFrame(animate);
  }

  // Lightbox Image Gallery
  function openLightbox(imageUrl, title = 'Image Preview') {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
      <button class="lightbox-close" aria-label="Close">✕</button>
      <img class="lightbox-img" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" />
    `;
    const img = overlay.querySelector('img');
    img.onclick = () => img.classList.toggle('zoomed');

    overlay.querySelector('.lightbox-close').onclick = () => overlay.remove();
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };

    document.addEventListener('keydown', function escHandler(e) {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', escHandler);
      }
    });

    document.body.appendChild(overlay);
  }

  window.FileNova.ui = {
    toast, copyText, fmtBytes, escapeHtml, timeLeft, getFileIcon,
    loadScript, getFingerprint, api, friendlyError, confetti, openLightbox,
  };
})();
