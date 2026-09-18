// FileNova v2 — realtime client. Socket.io with polling fallback.
// Server statuses: waiting → receiver-joined → sending → file-ready / text-added → done.
'use strict';

window.FileNova = window.FileNova || {};

window.FileNova.socket = (() => {
  let socket = null;
  let watchRoomId = null;
  const listeners = new Set();

  function ensure() {
    if (socket || typeof window.io !== 'function') return socket;
    socket = window.io({ transports: ['websocket', 'polling'] });
    socket.on('room:status', (msg) => {
      for (const cb of listeners) {
        try { cb(msg); } catch (e) { console.error(e); }
      }
    });
    socket.on('reconnect', () => {
      if (watchRoomId) socket.emit('room:watch', { roomId: watchRoomId });
    });
    return socket;
  }

  function watch(roomId, cb) {
    watchRoomId = roomId;
    if (cb) listeners.add(cb);
    const s = ensure();
    if (s) s.emit('room:watch', { roomId });
    return supported();
  }

  function signal(roomId, event, payload) {
    const s = ensure();
    if (s) s.emit('room:signal', { roomId, event, payload });
  }

  function onStatus(cb) { listeners.add(cb); }
  function supported() { return typeof window.io === 'function'; }

  return { watch, signal, onStatus, supported };
})();
