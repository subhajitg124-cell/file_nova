# legacy_filenova — archive pointer

> **Do NOT delete or modify anything described here.**

Per the rebuild decision (Sep 2026), the original FileNova codebase
(React + Vite frontend in `artifacts/file-nova/`, Express + Drizzle backend
in `artifacts/api-server/`, `lib/`, `backend/`, scripts, docs) stays **in place
at the repository root** so git history, current builds, and deploys keep working.

This `legacy_filenova/` folder exists as the named archive slot:
- **Safe-archive mode (active):** original files remain at root; nothing was
  moved or rewritten. Treat root as the read-only v1 reference.
- If a future full physical archive is approved, `git mv` each root entry
  (except `filenova_v2/` and this folder) in here — and update deploy config
  at the same time, since root `package.json` / Docker / Railway / Vercel
  configs currently point at the old tree.

Production (`filenova.in`) serves **ONLY** `/filenova_v2/` going forward.
