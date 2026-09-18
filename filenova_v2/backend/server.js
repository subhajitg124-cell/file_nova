'use strict';

/**
 * FileNova v2 backend entry.
 * Express + Socket.io. Serves ONLY ../frontend as the production site.
 *
 * Production runs behind a TLS reverse proxy (Nginx/Caddy) — HTTPS is
 * enforced there; Helmet + HSTS headers are set here as defence in depth.
 */

require('dotenv').config();

const path = require('path');
const http = require('http');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { Server } = require('socket.io');

const roomRoutes = require('./routes/room');
const uploadRoutes = require('./routes/upload');
const fileRoutes = require('./routes/files');
const textRoutes = require('./routes/text');
const roomStore = require('./utils/roomStore');
const { startCleanup } = require('./utils/cleanup');

const PORT = Number(process.env.PORT || 3100);
const FRONTEND_DIR = path.resolve(__dirname, process.env.FRONTEND_DIR || '../frontend');
const CORS_ORIGINS = (process.env.CORS_ORIGIN || `http://localhost:${PORT}`)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CORS_ORIGINS, methods: ['GET', 'POST'] },
});
app.set('io', io);

if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

app.use(
  helmet({
    contentSecurityPolicy: false, // frontend is vanilla static in Step 4+; CSP lands with it
    hsts: { maxAge: 31536000, includeSubDomains: true },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors({ origin: CORS_ORIGINS }));
app.use(express.json({ limit: '256kb' })); // room/text APIs are small JSON; file bytes use multipart in upload.js
app.disable('x-powered-by');

// ── API ─────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'filenova-v2', rooms: roomStore.count(), now: Date.now() });
});

app.use('/api/rooms', roomRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/texts', textRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'not_found',
    message: `Unknown API route: ${req.method} ${req.path}`,
  });
});

// ── Static frontend (production serves ONLY /filenova_v2/) ──────────

app.use(express.static(FRONTEND_DIR, { extensions: ['html'], maxAge: '1h' }));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/socket.io/')) return next();
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'), (err) => {
    if (err) next(err);
  });
});

// ── Errors ──────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[server] unhandled error:', err && err.message);
  res.status(500).json({
    error: 'internal_error',
    message: 'Something went wrong processing your request.',
    howToFix: 'Please retry. If it persists, ask the sender to create a fresh room.',
  });
});

// ── Realtime: presence + server-emitted transfer events ───────────────
// Statuses: waiting → receiver-joined → sending → file-ready / text-added → done.
// Clients also get per-chunk progress via the room:signal relay above.

io.on('connection', (socket) => {
  socket.on('room:watch', ({ roomId }) => {
    if (typeof roomId !== 'string') return;
    const room = roomStore.findById(roomId);
    if (!room) {
      socket.emit('room:status', { roomId, status: 'expired' });
      return;
    }
    socket.join(`room:${roomId}`);
    socket.emit('room:status', roomStore.toPublicStatus(room));
  });

  socket.on('room:signal', ({ roomId, event, payload }) => {
    // Sender→receiver progress relay (upload progress bars); completion uses
    // server-emitted file-ready / text-added events from the API routes.
    if (typeof roomId !== 'string' || typeof event !== 'string') return;
    if (!['sending', 'progress', 'done'].includes(event)) return;
    socket.to(`room:${roomId}`).emit('room:status', { roomId, status: event, ...(payload || {}) });
  });
});

startCleanup(roomStore);

if (require.main === module) {
  try {
    // Fail fast when the pepper is missing — hashing would be insecure without it.
    require('./utils/crypto').getPepper();
  } catch (err) {
    console.error(`[server] ${err.message}`);
    process.exit(1);
  }
  server.listen(PORT, () => {
    console.log(`[filenova-v2] listening on :${PORT}`);
    console.log(`[filenova-v2] frontend: ${FRONTEND_DIR}`);
  });
}

module.exports = { app, server, io };
