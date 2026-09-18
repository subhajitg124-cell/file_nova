// FileNova v2 — sender room: encrypted chunked send + status timeline.
'use strict';

(() => {
  const { ui, crypto, socket, qr } = window.FileNova;
  const CHUNK_PLAIN = 1048576; // 1 MiB — matches server CHUNK_PLAIN_BYTES
  let roomId = null, roomKey = null, roomCode = null, pollTimer = null;

  const stages = ['waiting', 'receiver-joined', 'sending', 'done'];

  function setStage(status) {
    const order = { waiting: 0, 'receiver-joined': 1, sending: 2, 'file-ready': 3, done: 3 };
    const idx = order[status] !== undefined ? order[status] : 0;
    document.querySelectorAll('#timeline li').forEach((li) => {
      const i = Number(li.dataset.i);
      li.classList.toggle('done', i < idx);
      li.classList.toggle('active', i === idx);
    });
    const labels = ['Waiting for receiver…', 'Receiver joined!', 'Sending…', 'Done ✓'];
    document.getElementById('stageLabel').textContent = labels[Math.min(idx, 3)];
  }

  async function refreshStatus() {
    try {
      const s = await ui.api(`/api/rooms/${encodeURIComponent(roomId)}/status`);
      setStage(s.status);
      document.getElementById('expiryNote').textContent =
        `Room expires in ${ui.timeLeft(s.expiresAt)}. Everything auto-deletes.`;
      if (s.status === 'expired') ui.toast('Room expired.', 'error');
    } catch (err) {
      if (err.code === 'room_expired') {
        ui.toast('Room expired and was deleted.', 'error');
        clearInterval(pollTimer);
      }
    }
  }

  function startLive() {
    const live = socket.watch(roomId, (msg) => {
      if (!msg || msg.roomId !== roomId) return;
      if (msg.status === 'receiver-joined') { setStage('receiver-joined'); ui.toast('Receiver joined! ✓', 'success'); }
      else if (msg.status === 'sending') setStage('sending');
      else if (msg.status === 'file-ready' || msg.status === 'text-added') refreshStatus();
    });
    if (!live) pollTimer = setInterval(refreshStatus, 8000); // socket lib blocked → poll
    else pollTimer = setInterval(refreshStatus, 30000); // socket primary, poll as backup
  }

  async function ensureKey(salt) {
    const pin = sessionStorage.getItem('fnova_pin') || '';
    document.getElementById('stageLabel').textContent = 'Preparing encryption…';
    roomKey = await crypto.deriveRoomKey(roomCode, pin, salt);
  }

  async function uploadFile(file) {
    const row = document.createElement('div');
    row.className = 'file-row fresh';
    row.innerHTML = `<div class="name">${ui.escapeHtml(file.name)}</div>
      <div class="muted small">${ui.fmtBytes(file.size)} · encrypting + sending…</div>
      <div class="progress" role="progressbar" aria-label="Upload progress for ${ui.escapeHtml(file.name)}"><div></div></div>`;
    document.getElementById('fileList').prepend(row);
    const bar = row.querySelector('.progress > div');
    const note = row.querySelector('.muted');

    try {
      const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_PLAIN));
      const encName = await crypto.encryptJSON(roomKey, { v: file.name });
      const encSize = await crypto.encryptJSON(roomKey, { v: file.size });
      const encMime = await crypto.encryptJSON(roomKey, { v: file.type || 'application/octet-stream' });
      const init = await ui.api('/api/upload/init', {
        method: 'POST', body: { roomId, totalChunks, encName, encSize, encMime },
      });
      const fileId = init.fileId;
      let start = 0;
      try {
        const st = await ui.api(`/api/upload/${fileId}/state?roomId=${encodeURIComponent(roomId)}`);
        start = st.receivedChunks || 0; // resume after a drop
      } catch { /* fresh upload */ }

      setStage('sending');
      socket.signal(roomId, 'sending');
      for (let i = start; i < totalChunks; i++) {
        const slice = file.slice(i * CHUNK_PLAIN, (i + 1) * CHUNK_PLAIN);
        const plain = new Uint8Array(await slice.arrayBuffer());
        const { ivB64, cipher } = await crypto.encryptChunk(roomKey, plain);
        const fd = new FormData();
        fd.set('roomId', roomId); fd.set('fileId', fileId); fd.set('index', String(i));
        fd.set('iv', ivB64);
        fd.set('chunk', new Blob([cipher]), 'chunk.bin');
        const res = await fetch('/api/upload/chunk', {
          method: 'POST', headers: { 'x-session-fingerprint': ui.getFingerprint() }, body: fd,
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.message || `Chunk ${i + 1} failed (${res.status})`);
        }
        const pct = Math.round(((i + 1) / totalChunks) * 100);
        bar.style.width = `${pct}%`;
        note.textContent = `${ui.fmtBytes(Math.min(file.size, (i + 1) * CHUNK_PLAIN))} of ${ui.fmtBytes(file.size)} · ${pct}%`;
        if (i % 4 === 0) socket.signal(roomId, 'progress', { fileId, pct });
      }
      await ui.api('/api/upload/complete', { method: 'POST', body: { roomId, fileId } });
      socket.signal(roomId, 'done', { fileId });
      note.textContent = 'Sent ✓ — receiver can preview or download.';
      ui.toast(`"${file.name}" sent ✓`, 'success');
      ui.confetti();
      setStage('done');
    } catch (err) {
      note.textContent = `Failed: ${err.message} — retry to resume.`;
      ui.toast(`Upload failed: ${err.message}`, 'error');
    }
  }

  function initDrop() {
    const zone = document.getElementById('dropzone');
    const input = document.getElementById('fileInput');
    zone.addEventListener('click', () => input.click());
    zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') input.click(); });
    ['dragenter', 'dragover'].forEach((ev) => zone.addEventListener(ev, (e) => {
      e.preventDefault(); zone.classList.add('dragover');
    }));
    ['dragleave', 'drop'].forEach((ev) => zone.addEventListener(ev, (e) => {
      e.preventDefault(); zone.classList.remove('dragover');
    }));
    zone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files));
    input.addEventListener('change', () => { handleFiles(input.files); input.value = ''; });
  }

  async function handleFiles(list) {
    const files = [...(list || [])];
    if (!files.length) return;
    if (files.length > 5) ui.toast('Sending first 5 files — add more after these finish.', 'error');
    for (const f of files.slice(0, 5)) {
      if (f.size > 2 * 1024 * 1024 * 1024) { ui.toast(`"${f.name}" exceeds 2 GB and was skipped.`, 'error'); continue; }
      // eslint-disable-next-line no-await-in-loop
      await uploadFile(f);
    }
  }

  async function sendText(e) {
    e.preventDefault();
    const area = document.getElementById('textInput');
    const lang = document.getElementById('langSelect').value;
    const text = area.value;
    if (!text.trim()) { ui.toast('Write something first.', 'error'); return; }
    const btn = document.getElementById('textBtn');
    btn.disabled = true;
    try {
      const { ivB64, cipher } = await crypto.encryptChunk(roomKey, new TextEncoder().encode(text));
      await ui.api('/api/texts', {
        method: 'POST',
        body: { roomId, iv: ivB64, data: crypto.bufToB64(cipher), language: lang },
      });
      area.value = '';
      ui.toast('Snippet sent ✓', 'success');
    } catch (err) {
      ui.toast(ui.friendlyError(err), 'error');
    } finally {
      btn.disabled = false;
    }
  }

  async function bootAsSender(salt) {
    await ensureKey(salt);
    document.getElementById('needCode').classList.add('hidden');
    document.getElementById('senderMain').classList.remove('hidden');
    const link = `${location.origin}/join.html?code=${encodeURIComponent(roomCode)}`;
    document.getElementById('roomCodeBig').textContent = roomCode;
    document.getElementById('copyCodeBtn').onclick = () => ui.copyText(roomCode, 'Room code copied ✓');
    document.getElementById('waBtn').href =
      `https://wa.me/?text=${encodeURIComponent(`Join my FileNova room with code ${roomCode}: ${link}`)}`;
    qr.render(document.getElementById('qrBox'), link);
    initDrop();
    document.getElementById('textForm').addEventListener('submit', sendText);
    startLive();
    refreshStatus();
  }

  async function rejoinWithCode(e) {
    e.preventDefault();
    const code = document.getElementById('codeInput').value.trim().toUpperCase();
    const pin = document.getElementById('pinInput').value.trim();
    if (!/^[A-Z0-9]{6}$/.test(code)) { ui.toast('Enter the 6-character code.', 'error'); return; }
    try {
      const room = await ui.api('/api/rooms/join', { method: 'POST', body: { code, pin: pin || undefined } });
      roomCode = code;
      sessionStorage.setItem('fnova_code', code);
      if (pin) sessionStorage.setItem('fnova_pin', pin);
      sessionStorage.setItem('fnova_salt', room.salt);
      bootAsSender(room.salt);
    } catch (err) {
      ui.toast(ui.friendlyError(err), 'error');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('fnova_theme');
    document.documentElement.dataset.theme = saved || 'dark';
    roomId = new URLSearchParams(location.search).get('id');
    if (!roomId) {
      ui.toast('No room selected. Create one first.', 'error');
      location.href = '/';
      return;
    }
    roomCode = sessionStorage.getItem('fnova_code');
    const salt = sessionStorage.getItem('fnova_salt');
    if (roomCode && salt) bootAsSender(salt);
    else {
      document.getElementById('needCode').classList.remove('hidden');
      document.getElementById('codeForm').addEventListener('submit', rejoinWithCode);
    }
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
})();
