// FileNova v2 — audio preview with waveform (lazy WaveSurfer.js, <audio> fallback).
'use strict';

window.FileNova = window.FileNova || {};

window.FileNova.audio = (() => {
  const CDN = 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js';
  let waveModule = null;

  async function enhance(container, objectUrl) {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = objectUrl;
    audio.preload = 'metadata';
    container.appendChild(audio);
    try {
      if (!waveModule) waveModule = await import(CDN);
      const waveEl = document.createElement('div');
      waveEl.className = 'wave';
      container.prepend(waveEl);
      const ws = waveModule.create({ container: waveEl, url: objectUrl, height: 64, waveColor: '#818cf8', progressColor: '#4f46e5' });
      const btn = document.createElement('button');
      btn.className = 'btn secondary'; btn.textContent = 'Play waveform';
      btn.setAttribute('aria-label', 'Play audio with waveform');
      btn.onclick = () => ws.playPause();
      container.prepend(btn);
    } catch {
      // CDN unreachable (offline / low bandwidth): plain <audio> above is enough.
    }
  }

  return { enhance };
})();
