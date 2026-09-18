// FileNova v2 — receiver entry: enter code (+ PIN) → join → receive view.
'use strict';

(() => {
  const { ui } = window.FileNova;

  function initTheme() {
    const saved = localStorage.getItem('fnova_theme');
    document.documentElement.dataset.theme =
      saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }

  async function onJoin(e) {
    e.preventDefault();
    const codeInput = document.getElementById('codeInput');
    const pinInput = document.getElementById('pinInput');
    const codeError = document.getElementById('codeError');
    codeError.textContent = '';
    const code = codeInput.value.trim().toUpperCase();
    if (!/^[A-Z0-9]{6}$/.test(code)) {
      codeInput.setAttribute('aria-invalid', 'true');
      codeError.textContent = 'Enter the 6-character room code.';
      return;
    }
    codeInput.removeAttribute('aria-invalid');
    const btn = document.getElementById('joinBtn');
    btn.disabled = true;
    btn.textContent = 'Joining…';
    try {
      const pin = pinInput.value.trim();
      const room = await ui.api('/api/rooms/join', {
        method: 'POST', body: { code, pin: pin || undefined },
      });
      sessionStorage.setItem('fnova_code', code);
      if (pin) sessionStorage.setItem('fnova_pin', pin);
      sessionStorage.setItem('fnova_salt', room.salt);
      ui.toast('Receiver joined! ✓', 'success');
      location.href = `/receive.html?id=${encodeURIComponent(room.roomId)}`;
    } catch (err) {
      ui.toast(ui.friendlyError(err), 'error');
      btn.disabled = false;
      btn.textContent = 'Join room';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    const input = document.getElementById('codeInput');
    input.addEventListener('input', () => {
      const pos = input.selectionStart;
      input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
      try { input.setSelectionRange(pos, pos); } catch { /* noop */ }
    });
    const pre = new URLSearchParams(location.search).get('code');
    if (pre) input.value = pre.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    document.getElementById('joinForm').addEventListener('submit', onJoin);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
})();
