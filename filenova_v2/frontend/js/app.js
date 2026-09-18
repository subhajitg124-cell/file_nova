// FileNova v2 — landing: create room + share panel.
'use strict';

(() => {
  const { ui, qr } = window.FileNova;
  let expiresIn = '30m';

  function initTheme() {
    const saved = localStorage.getItem('fnova_theme');
    const theme = saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.dataset.theme = theme;
    const btn = document.getElementById('themeBtn');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
      btn.onclick = () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('fnova_theme', next);
        btn.textContent = next === 'dark' ? '☀️ Light' : '🌙 Dark';
      };
    }
  }

  function initExpiry() {
    document.querySelectorAll('#expiryGrid button').forEach((b) => {
      b.onclick = () => {
        document.querySelectorAll('#expiryGrid button').forEach((x) => x.setAttribute('aria-pressed', 'false'));
        b.setAttribute('aria-pressed', 'true');
        expiresIn = b.dataset.value;
      };
    });
  }

  function initPin() {
    const toggle = document.getElementById('pinToggle');
    const input = document.getElementById('pinInput');
    toggle.onchange = () => {
      input.classList.toggle('hidden', !toggle.checked);
      if (toggle.checked) input.focus();
    };
  }

  function joinLink(code) {
    return `${location.origin}/join.html?code=${encodeURIComponent(code)}`;
  }

  async function onCreate(e) {
    e.preventDefault();
    const btn = document.getElementById('createBtn');
    const pinToggle = document.getElementById('pinToggle');
    const pinInput = document.getElementById('pinInput');
    const pinError = document.getElementById('pinError');
    pinError.textContent = '';

    let pin;
    if (pinToggle.checked) {
      pin = pinInput.value.trim();
      if (!/^\d{4}$/.test(pin)) {
        pinInput.setAttribute('aria-invalid', 'true');
        pinError.textContent = 'PIN must be exactly 4 digits.';
        return;
      }
      pinInput.removeAttribute('aria-invalid');
    }

    btn.disabled = true;
    btn.textContent = 'Creating…';
    try {
      const room = await ui.api('/api/rooms', { method: 'POST', body: { expiresIn, pin } });
      sessionStorage.setItem('fnova_code', room.code);
      sessionStorage.setItem('fnova_salt', room.salt);
      showResult(room);
    } catch (err) {
      ui.toast(ui.friendlyError(err), 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Create room';
    }
  }

  function showResult(room) {
    document.getElementById('createCard').classList.add('hidden');
    const panel = document.getElementById('resultCard');
    panel.classList.remove('hidden');
    const codeEl = document.getElementById('roomCode');
    codeEl.textContent = room.code;
    codeEl.classList.add('reveal');
    document.getElementById('expiryNote').textContent =
      `Expires in ${ui.timeLeft(room.expiresAt)}${room.hasPin ? ' · PIN protected' : ''}. Files auto-delete after expiry.`;

    const link = joinLink(room.code);
    document.getElementById('copyCodeBtn').onclick = () => ui.copyText(room.code, 'Room code copied ✓');
    document.getElementById('copyLinkBtn').onclick = () => ui.copyText(link, 'Room link copied ✓');
    document.getElementById('waBtn').href =
      `https://wa.me/?text=${encodeURIComponent(`Join my FileNova room with code ${room.code}: ${link}`)}`;
    document.getElementById('openRoomBtn').href = `/room.html?id=${encodeURIComponent(room.roomId)}`;
    qr.render(document.getElementById('qrBox'), link);
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initExpiry();
    initPin();
    document.getElementById('createForm').addEventListener('submit', onCreate);
    ui.getFingerprint(); // ensure anonymous session exists
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
})();
