# FileNova v2

No-login, peer-to-peer inspired file / image / audio / text sharing.
Faster, more secure, and better-looking than ShareBy.io.

> **Serving rule:** production (`filenova.in`) serves **ONLY** `/filenova_v2/`.
> Old code is archived untouched under `/legacy_filenova/` (see that folder's README).

## Status

All 10 steps built:

- [x] Step 1 — folder structure + `backend/package.json` + `.env.example`
- [x] Step 2 — room creation, code generation, expiry logic
- [x] Step 3 — encrypted chunked upload/download + text snippets
- [x] Steps 4–6 — landing + sender room + join + receive frontend
- [x] Step 7 — WebSocket realtime status + progress relay (polling fallback)
- [x] Step 8 — rate limits, PIN, filename-blind storage, auto-delete
- [x] Step 9 — QR, WhatsApp share, ZIP download, gallery, confetti, toasts, skeletons
- [x] Step 10 — PWA manifest + service worker + offline page

## Quick start (VPS or local)

```bash
cd filenova_v2/backend
cp .env.example .env   # then set ROOM_CODE_PEPPER to a long random string
npm install
npm run dev            # http://localhost:3100
```

Health check: `GET /api/health` → `{ "ok": true, ... }`.

## API

| Method | Endpoint                  | Purpose                                  |
|--------|---------------------------|------------------------------------------|
| POST   | `/api/rooms`              | Create room. Body: `expiresIn`, `pin?`   |
| POST   | `/api/rooms/join`         | Join with `code` (+ `pin?`)              |
| GET    | `/api/rooms/:id/status`   | Room status (needs `roomId`, never code) |
| POST   | `/api/upload/init`        | Start encrypted chunked upload           |
| POST   | `/api/upload/chunk`       | Send one encrypted chunk (multipart)     |
| GET    | `/api/upload/:id/state`   | Resume offset for an upload              |
| POST   | `/api/upload/complete`    | Finalise upload → notifies receiver      |
| GET    | `/api/files?roomId=`      | List file headers (names decrypt client-side) |
| GET    | `/api/files/:id/download` | Ciphertext stream (attachment)           |
| POST   | `/api/texts`              | Share encrypted text/code snippet        |
| GET    | `/api/texts?roomId=`      | List snippets                            |
| GET    | `/api/health`             | Health check                             |

## Encryption model

- Room key = PBKDF2-SHA256 (60k rounds) over `CODE::PIN` with the server-issued
  per-room salt. Both browsers derive it independently; the server stores only
  ciphertext + framing (`[4B len][12B IV][AES-256-GCM chunk]`).
- Filenames, sizes and MIME types are encrypted metadata — the server never
  sees them. Plain room codes are returned once and never stored.

`expiresIn` allowlist: `10m` · `30m` · `1h` · `24h`.

All mutating calls need a session fingerprint:
header `x-session-fingerprint: <16–128 chars>` (browser fingerprint + timestamp, client-generated).
The server only stores its SHA-256 hash — never the raw value.

## Security model (must beat ShareBy.io)

- Room codes: 6-char, unambiguous alphabet (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`),
  returned **once** at creation, stored **only as SHA-256(code + pepper)**.
- Optional 4-digit room PIN, salted + hashed, verified with timing-safe compare.
- Room links use non-guessable UUID v4 `roomId`; codes are only for joining.
- Expired rooms are hard-deleted (metadata + cron sweeps blobs) every minute.
- Rate limits: 20 room-creates / 15 min / IP, 30 joins / 10 min / IP.
- Helmet headers + HSTS, CORS allowlist, HTTPS enforced at reverse proxy.

## Layout

```
filenova_v2/
  backend/
    server.js            ← Express + Socket.io entry
    routes/room.js       ← Step 2: create / join / status
    routes/upload.js     ← Step 3 stub (501 until built)
    middleware/rateLimit.js
    middleware/auth.js   ← fingerprint validation
    utils/crypto.js      ← codes, hashing, AES-256-GCM helpers
    utils/roomStore.js   ← JSON-file room persistence
    utils/cleanup.js     ← node-cron auto-delete
    uploads/             ← encrypted blobs (auto-cleaned)
    data/                ← rooms.json (gitignored)
  frontend/              ← stubs until Steps 4–6
```
