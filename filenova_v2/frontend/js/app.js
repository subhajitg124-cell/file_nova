// FileNova v2 — Master Application Logic (Single-Page Experience)
'use strict';

(() => {
  const { ui, crypto, socket, qr, audio } = window.FileNova;

  // App State
  let activeTab = 'send'; // 'send' | 'receive'
  let selectedTtl = '30m';
  let fileQueue = []; // Array of File objects to send
  let pendingSnippet = null; // { text, language }

  let currentRoomId = null;
  let currentRoomCode = null;
  let currentRoomSalt = null;
  let currentRoomKey = null;

  const CHUNK_PLAIN_BYTES = 1048576; // 1 MiB chunks
  const receiverMetas = new Map(); // fileId -> { name, size, mime, complete }

  /* ===================================================================
     1. THEME & INITIALIZATION
     =================================================================== */
  function initTheme() {
    const saved = localStorage.getItem('fnova_theme');
    const isLight = saved === 'light' || (!saved && window.matchMedia('(prefers-color-scheme: light)').matches);
    const theme = isLight ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    updateThemeIcon(theme);

    const themeBtn = document.getElementById('themeBtn');
    if (themeBtn) {
      themeBtn.onclick = () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('fnova_theme', next);
        updateThemeIcon(next);
      };
    }
  }

  function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (!icon) return;
    if (theme === 'light') {
      icon.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      `;
    } else {
      icon.innerHTML = `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      `;
    }
  }

  /* ===================================================================
     2. TAB SWITCHING (Send vs Receive)
     =================================================================== */
  function initTabs() {
    const tabSend = document.getElementById('tabSend');
    const tabReceive = document.getElementById('tabReceive');
    const sendSec = document.getElementById('sendSection');
    const recvSec = document.getElementById('receiveSection');

    tabSend.onclick = () => switchTab('send');
    tabReceive.onclick = () => switchTab('receive');

    function switchTab(mode) {
      activeTab = mode;
      tabSend.classList.toggle('active', mode === 'send');
      tabReceive.classList.toggle('active', mode === 'receive');
      sendSec.classList.toggle('hidden', mode !== 'send');
      recvSec.classList.toggle('hidden', mode !== 'receive');

      if (mode === 'receive') {
        const firstOtp = document.querySelector('.otp-input[data-index="0"]');
        if (firstOtp) setTimeout(() => firstOtp.focus(), 150);
      }
    }
  }

  /* ===================================================================
     3. DRAG & DROP + FILE QUEUE
     =================================================================== */
  function initDropzone() {
    const zone = document.getElementById('mainDropzone');
    const input = document.getElementById('multiFileInput');

    zone.onclick = () => input.click();
    zone.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    };

    ['dragenter', 'dragover'].forEach((ev) => {
      zone.addEventListener(ev, (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach((ev) => {
      zone.addEventListener(ev, (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
      });
    });

    zone.addEventListener('drop', (e) => {
      handleIncomingFiles(e.dataTransfer.files);
    });

    input.addEventListener('change', () => {
      handleIncomingFiles(input.files);
      input.value = '';
    });

    // Support direct pasting of files or images anywhere on the page
    window.addEventListener('paste', (e) => {
      if (activeTab !== 'send') return;
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length) {
        handleIncomingFiles(e.clipboardData.files);
      }
    });
  }

  function handleIncomingFiles(files) {
    const arr = Array.from(files || []);
    if (!arr.length) return;

    for (const f of arr) {
      if (f.size > 2 * 1024 * 1024 * 1024) {
        ui.toast(`"${f.name}" exceeds the 2 GB limit and was skipped.`, 'error');
        continue;
      }
      fileQueue.push(f);
    }
    renderFileQueue();
  }

  function renderFileQueue() {
    const box = document.getElementById('fileQueueBox');
    if (!fileQueue.length && !pendingSnippet) {
      box.classList.add('hidden');
      box.innerHTML = '';
      return;
    }

    box.classList.remove('hidden');
    box.innerHTML = '';

    // Render snippet if present
    if (pendingSnippet) {
      const el = document.createElement('div');
      el.className = 'file-item pop-in';
      el.innerHTML = `
        <div class="file-left">
          <div class="file-icon-box">💻</div>
          <div class="file-info">
            <div class="file-name">Snippet (${ui.escapeHtml(pendingSnippet.language)})</div>
            <div class="file-size">${pendingSnippet.text.length} characters</div>
          </div>
        </div>
        <button class="file-remove" title="Remove snippet" type="button">✕</button>
      `;
      el.querySelector('.file-remove').onclick = () => {
        pendingSnippet = null;
        renderFileQueue();
      };
      box.appendChild(el);
    }

    // Render files
    fileQueue.forEach((file, idx) => {
      const el = document.createElement('div');
      el.className = 'file-item pop-in';
      el.innerHTML = `
        <div class="file-left">
          <div class="file-icon-box">${ui.getFileIcon(file.type, file.name)}</div>
          <div class="file-info">
            <div class="file-name">${ui.escapeHtml(file.name)}</div>
            <div class="file-size">${ui.fmtBytes(file.size)} · ${file.type || 'file'}</div>
          </div>
        </div>
        <button class="file-remove" title="Remove file" type="button">✕</button>
      `;
      el.querySelector('.file-remove').onclick = () => {
        fileQueue.splice(idx, 1);
        renderFileQueue();
      };
      box.appendChild(el);
    });
  }

  /* ===================================================================
     4. SNIPPET MODAL
     =================================================================== */
  function initSnippetModal() {
    const modal = document.getElementById('snippetModal');
    const openBtn = document.getElementById('openSnippetModalBtn');
    const closeBtn = document.getElementById('closeSnippetModalBtn');
    const confirmBtn = document.getElementById('confirmSnippetBtn');
    const textarea = document.getElementById('snippetTextarea');
    const langSelect = document.getElementById('snippetLang');

    openBtn.onclick = () => {
      modal.classList.remove('hidden');
      textarea.focus();
    };

    closeBtn.onclick = () => modal.classList.add('hidden');
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    };

    confirmBtn.onclick = () => {
      const text = textarea.value.trim();
      if (!text) {
        ui.toast('Please write something in the snippet first.', 'error');
        return;
      }
      pendingSnippet = { text, language: langSelect.value };
      textarea.value = '';
      modal.classList.add('hidden');
      renderFileQueue();
      ui.toast('Snippet added to queue ✓', 'success');
    };
  }

  /* ===================================================================
     5. ROOM CREATION & ACTIVE SENDER VIEW
     =================================================================== */
  function initRoomCreation() {
    // Expiry buttons
    document.querySelectorAll('.expiry-selector button').forEach((btn) => {
      btn.onclick = () => {
        document.querySelectorAll('.expiry-selector button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selectedTtl = btn.dataset.ttl;
      };
    });

    // PIN toggle
    const pinCheckbox = document.getElementById('pinCheckbox');
    const pinInput = document.getElementById('roomPinInput');
    pinCheckbox.onchange = () => {
      pinInput.classList.toggle('hidden', !pinCheckbox.checked);
      if (pinCheckbox.checked) pinInput.focus();
    };

    // Start Room Button
    const startBtn = document.getElementById('startRoomBtn');
    startBtn.onclick = async () => {
      if (!fileQueue.length && !pendingSnippet) {
        ui.toast('Please drop a file or add a snippet first!', 'error');
        return;
      }

      let pin = undefined;
      if (pinCheckbox.checked) {
        pin = pinInput.value.trim();
        if (!/^\d{4}$/.test(pin)) {
          ui.toast('Room PIN must be exactly 4 digits.', 'error');
          pinInput.focus();
          return;
        }
      }

      startBtn.disabled = true;
      startBtn.innerHTML = `<span>Creating Encrypted Room…</span>`;

      try {
        const room = await ui.api('/api/rooms', {
          method: 'POST',
          body: { expiresIn: selectedTtl, pin },
        });

        currentRoomId = room.roomId;
        currentRoomCode = room.code;
        currentRoomSalt = room.salt;
        currentRoomKey = await crypto.deriveRoomKey(room.code, pin || '', room.salt);

        sessionStorage.setItem('fnova_code', room.code);
        sessionStorage.setItem('fnova_salt', room.salt);
        if (pin) sessionStorage.setItem('fnova_pin', pin);

        showActiveSenderRoom(room);
        uploadAllQueuedItems();
      } catch (err) {
        ui.toast(ui.friendlyError(err), 'error');
        startBtn.disabled = false;
        startBtn.innerHTML = `<span>Create Secure Room &amp; Share</span>`;
      }
    };

    document.getElementById('createNewRoomBtn').onclick = () => {
      location.href = '/';
    };
  }

  function showActiveSenderRoom(room) {
    document.getElementById('prepareRoomCard').classList.add('hidden');
    const activeCard = document.getElementById('activeSenderCard');
    activeCard.classList.remove('hidden');

    // Render 6 code boxes
    const codeDisplay = document.getElementById('roomCodeDisplay');
    codeDisplay.innerHTML = '';
    for (const char of room.code) {
      const box = document.createElement('div');
      box.className = 'code-letter';
      box.textContent = char;
      codeDisplay.appendChild(box);
    }

    const joinUrl = `${location.origin}/?code=${encodeURIComponent(room.code)}`;
    document.getElementById('activeExpiryNotice').textContent =
      `Auto-deletes in ${ui.timeLeft(room.expiresAt)}${room.hasPin ? ' · 4-Digit PIN Protected' : ''}`;

    // Share buttons
    document.getElementById('copyCodeBtn').onclick = () => ui.copyText(room.code, 'Room code copied ✓');
    document.getElementById('copyLinkBtn').onclick = () => ui.copyText(joinUrl, 'Room link copied ✓');
    document.getElementById('waShareBtn').href =
      `https://wa.me/?text=${encodeURIComponent(`Join my secure FileNova room with code ${room.code}: ${joinUrl}`)}`;

    // QR Code toggle
    const qrContainer = document.getElementById('qrContainer');
    const qrBox = document.getElementById('qrCanvasBox');
    let qrRendered = false;
    document.getElementById('toggleQrBtn').onclick = () => {
      qrContainer.classList.toggle('hidden');
      if (!qrRendered) {
        qr.render(qrBox, joinUrl);
        qrRendered = true;
      }
    };

    // Watch socket events
    socket.watch(room.roomId, (msg) => {
      if (!msg || msg.roomId !== room.roomId) return;
      const radar = document.getElementById('radarStatus');
      const radarText = document.getElementById('radarStatusText');

      if (msg.status === 'receiver-joined') {
        radar.className = 'radar-status connected';
        radarText.textContent = 'Receiver Connected! ✓';
        ui.toast('Receiver joined your room! ✓', 'success');
      } else if (msg.status === 'sending') {
        radar.className = 'radar-status sending';
        radarText.textContent = 'Streaming Encrypted Chunks…';
      }
    });

    activeCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function uploadAllQueuedItems() {
    const list = document.getElementById('senderUploadProgressList');
    list.innerHTML = '';

    // Upload snippet if present
    if (pendingSnippet) {
      const row = document.createElement('div');
      row.className = 'file-item pop-in';
      row.innerHTML = `
        <div class="file-left">
          <div class="file-icon-box">💻</div>
          <div class="file-info">
            <div class="file-name">Snippet (${ui.escapeHtml(pendingSnippet.language)})</div>
            <div class="file-size">Encrypting &amp; uploading…</div>
          </div>
        </div>
      `;
      list.appendChild(row);

      try {
        const { ivB64, cipher } = await crypto.encryptChunk(
          currentRoomKey,
          new TextEncoder().encode(pendingSnippet.text)
        );
        await ui.api('/api/texts', {
          method: 'POST',
          body: {
            roomId: currentRoomId,
            iv: ivB64,
            data: crypto.bufToB64(cipher),
            language: pendingSnippet.language,
          },
        });
        row.querySelector('.file-size').textContent = 'Uploaded & Encrypted ✓';
        ui.toast('Snippet uploaded ✓', 'success');
      } catch (err) {
        row.querySelector('.file-size').textContent = `Failed: ${err.message}`;
      }
    }

    // Upload files sequentially
    for (const file of fileQueue) {
      const row = document.createElement('div');
      row.className = 'file-item pop-in';
      row.style.flexDirection = 'column';
      row.style.alignItems = 'stretch';
      row.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div class="file-left">
            <div class="file-icon-box">${ui.getFileIcon(file.type, file.name)}</div>
            <div class="file-info">
              <div class="file-name">${ui.escapeHtml(file.name)}</div>
              <div class="file-size status-note">${ui.fmtBytes(file.size)} · Encrypting &amp; Uploading…</div>
            </div>
          </div>
          <div style="font-size: 13px; font-weight: 700;" class="pct-note">0%</div>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill"></div>
        </div>
      `;
      list.appendChild(row);

      const fill = row.querySelector('.progress-bar-fill');
      const pctNote = row.querySelector('.pct-note');
      const statusNote = row.querySelector('.status-note');

      try {
        const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_PLAIN_BYTES));
        const encName = await crypto.encryptJSON(currentRoomKey, { v: file.name });
        const encSize = await crypto.encryptJSON(currentRoomKey, { v: file.size });
        const encMime = await crypto.encryptJSON(currentRoomKey, { v: file.type || 'application/octet-stream' });

        const init = await ui.api('/api/upload/init', {
          method: 'POST',
          body: { roomId: currentRoomId, totalChunks, encName, encSize, encMime },
        });

        const fileId = init.fileId;
        socket.signal(currentRoomId, 'sending');

        for (let i = 0; i < totalChunks; i++) {
          const slice = file.slice(i * CHUNK_PLAIN_BYTES, (i + 1) * CHUNK_PLAIN_BYTES);
          const plainBytes = new Uint8Array(await slice.arrayBuffer());
          const { ivB64, cipher } = await crypto.encryptChunk(currentRoomKey, plainBytes);

          const fd = new FormData();
          fd.set('roomId', currentRoomId);
          fd.set('fileId', fileId);
          fd.set('index', String(i));
          fd.set('iv', ivB64);
          fd.set('chunk', new Blob([cipher]), 'chunk.bin');

          const res = await fetch('/api/upload/chunk', {
            method: 'POST',
            headers: { 'x-session-fingerprint': ui.getFingerprint() },
            body: fd,
          });

          if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            throw new Error(e.message || `Chunk ${i + 1} failed`);
          }

          const pct = Math.round(((i + 1) / totalChunks) * 100);
          fill.style.width = `${pct}%`;
          pctNote.textContent = `${pct}%`;
          statusNote.textContent = `${ui.fmtBytes(Math.min(file.size, (i + 1) * CHUNK_PLAIN_BYTES))} of ${ui.fmtBytes(file.size)}`;

          if (i % 3 === 0) socket.signal(currentRoomId, 'progress', { fileId, pct });
        }

        await ui.api('/api/upload/complete', {
          method: 'POST',
          body: { roomId: currentRoomId, fileId },
        });

        socket.signal(currentRoomId, 'done', { fileId });
        statusNote.textContent = 'Uploaded & Encrypted ✓';
        pctNote.textContent = 'Done ✓';
        pctNote.style.color = 'var(--accent-emerald)';
        ui.confetti();
      } catch (err) {
        statusNote.textContent = `Upload failed: ${err.message}`;
        pctNote.textContent = 'Failed';
        pctNote.style.color = 'var(--accent-rose)';
      }
    }

    ui.toast('All files encrypted and live in room! ✓', 'success');
  }

  /* ===================================================================
     6. RECEIVE / 6-BOX OTP INPUT & DECRYPT HUB
     =================================================================== */
  function initOtpInputs() {
    const inputs = document.querySelectorAll('.otp-input');
    inputs.forEach((input, idx) => {
      input.addEventListener('input', (e) => {
        const val = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        input.value = val.slice(0, 1);
        if (val && idx < inputs.length - 1) {
          inputs[idx + 1].focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && idx > 0) {
          inputs[idx - 1].focus();
        }
      });

      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData.getData('text') || '').trim().toUpperCase();
        let extractedCode = text;
        if (text.includes('code=')) {
          const match = text.match(/code=([A-Z0-9]{6})/i);
          if (match) extractedCode = match[1];
        }
        extractedCode = extractedCode.replace(/[^A-Z0-9]/g, '').slice(0, 6);
        for (let i = 0; i < 6; i++) {
          inputs[i].value = extractedCode[i] || '';
        }
        if (extractedCode.length === 6) {
          inputs[5].focus();
          document.getElementById('joinSubmitBtn').click();
        }
      });
    });

    document.getElementById('joinSubmitBtn').onclick = handleJoinRoom;
  }

  async function handleJoinRoom() {
    const inputs = document.querySelectorAll('.otp-input');
    let code = '';
    inputs.forEach((inp) => code += inp.value.trim().toUpperCase());

    if (code.length !== 6) {
      ui.toast('Please enter all 6 characters of the room code.', 'error');
      return;
    }

    const pinInput = document.getElementById('receiverPinInput');
    const pin = pinInput.value.trim();

    const joinBtn = document.getElementById('joinSubmitBtn');
    joinBtn.disabled = true;
    joinBtn.innerHTML = `<span>Connecting to room…</span>`;

    try {
      const res = await ui.api('/api/rooms/join', {
        method: 'POST',
        body: { code, pin: pin || undefined },
      });

      currentRoomId = res.roomId;
      currentRoomCode = code;
      currentRoomSalt = res.salt;
      currentRoomKey = await crypto.deriveRoomKey(code, pin, res.salt);

      sessionStorage.setItem('fnova_code', code);
      sessionStorage.setItem('fnova_salt', res.salt);
      if (pin) sessionStorage.setItem('fnova_pin', pin);

      ui.toast('Connected to room! ✓', 'success');
      showReceivedContent(res);
    } catch (err) {
      if (err.code === 'invalid_pin' || err.message.includes('PIN')) {
        document.getElementById('receiverPinWrap').classList.remove('hidden');
        pinInput.focus();
        ui.toast('This room requires a 4-digit PIN.', 'error');
      } else {
        ui.toast(ui.friendlyError(err), 'error');
      }
      joinBtn.disabled = false;
      joinBtn.innerHTML = `<span>Connect &amp; Decrypt Files</span>`;
    }
  }

  async function showReceivedContent(room) {
    document.getElementById('joinCard').classList.add('hidden');
    const contentCard = document.getElementById('receivedContentCard');
    contentCard.classList.remove('hidden');

    document.getElementById('receiveExpiryNotice').textContent =
      `Room auto-deletes in ${ui.timeLeft(room.expiresAt)}`;

    await fetchAndRenderRoomData();

    // Listen for new arrivals
    socket.watch(currentRoomId, (msg) => {
      if (!msg || msg.roomId !== currentRoomId) return;
      if (msg.status === 'file-ready' || msg.status === 'text-added') {
        fetchAndRenderRoomData();
        ui.toast('New content arrived! ✓', 'success');
        ui.confetti();
      }
    });

    document.getElementById('zipDownloadBtn').onclick = downloadZipAll;
  }

  async function fetchAndRenderRoomData() {
    const itemsList = document.getElementById('receivedItemsList');
    try {
      const [filesRes, textsRes] = await Promise.all([
        ui.api(`/api/files?roomId=${encodeURIComponent(currentRoomId)}`),
        ui.api(`/api/texts?roomId=${encodeURIComponent(currentRoomId)}`),
      ]);

      const files = filesRes.files || [];
      const texts = textsRes.texts || [];

      document.getElementById('zipDownloadBtn').classList.toggle('hidden', files.length < 2);

      // Render Files
      if (!files.length) {
        itemsList.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:20px;">Waiting for sender to upload files…</p>`;
      } else {
        itemsList.innerHTML = '';
        for (const fileMeta of files) {
          if (fileMeta.complete) {
            await renderDecryptedFileCard(fileMeta, itemsList);
          }
        }
      }

      // Render Texts
      const textsWrap = document.getElementById('receivedTextsWrap');
      const textsList = document.getElementById('receivedTextsList');
      if (texts.length) {
        textsWrap.classList.remove('hidden');
        textsList.innerHTML = '';
        for (const t of texts) {
          await renderDecryptedTextCard(t, textsList);
        }
      }
    } catch (err) {
      itemsList.innerHTML = `<p style="color:var(--accent-rose); padding:20px;">${ui.escapeHtml(ui.friendlyError(err))}</p>`;
    }
  }

  async function renderDecryptedFileCard(m, container) {
    let name = 'File', size = 0, mime = 'application/octet-stream';
    try {
      const [decName, decSize, decMime] = await Promise.all([
        crypto.decryptJSON(currentRoomKey, m.encName),
        crypto.decryptJSON(currentRoomKey, m.encSize),
        crypto.decryptJSON(currentRoomKey, m.encMime),
      ]);
      name = decName.v;
      size = decSize.v;
      mime = decMime.v;
      receiverMetas.set(m.fileId, { name, size, mime });
    } catch {
      return;
    }

    const card = document.createElement('div');
    card.className = 'received-card pop-in';
    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
        <div class="file-left">
          <div class="file-icon-box">${ui.getFileIcon(mime, name)}</div>
          <div class="file-info">
            <div class="file-name">${ui.escapeHtml(name)}</div>
            <div class="file-size">${ui.fmtBytes(size)} · ${ui.escapeHtml(mime)}</div>
          </div>
        </div>
        <button class="btn-primary dl-btn" style="width: auto; padding: 10px 18px; font-size: 14px;" type="button">
          Download
        </button>
      </div>
      <div class="preview-slot"></div>
    `;

    const dlBtn = card.querySelector('.dl-btn');
    const previewSlot = card.querySelector('.preview-slot');

    // Auto-preview images or audio
    if (mime.startsWith('image/')) {
      const imgBtn = document.createElement('button');
      imgBtn.className = 'btn-secondary';
      imgBtn.style.marginTop = '10px';
      imgBtn.style.width = '100%';
      imgBtn.textContent = '🖼️ Click to Preview Image';
      imgBtn.onclick = async () => {
        imgBtn.disabled = true;
        imgBtn.textContent = 'Decrypting preview…';
        try {
          const blob = await fetchAndDecryptBlob(m.fileId, mime);
          const url = URL.createObjectURL(blob);
          const img = document.createElement('img');
          img.className = 'image-preview-thumb';
          img.src = url;
          img.onclick = () => ui.openLightbox(url, name);
          imgBtn.replaceWith(img);
        } catch {
          imgBtn.disabled = false;
          imgBtn.textContent = 'Preview failed — retry';
        }
      };
      previewSlot.appendChild(imgBtn);
    } else if (mime.startsWith('audio/')) {
      const audioBtn = document.createElement('button');
      audioBtn.className = 'btn-secondary';
      audioBtn.style.marginTop = '10px';
      audioBtn.style.width = '100%';
      audioBtn.textContent = '🎵 Load In-Browser Audio Player';
      audioBtn.onclick = async () => {
        audioBtn.disabled = true;
        audioBtn.textContent = 'Decrypting audio…';
        try {
          const blob = await fetchAndDecryptBlob(m.fileId, mime);
          const box = document.createElement('div');
          audioBtn.replaceWith(box);
          await audio.enhance(box, URL.createObjectURL(blob));
        } catch {
          audioBtn.disabled = false;
          audioBtn.textContent = 'Audio load failed';
        }
      };
      previewSlot.appendChild(audioBtn);
    }

    dlBtn.onclick = async () => {
      dlBtn.disabled = true;
      dlBtn.textContent = 'Decrypting…';
      try {
        const blob = await fetchAndDecryptBlob(m.fileId, mime);
        downloadBlob(blob, name);
        dlBtn.disabled = false;
        dlBtn.textContent = 'Downloaded ✓';
        ui.toast(`Downloaded ${name} ✓`, 'success');
      } catch (err) {
        dlBtn.disabled = false;
        dlBtn.textContent = 'Download';
        ui.toast(`Download failed: ${err.message}`, 'error');
      }
    };

    container.appendChild(card);
  }

  async function renderDecryptedTextCard(t, container) {
    let plainText = '';
    try {
      plainText = await crypto.decryptText(currentRoomKey, t.iv, t.data);
    } catch {
      return;
    }

    const card = document.createElement('div');
    card.className = 'received-card pop-in';
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-weight: 700; font-size: 14px;">💻 Snippet <span style="font-size: 12px; color: var(--text-muted); font-weight: normal;">(${ui.escapeHtml(t.language)})</span></span>
        <button class="btn-secondary copy-snippet-btn" style="padding: 6px 12px; font-size: 12px;" type="button">Copy</button>
      </div>
      <pre style="background: rgba(0,0,0,0.35); padding: 12px; border-radius: var(--radius-md); overflow-x: auto; max-height: 260px;"><code class="language-${t.language}">${ui.escapeHtml(plainText)}</code></pre>
    `;

    card.querySelector('.copy-snippet-btn').onclick = () => {
      ui.copyText(plainText, 'Snippet copied ✓');
    };

    container.appendChild(card);
  }

  async function fetchAndDecryptBlob(fileId, mime) {
    const res = await fetch(`/api/files/${fileId}/download?roomId=${encodeURIComponent(currentRoomId)}`, {
      headers: { 'x-session-fingerprint': ui.getFingerprint() },
    });
    if (!res.ok) throw new Error('Download failed from server');
    const cipherBuf = await res.arrayBuffer();
    const plainBytes = await crypto.decryptFramed(currentRoomKey, cipherBuf);
    return new Blob([plainBytes], { type: mime || 'application/octet-stream' });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  async function downloadZipAll() {
    const zipBtn = document.getElementById('zipDownloadBtn');
    if (!receiverMetas.size) return;

    zipBtn.disabled = true;
    zipBtn.textContent = 'Preparing ZIP…';

    try {
      await ui.loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
      const zip = new window.JSZip();
      let count = 0;

      for (const [fileId, info] of receiverMetas) {
        zipBtn.textContent = `Decrypting ${++count}/${receiverMetas.size}…`;
        const blob = await fetchAndDecryptBlob(fileId, info.mime);
        zip.file(info.name, await blob.arrayBuffer());
      }

      zipBtn.textContent = 'Compressing…';
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `FileNova_${currentRoomCode}.zip`);
      ui.toast('ZIP file downloaded ✓', 'success');
    } catch (err) {
      ui.toast(`ZIP failed: ${err.message}`, 'error');
    } finally {
      zipBtn.disabled = false;
      zipBtn.textContent = 'Download All as ZIP';
    }
  }

  /* ===================================================================
     7. URL AUTO-JOIN CHECK
     =================================================================== */
  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code') || params.get('id');
    if (code && /^[A-Z0-9]{6}$/i.test(code.trim())) {
      document.getElementById('tabReceive').click();
      const cleanCode = code.trim().toUpperCase();
      const inputs = document.querySelectorAll('.otp-input');
      for (let i = 0; i < 6; i++) {
        if (inputs[i]) inputs[i].value = cleanCode[i] || '';
      }
      setTimeout(() => document.getElementById('joinSubmitBtn').click(), 200);
    }
  }

  /* ===================================================================
     8. BOOTSTRAP
     =================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initTabs();
    initDropzone();
    initSnippetModal();
    initRoomCreation();
    initOtpInputs();
    checkUrlParams();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  });
})();
