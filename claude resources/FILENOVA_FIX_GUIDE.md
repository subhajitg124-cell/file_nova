# FileNova — Complete Fix Guide
# Fix 1: Banner disappears immediately (Vercel serverless)
# Fix 2: Full backend online (Railway deployment)
# =====================================================================

## THE PROBLEM (Diagnosed)

Your architecture has:
  - React frontend → deployed on Vercel ✅
  - Express API server (artifacts/api-server/) → NOT deployed ❌
  - PostgreSQL DB → NOT provisioned ❌

The frontend calls `/api/health` → gets 404 on Vercel → shows red banner.
Admin dashboard shows "Offline" because the same health check fails.

═══════════════════════════════════════════════════════════════════
## FIX 1: IMMEDIATE — Remove red banner (5 minutes)
═══════════════════════════════════════════════════════════════════

Step 1: Copy these files into your project root:

  filenova-fixes/
  ├── api/health.ts           → copy to <your_repo>/api/health.ts
  ├── api/server-status.ts    → copy to <your_repo>/api/server-status.ts
  └── vercel.json             → copy to <your_repo>/vercel.json  (REPLACE existing)

Step 2: Install @vercel/node types (only needed for TypeScript):

  pnpm add -D @vercel/node --filter file-nova
  # OR at workspace root:
  pnpm add -D @vercel/node

Step 3: Git commit and push:

  git add api/health.ts api/server-status.ts vercel.json
  git commit -m "fix: add Vercel serverless health endpoints to fix server unavailable banner"
  git push origin main

Step 4: Vercel auto-deploys → visit filenova.in → red banner gone ✅
        Admin dashboard → Backend Status shows "Static Mode" instead of "Offline" ✅

═══════════════════════════════════════════════════════════════════
## FIX 2: FULL BACKEND — Make everything truly online (30 minutes)
═══════════════════════════════════════════════════════════════════

Use Railway.app — free $5/month credit, supports Node.js + PostgreSQL,
perfect for Indian students, no credit card needed initially.

### Step 1: Create Railway account
  → Go to https://railway.app
  → Sign in with GitHub (same account: subhajitg124-cell)

### Step 2: New Project from GitHub repo
  → Click "New Project" → "Deploy from GitHub repo"
  → Select: subhajitg124-cell/file_nova
  → Railway auto-detects Node.js

### Step 3: Add PostgreSQL database
  → In your Railway project, click "+ New"
  → Select "Database" → "PostgreSQL"
  → Railway creates DB and auto-sets DATABASE_URL in your service

### Step 4: Set Environment Variables in Railway
  → Go to your service → "Variables" tab
  → Add ALL variables from .env.railway (see that file)
  → IMPORTANT: The DATABASE_URL is auto-added when you add PostgreSQL plugin

  Minimum required:
    NODE_ENV = production
    PORT = 3000
    APP_URL = https://filenova.in
    CORS_ORIGINS = https://filenova.in,https://www.filenova.in
    ENCRYPTION_MASTER_KEY = [run: openssl rand -hex 32]
    SESSION_SECRET = [run: openssl rand -hex 32]
    JWT_SECRET = [run: openssl rand -hex 32]

### Step 5: Copy railway.toml to project root
  → Copy filenova-fixes/railway.toml to <your_repo>/railway.toml
  → git add railway.toml && git commit -m "fix: add railway deployment config" && git push

### Step 6: Configure Railway build settings
  → Railway Dashboard → your service → Settings
  → Build Command: pnpm install && pnpm run build
  → Start Command: node --enable-source-maps artifacts/api-server/dist/index.mjs
  → Root Directory: (leave blank, use repo root)

### Step 7: Get your Railway URL and update Vercel env
  → Railway Dashboard → your service → Settings → Domains
  → Copy the URL (e.g. filenova-api-production.up.railway.app)
  → Go to Vercel Dashboard → filenova.in project → Settings → Environment Variables
  → Add: VITE_API_URL = https://filenova-api-production.up.railway.app

### Step 8: Run DB migrations
  → Railway Dashboard → your service → "Shell" tab (or Deploy Logs)
  → The app should auto-run migrations on startup
  → If not, in Railway shell: pnpm run db:migrate:prod

### Step 9: Update frontend API base URL
  In your frontend (likely client/src/lib/api.ts or similar), make sure:

    const API_BASE = import.meta.env.VITE_API_URL || '';

  Then all API calls like fetch('/api/health') should use:

    fetch(`${API_BASE}/api/health`)

  Vercel already has /api/health as a serverless function,
  but for DB-backed routes like /api/premium/*, the frontend
  needs to point to Railway.

═══════════════════════════════════════════════════════════════════
## FIX 3: UPI PAYMENT BUTTONS (Chai ₹10 & Support ₹50)
═══════════════════════════════════════════════════════════════════

Find your Footer component (grep for "Chai" in your client/src folder).
Replace the button onClick handlers with:

  const openUPI = (amount: number, note: string) => {
    window.location.href = 
      `upi://pay?pa=9064560741@slc&pn=Subhajit+Ghosh&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  };

  <button onClick={() => openUPI(10, 'Chai for FileNova')}>☕ Chai (₹10)</button>
  <button onClick={() => openUPI(50, 'Support FileNova')}>💝 Support (₹50)</button>

═══════════════════════════════════════════════════════════════════
## SUMMARY OF WHAT EACH FILE DOES
═══════════════════════════════════════════════════════════════════

  api/health.ts          → Vercel serverless → fixes red banner immediately
  api/server-status.ts   → Powers Admin Dashboard "Backend Status" card  
  vercel.json            → Fixes routing so /api/* goes to serverless, 
                           everything else goes to React SPA
  railway.toml           → Tells Railway how to start your Express server
  .env.railway           → Reference for which env vars to set in Railway

═══════════════════════════════════════════════════════════════════
## TROUBLESHOOTING
═══════════════════════════════════════════════════════════════════

Q: Vercel build fails after adding api/health.ts
A: Check that @vercel/node is in devDependencies. Also verify
   vercel.json buildCommand matches your actual build script.

Q: Railway deploy fails
A: Check Deploy Logs. Most common issue: missing env variables.
   Make sure all vars from .env.railway are set in Railway Dashboard.

Q: "Cannot find module" error on Railway
A: Run `pnpm run build` locally first to verify it compiles.
   The output should be at artifacts/api-server/dist/index.mjs

Q: CORS errors after Railway deployment  
A: Make sure CORS_ORIGINS in Railway exactly matches your Vercel URL
   with no trailing slash: https://filenova.in

Q: Admin dashboard still shows "Offline" after Fix 1
A: The Admin Dashboard likely calls a different endpoint than /api/health.
   Search your codebase for "backendStatus" or "server-status" to find
   the exact URL it polls, then add that as another Vercel function.
