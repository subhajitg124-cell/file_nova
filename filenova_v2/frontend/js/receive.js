// FileNova v2 — receiver room: decrypt previews, downloads, ZIP, gallery.
'use strict';

(() => {
  const { ui, crypto, socket, audio } = window.FileNova;
  let roomId = null, roomKey = null, pollTimer = null;
  const metas = new Map(); // fileId -> {name, size, mime, meta}
  const imgIds = []; // ordered image fileIds for gallery

  async function decryptMeta(m) {
    const [name, size, mime] = await Promise.all([
      crypto.decryptJSON(roomKey, m.encName),
      crypto.decryptJSON(roomKey, m.encSize),
      crypto.decryptJSON(roomKey, m.encMime),
    ]);
    return { name: String(name.v), size: Number(size.v), mime: String(mime.v) };
  }

  async function fetchCipher(fileId) {
    const res = await fetch(`/api/files/${fileId}/download?roomId=${encodeURIComponent(roomId)}`, {
      headers: { 'x-session-fingerprint': ui.getFingerprint() },
    });
    if (!res.ok) throw new Error(`Download failed (${res.status})`);
    return res.arrayBuffer();
  }

  async function decryptToBlob(fileId, onProgress) {
    const cipher = await fetchCipher(fileId);
    const plain = await crypto.decryptFramed(roomKey, cipher, onProgress);
    const info = metas.get(fileId);
    return new Blob([plain], { type: info ? info.mime : 'application/octet-stream' });
  }

  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  // ── Lightbox gallery ──
  let lightIndex = 0, lightUrls = [];
  function openLightbox(urls, start) {
    lightUrls = urls; lightIndex = start;
    const lb = document.createElement('div');
    lb.className = 'lightbox'; lb.id = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-label', 'Image gallery');
    lb.innerHTML = `<button aria-label="Close gallery">✕</button><img alt="Shared image preview" />`;
    const img = lb.querySelector('img');
    const show = () => { img.src = lightUrls[lightIndex]; img.classList.remove('zoomed'); };
    img.onclick = () => img.classList.toggle('zoomed');
    lb.querySelector('button').onclick = () => lb.remove();
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.remove(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { lb.remove(); document.removeEventListener('keydown', esc); }
      if (e.key === 'ArrowRight') { lightIndex = (lightIndex + 1) % lightUrls.length; show(); }
      if (e.key === 'ArrowLeft') { lightIndex = (lightIndex - 1 + lightUrls.length) % lightUrls.length; show(); }
    });
    document.body.appendChild(lb);
    show();
  }

  // ── File cards ──
  function cardShell(info) {
    const div = document.createElement('div');
    div.className = 'file-row fresh';
    div.id = `file-${info.fileId}`;
    div.innerHTML = `<div class="name">${ui.escapeHtml(info.name)}</div>
      <div class="muted small">${ui.escapeHtml(info.mime)} · ${ui.fmtBytes(info.size)}</div>
      <div class="body"></div>`;
    document.getElementById('fileList').prepend(div);
    return div.querySelector('.body');
  }

  function busyBtn(label = 'Working…') {
    const b = document.createElement('button');
    b.className = 'btn secondary'; b.disabled = true; b.textContent = label;
    return b;
  }

  async function addFileCard(m) {
    if (document.getElementById(`file-${m.fileId}`)) return;
    let info;
    try { info = { fileId: m.fileId, ...(await decryptMeta(m)) }; }
    catch { ui.toast('Could not decrypt a file header (wrong code?).', 'error'); return; }
    metas.set(m.fileId, info);
    const body = cardShell(info);

    if (info.mime.startsWith('image/')) {
      imgIds.unshift(m.fileId);
      const btn = document.createElement('button');
      btn.className = 'btn secondary'; btn.textContent = 'Preview image';
      btn.onclick = async () => {
        btn.disabled = true; btn.textContent = 'Decrypting…';
        try {
          const blob = await decryptToBlob(m.fileId);
          const url = URL.createObjectURL(blob);
          btn.replaceWith(Object.assign(document.createElement('img'), {
            src: url, alt: `Preview of ${info.name}`,
            style: 'width:100%;border-radius:10px;margin-top:8px;cursor:zoom-in;border:1px solid var(--border);',
            onclick: () => openLightbox(
              imgIds.map((id) => document.querySelector(`#file-${id} img`)?.src).filter(Boolean), 0
            ),
          }));
          const dl = document.createElement('button');
          dl.className = 'btn secondary'; dl.textContent = 'Download'; dl.style.marginTop = '8px';
          dl.onclick = () => downloadBlob(blob, info.name);
          body.appendChild(dl);
        } catch { btn.disabled = false; btn.textContent = 'Preview failed — retry'; }
      };
      body.appendChild(btn);
    } else if (info.mime.startsWith('audio/')) {
      const btn = document.createElement('button');
      btn.className = 'btn secondary'; btn.textContent = 'Load player (no download needed)';
      btn.onclick = async () => {
        btn.disabled = true; btn.textContent = 'Decrypting…';
        try {
          const blob = await decryptToBlob(m.fileId);
          const box = document.createElement('div');
          btn.replaceWith(box);
          await audio.enhance(box, URL.createObjectURL(blob));
          const dl = document.createElement('button');
          dl.className = 'btn secondary'; dl.textContent = 'Download'; dl.style.marginTop = '8px';
          dl.onclick = () => downloadBlob(blob, info.name);
          box.appendChild(dl);
        } catch { btn.disabled = false; btn.textContent = 'Player failed — retry'; }
      };
      body.appendChild(btn);
    } else {
      const btn = document.createElement('button');
      btn.className = 'btn'; btn.textContent = `Download · ${ui.fmtBytes(info.size)}`;
      btn.onclick = async () => {
        const busy = busyBtn('Decrypting…'); btn.replaceWith(busy);
        try {
          const blob = await decryptToBlob(m.fileId);
          downloadBlob(blob, info.name);
          busy.replaceWith(btn); btn.textContent = 'Download again';
          ui.toast('Saved ✓', 'success');
        } catch { busy.replaceWith(btn); ui.toast('Download failed — retry.', 'error'); }
      };
      body.appendChild(btn);
    }
  }

  // ── Text snippets ──
  async function highlight(codeEl, lang, text) {
    codeEl.textContent = text;
    try {
      await ui.loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js');
      await ui.loadScript('https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js');
      window.Prism = window.Prism || {};
      window.Prism.plugins = window.Prism.plugins || {};
      window.Prism.plugins.autoloader = window.Prism.plugins.autoloader || {};
      window.Prism.plugins.autoloader.languages_path =
        'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/';
      codeEl.className = `language-${lang}`;
      window.Prism.highlightElement(codeEl);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css';
      document.head.appendChild(link);
    } catch { /* plain text fallback */ }
  }

  async function addTextCard(t) {
    if (document.getElementById(`text-${t.id}`)) return;
    let text = '';
    try { text = await crypto.decryptText(roomKey, t.iv, t.data); }
    catch { ui.toast('Could not decrypt a snippet.', 'error'); return; }
    const div = document.createElement('div');
    div.className = 'file-row snippet fresh';
    div.id = `text-${t.id}`;
    div.innerHTML = `<div class="name">${ui.escapeHtml(t.title || 'Snippet')} <span class="muted small">${ui.escapeHtml(t.language)}</span></div>
      <pre><code></code></pre>`;
    const copy = document.createElement('button');
    copy.className = 'btn secondary'; copy.textContent = 'Copy'; copy.style.marginTop = '8px';
    copy.onclick = () => ui.copyText(text, 'Snippet copied ✓');
    div.appendChild(copy);
    document.getElementById('textList').prepend(div);
    highlight(div.querySelector('code'), t.language === 'plain' ? 'none' : t.language, text);
  }

  // ── ZIP all ──
  async function zipAll() {
    const btn = document.getElementById('zipBtn');
    if (!metas.size) { ui.toast('Nothing to zip yet.', 'error'); return; }
    btn.disabled = true; btn.textContent = 'Preparing ZIP…';
    try {
      await ui.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
      const zip = new window.JSZip();
      let i = 0;
      for (const [fileId, info] of metas) {
        btn.textContent = `Decrypting ${++i}/${metas.size}…`;
        // eslint-disable-next-line no-await-in-loop
        const blob = await decryptToBlob(fileId);
        // eslint-disable-next-line no-await-in-loop
        zip.file(info.name, await blob.arrayBuffer());
      }
      btn.textContent = 'Compressing…';
      const out = await zip.generateAsync({ type: 'blob' });
      downloadBlob(out, 'filenova-room.zip');
      ui.toast('ZIP saved ✓', 'success');
    } catch (err) {
      ui.toast(`ZIP failed: ${err.message}`, 'error');
    } finally {
      btn.disabled = false; btn.textContent = 'Download all as ZIP';
    }
  }

  // ── Load + live ──
  async function loadAll() {
    const list = document.getElementById('fileList');
    list.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div>';
    try {
      const [files, texts] = await Promise.all([
        ui.api(`/api/files?roomId=${encodeURIComponent(roomId)}`),
        ui.api(`/api/texts?roomId=${encodeURIComponent(roomId)}`),
      ]);
      list.innerHTML = files.files.length ? '' : '<p class="muted">No files yet — sender is preparing…</p>';
      for (const m of files.files) {
        if (m.complete) await addFileCard(m); // eslint-disable-line no-await-in-loop
      }
      document.getElementById('textList').innerHTML = '';
      for (const t of texts.texts) await addTextCard(t); // eslint-disable-line no-await-in-loop
      const zipBtn = document.getElementById('zipBtn');
      zipBtn.classList.toggle('hidden', !files.files.length);
    } catch (err) {
      list.innerHTML = `<p class="field-error">${ui.escapeHtml(ui.friendlyError(err))}</p>
        <button class="btn secondary" id="retryBtn">Retry</button>`;
      document.getElementById('retryBtn').onclick = loadAll;
    }
  }

  function startLive() {
    const live = socket.watch(roomId, (msg) => {
      if (!msg || msg.roomId !== roomId) return;
      if (msg.status === 'file-ready' && msg.file) {
        addFileCard(msg.file);
        document.getElementById('zipBtn').classList.remove('hidden');
        ui.toast('New file arrived ✓', 'success');
        ui.confetti();
      } else if (msg.status === 'text-added' && msg.text) {
        addTextCard(msg.text);
        ui.toast('New snippet arrived ✓', 'success');
      }
    });
    pollTimer = setInterval(loadAll, live ? 30000 : 8000);
  }

  async function boot() {
    const pin = sessionStorage.getItem('fnova_pin') || '';
    const code = sessionStorage.getItem('fnova_code');
    const salt = sessionStorage.getItem('fnova_salt');
    if (!code || !salt) {
      document.getElementById('needCode').classList.remove('hidden');
      document.getElementById('codeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const c = document.getElementById('codeInput').value.trim().toUpperCase();
        const p = document.getElementById('pinInput').value.trim();
        try {
          const room = await ui.api('/api/rooms/join', { method: 'POST', body: { code: c, pin: p || undefined } });
          sessionStorage.setItem('fnova_code', c);
          if (p) sessionStorage.setItem('fnova_pin', p);
          sessionStorage.setItem('fnova_salt', room.salt);
          location.reload();
        } catch (err) { ui.toast(ui.friendlyError(err), 'error'); }
      });
      return;
    }
    ui.toast('Decrypting room…', '');
    roomKey = await crypto.deriveRoomKey(code, pin, salt);
    document.getElementById('recvMain').classList.remove('hidden');
    document.getElementById('zipBtn').onclick = zipAll;
    await loadAll();
    startLive();
    refreshExpiry();
    setInterval(refreshExpiry, 30000);
  }

  async function refreshExpiry() {
    try {
      const s = await ui.api(`/api/rooms/${encodeURIComponent(roomId)}/status`);
      document.getElementById('expiryNote').textContent =
        `Room expires in ${ui.timeLeft(s.expiresAt)} — save what you need.`;
    } catch { /* room gone; expiry note stays */ }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('fnova_theme');
    document.documentElement.dataset.theme = saved || 'dark';
    roomId = new URLSearchParams(location.search).get('id');
    if (!roomId) { location.href = '/join.html'; return; }
    boot();
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
})();
