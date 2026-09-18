// FileNova v2 — QR codes for room links (lazy QRCode.js CDN, link fallback).
'use strict';

window.FileNova = window.FileNova || {};

window.FileNova.qr = (() => {
  const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';

  async function render(el, text) {
    el.innerHTML = '';
    try {
      await window.FileNova.ui.loadScript(CDN);
      if (typeof window.QRCode !== 'function') throw new Error('QR unavailable');
      // eslint-disable-next-line no-new
      new window.QRCode(el, { text, width: 180, height: 180, correctLevel: window.QRCode.CorrectLevel.M });
    } catch {
      const p = document.createElement('p');
      p.className = 'muted small';
      p.innerHTML = `QR unavailable offline. Share this link instead:<br><code>${window.FileNova.ui.escapeHtml(text)}</code>`;
      el.appendChild(p);
    }
  }

  return { render };
})();
