# FileNova — Project Context

**Purpose:** Enable any AI agent to understand FileNova before modifying code.

---

## 1. What Is FileNova?

FileNova is a **premium AI-powered document productivity platform** designed specifically for **Indian users** — students, CSC (Common Service Centre) operators, and cyber cafe owners.

It provides **30+ browser-based document tools** covering PDF processing, image editing, Office document conversion, OCR, AI summarization, and more. The platform emphasizes:
- **Privacy-first**: Client-side processing where possible
- **Speed**: Optimized for low-end devices and slow networks
- **Simplicity**: One-click workflows for common Indian government portal requirements
- **Accessibility**: Multi-language support (15+ Indian languages)
- **Affordability**: Freemium model with cheap Indian pricing (₹49–₹199/month)

---

## 2. Business Model

### 2.1 Target Users
- **Students**: Scholarship applications, passport photos, document compilation
- **CSC Operators**: Bulk document processing for rural customers
- **Cyber Cafes**: High-volume PDF/image processing
- **General Public**: Government portal submissions (DigiLocker, IRCTC, etc.)

### 2.2 Pricing Tiers (Indian Rupees)
| Tier | Monthly | Upload Limit | Feature Limits |
|------|---------|-------------|----------------|
| Free | ₹0 | 3 MB | 3 uses/day |
| Basic | ₹49 | 15 MB | Higher limits |
| Pro | ₹99 | 50 MB | Bulk processing (10 files), AI tools |
| Elite | ₹199 | 100 MB | Unlimited, priority support |

### 2.3 Payment Methods
- **Razorpay**: Cards, UPI, netbanking, wallets
- **UPI Direct**: QR code + UPI ID deep links
- **Coupons**: Admin-created discount codes

---

## 3. Technology Stack

### 3.1 Frontend (`artifacts/file-nova/`)
| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 5.9 (strict) |
| Bundler | Vite 7 |
| Styling | Tailwind CSS 4.1 |
| Router | Wouter |
| State | Zustand + TanStack Query |
| UI Primitives | Radix UI + shadcn/ui |
| Forms | React Hook Form + Zod |
| Animations | Framer Motion (LazyMotion + domAnimation) |
| Icons | lucide-react |
| PDF | pdf-lib, pdfjs-dist |
| Images | Canvas API, @imgly/background-removal |
| AI (client) | ONNX Runtime, Tesseract.js |
| Office | xlsx, pptxgenjs, marked |
| Auth | @react-oauth/google |
| Theme | Custom `useTheme` hook + CSS classes |
| i18n | Custom React context (`i18n.tsx`) |
| SEO | @unhead/react |

### 3.2 Backend (`artifacts/api-server/`)
| Layer | Technology |
|-------|-----------|
| Framework | Express 5 (TypeScript) |
| Runtime | Node.js |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Validation | Zod |
| Auth | Session tokens (DB) + Google OAuth |
| File Upload | Multer |
| Payments | Razorpay SDK |
| Email | Nodemailer |
| Logging | Pino |
| Security | Helmet, CORS, cookie-parser |
| Rate Limiting | express-rate-limit |
| AI | Google Gemini SDK, Anthropic SDK |

### 3.3 Shared Libraries (`lib/`)
| Package | Purpose |
|---------|---------|
| `db` | Drizzle schema, migrations, DB connection |
| `api-zod` | Shared Zod schemas |
| `api-client-react` | Generated React API client |
| `intelligent-search` | Trie-based search with fuzzy matching |

### 3.4 Legacy Backend (`backend/`)
- Simple Flask (Python) health-check server
- Located at `backend/main.py`
- Provides `/api/healthz` endpoint
- **Note:** Primary processing is handled by Express API server

---

## 4. Architecture Overview

### 4.1 High-Level Diagram

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│   Browser (User)    │────▶│   Frontend (Vite)   │────▶│   API Server    │
│   React 19 SPA      │     │   artifacts/file-nova│     │   Express 5     │
│                     │     │                     │     │                 │
│ • Routes (Wouter)  │     │ • Zustand Stores    │     │ • Multer Upload │
│ • Zustand/React QQ │     │ • React Query       │     │ • Drizzle ORM   │
│ • Framer Motion    │     │ • Framer Motion     │     │ • Zod Validate  │
│ • Radix UI         │     │ • Radix Primitives  │     │ • Session Auth  │
└─────────────────────┘     └─────────────────────┘     └────────┬────────┘
                                                                 │
                                                          ┌───────▼───────┐
                                                          │   PostgreSQL  │
                                                          │   Production  │
                                                          └───────────────┘
```

### 4.2 Key Patterns

- **Mock Mode**: Frontend works without backend using `apiMock` fallbacks
- **Health Checks**: Frontend polls `/api/healthz` and falls back to mock if offline
- **Client-Side Processing**: Many tools (PDF, image) run entirely in browser
- **Progressive Enhancement**: Works without backend; backend adds capabilities

---

## 5. Feature Inventory

### 5.1 Document Tools (30+)

**PDF Tools:**
- Merge PDF, Split PDF, Compress PDF, Rotate PDF
- PDF to Word, PDF to JPG, JPG to PDF
- Unlock PDF, Protect PDF, Resize PDF
- PDF OCR, AI PDF Summary
- Compress PDF for Upload (portal-specific)

**Image Tools:**
- Resize Image, Compress Image, Enhance Image
- Remove Background (AI), Crop Image
- Rotate & Flip, Convert Format
- Passport Photo Editor, Live Video Editor

**Office/Document Tools:**
- Word to PDF, Compress DOC/DOCX
- OCR Scan-to-Text

**India-Specific Tools:**
- PAN Card Resize (NSDL/UTI requirements)
- Aadhaar Mask PDF
- Government Form Fill
- Scholarship ZIP Maker
- Exam Toolkit

**AI Tools:**
- AI PDF Summary
- AI Background Remover
- AI PPT Maker
- AI Assistant (chat)

### 5.2 Core Features

| Feature | Implementation | Location |
|---------|---------------|----------|
| Search | Trie + Fuzzy + Ranking | `src/search/`, `src/lib/search/` |
| Workspace | Zustand + Drag & Drop | `src/components/workspace/` |
| Dashboard | React Query + Zustand | `src/pages/DashboardPage.tsx` |
| AI Assistant | Gemini/Anthropic + Context | `src/assistant/` |
| Authentication | Email/Google/OAuth | `src/store/useAuthStore.ts` |
| Pricing | Razorpay + UPI | `src/pages/PricingPage.tsx` |
| Admin | Express middleware | `src/lib/admin.tsx` |
| i18n | React Context + Dictionary | `src/lib/i18n.tsx` |
| Theme | Custom hook + CSS | `src/hooks/useTheme.ts` |
| PWA | Vite PWA plugin | `vite.config.ts` |
| Offline | Service Worker | `src/OfflineBanner.tsx` |
| Blog | Static content | `src/data/blogPosts.ts` |
| Referrals | DB-tracked links | API: `/api/v1/referral` |
| File History | DB table | API: `/api/v1/history` |

### 5.3 Admin Features

- `/nova-control` — Main admin dashboard
- `/admin/analytics` — Usage analytics
- `/admin/upi-payments` — UPI payment management
- `/admin/coupons` — Coupon code management
- `/nova-login` — Admin authentication

---

## 6. Database Schema (Key Tables)

See `lib/db/src/schema/index.ts` for full definitions.

| Table | Purpose |
|-------|---------|
| `users` | User accounts, roles, preferences |
| `sessions` | Session tokens (30-day expiry) |
| `referrals` | Referral tracking and rewards |
| `event_rules` | Indian government event/document configurations |
| `document_rules` | Per-document validation rules |
| `processing_jobs` | File processing job tracking |
| `uploaded_files` | Individual file records per job |
| `analytics_events` | Usage tracking |
| `file_history` | User file processing history |
| `subscriptions` | Premium subscription records |
| `coupons` | Discount codes |

---

## 7. Authentication Flow

1. **Entry**: User visits any page
2. **Init**: `useAuthStore.fetchMe()` checks session token from localStorage
3. **Validation**: Sends token to `/api/v1/auth/me`
4. **Response**: Backend validates token against DB sessions table
5. **State**: Store populated with user profile + subscription
6. **Fallback**: If no token, user remains in anonymous/guest state

**Login Methods:**
- **Email + Password**: Standard signup/login
- **Google OAuth**: `@react-oauth/google` client, verified server-side
- **Local Fallback**: localStorage-based accounts when backend unavailable

**Session:** 30-day HTTP-only cookie + DB record

---

## 8. Upload & Processing Pipeline

### 8.1 Upload Flow

```
User selects files
    ↓
Frontend validates (size, type via Zod)
    ↓
POST /api/v1/upload (multipart/form-data)
    ↓
Backend: Multer → temp dir
    ↓
Backend: Zod validation (MIME, size)
    ↓
Backend: Sanitize filenames (path.traversal check)
    ↓
Backend: Create Job record in Map
    ↓
Response: { files: [{ temp_filename, filename, size, mime_type }] }
    ↓
Frontend: Update Zustand store
```

### 8.2 Processing Flow

```
Frontend: POST /api/v1/process?job_id={id}
    ↓
Body: { operation: string, options: Record }
    ↓
Backend: Execute system command (LibreOffice, FFmpeg, etc.)
    ↓
Backend: Update Job status (queued → processing → completed/failed)
    ↓
Frontend: Poll /api/v1/status/{job_id} every 1s
    ↓
On complete: GET /api/v1/download/{job_id}
    ↓
Download file to user
```

### 8.3 Bulk Processing

- Route: `POST /api/v1/bulk-process`
- Requires Pro/Elite tier
- Max 10 files per request
- Parallel processing in backend

---

## 9. AI Assistant Architecture

### 9.1 Two Assistants

1. **FileNovaAssistant** (`components/FileNovaAssistant.tsx`)
   - General helpdesk
   - Open via floating button or `openAIAssistant` event
   - Calls `/api/v1/ai/chat`
   - Preset prompts for common questions

2. **SmartAssistant** (`assistant/components/SmartAssistant.tsx`)
   - Context-aware (knows current tool, files, operation)
   - Integrated with workspace
   - Tool-specific guidance via adapters
   - Session history + follow-up suggestions

### 9.2 AI Providers
- **Google Gemini**: Primary (via `@google/genai`)
- **Anthropic Claude**: Secondary (via `@anthropic-ai/sdk`)
- **Fallback**: Mock responses in no-backend mode

---

## 10. Search Architecture

### 10.1 Trie Search (`src/lib/search/Trie.ts`)
- Builds prefix tree from tool names, keywords, aliases
- O(k) lookup where k = query length

### 10.2 Fuzzy Matching (`src/lib/search/Fuzzy.ts`)
- Levenshtein distance scoring
- Multi-word partial matching
- Threshold-based filtering

### 10.3 Ranking (`src/lib/search/Ranking.ts`)
- Click tracking via localStorage
- "Recent tools" tracking
- Synonym/alias expansion
- Scoring algorithm: `exact > alias > fuzzy > partial`

### 10.4 Search UI
- Dropdown with grouped results (Recent, Popular, Suggestions)
- Keyboard navigation (↑↓ Enter Escape)
- Debounced input (300ms)

---

## 11. Theme System

### 11.1 Implementation

- `src/hooks/useTheme.ts` — hook + subscriber pattern
- Persists to `localStorage` key: `filenova-theme`
- Applies CSS class (`light` or `dark`) to `document.documentElement`

### 11.2 Token System

Uses CSS custom properties defined in Tailwind config:
```css
--background: 0 0% 100%;        /* Light */
--foreground: 222.2 84% 4.5%;
--primary: 222.2 47.4% 11.2%;
/* Dark variants */
--background: 222.2 84% 4.5%;
--foreground: 210 40% 98%;
```

---

## 12. Internationalization (i18n)

### 12.1 Supported Languages
English (en), Bengali (bn), Hindi (hi), Nepali (ne), Santali (sat), Telugu (te), Marathi (mr), Tamil (ta), Gujarati (gu), Kannada (kn), Malayalam (ml), Punjabi (pa), Odia (or), Assamese (as), Urdu (ur)

### 12.2 Implementation
- `src/lib/i18n.tsx` — React Context + `useTranslation` hook
- Dictionary object with translations for all UI strings
- Dynamic translations block for hardcoded English content
- `tText()` function translates UI strings
- `t()` function with key-based lookups

### 12.3 Limitations
- Not fully comprehensive (some strings hardcoded)
- Requires manual addition of new keys
- No pluralization or interpolation helpers yet

---

## 13. Feature Flags

Managed via `src/features.config.ts`:
- Environment-based activation (`development`, `staging`, `production`, `test`)
- Per-feature toggles (whatsapp, digilocker, voice, scanner, etc.)
- localStorage override support for testing

---

## 14. Build & Deployment

### 14.1 Scripts (root `package.json`)
```bash
pnpm dev              # Start frontend + backend
pnpm build            # Build all packages
pnpm test             # Run database tests
pnpm typecheck        # Type check all
pnpm --filter @workspace/file-nova run dev    # Frontend only
pnpm --filter @workspace/api-server run dev   # Backend only
```

### 14.2 Frontend Build
- Vite 7 with React plugin
- Output: `artifacts/file-nova/dist/`
- Includes prerender plugin for SSR-like HTML
- PWA manifest at `public/manifest.json`
- Vercel config: `vercel.json`

### 14.3 Backend Build
- esbuild bundles to `artifacts/api-server/dist/`
- TypeScript source maps enabled
- Single `index.mjs` entry point

### 14.4 Deployment Targets
- **Primary**: Vercel (frontend) + Railway (backend)
- **Alternative**: Docker + self-hosted
- **Legacy**: Flask backend at `/api/healthz`

---

## 15. Critical Integration Points

### 15.1 API Base URL
- Frontend reads `VITE_API_URL` or `VITE_BACKEND_URL` from env
- Falls back to empty string → mock mode
- Production: `https://api.filenova.in` (expected)

### 15.2 Health Check
- Frontend polls `${BACKEND_URL}/api/healthz` every 60s
- On failure: switches to mock mode automatically
- Shows `ConnectionStatusIndicator` banner

### 15.3 Cookie Handling
- Session cookie: `session_token` (HTTP-only, SameSite=Lax)
- Frontend reads from `document.cookie` as fallback for auth

### 15.4 File Expiry
- Backend: files auto-delete after `UPLOAD_TTL_MINUTES` (default 60)
- Frontend: `FileExpiryBar` shows remaining time
- `useFileExpiry` hook tracks countdown

---

## 16. Known Technical Debt

| Area | Issue |
|------|-------|
| Backend | In-memory `jobs` Map — lost on restart |
| Backend | Preview endpoint serves from temp dir — memory heavy |
| Frontend | Some i18n strings hardcoded in components |
| Frontend | Error boundaries are minimal |
| Frontend | Mock mode has complex `window.fetch` interception |
| Shared | Multiple search implementations (2 directories) |
| Legacy | Old Flask backend still present |
| Build | `.migration-backup/` contains stale code |

---

## 17. Key File References

| Concept | Primary File(s) |
|---------|----------------|
| App Root | `artifacts/file-nova/src/App.tsx` |
| Router | `App.tsx` (Wouter `<Switch>`) |
| Auth State | `artifacts/file-nova/src/store/useAuthStore.ts` |
| File State | `artifacts/file-nova/src/store/useFileStore.ts` |
| API Client | `artifacts/file-nova/src/lib/api.ts` |
| Theme | `artifacts/file-nova/src/hooks/useTheme.ts` |
| i18n | `artifacts/file-nova/src/lib/i18n.tsx` |
| Search Engine | `artifacts/file-nova/src/lib/search/Engine.ts` |
| Tool Content | `artifacts/file-nova/src/data/toolContent.ts` |
| DB Schema | `lib/db/src/schema/index.ts` |
| API Routes | `artifacts/api-server/src/routes/apiV1.ts` |
| Auth Middleware | `artifacts/api-server/src/middlewares/auth.ts` |
| Upload Handler | `artifacts/api-server/src/routes/apiV1.ts` (line ~158) |
| Tool Registry | `artifacts/file-nova/src\components\workspace\WorkspaceRegistry.tsx` |

---

## 18. Development Gotchas

1. **Mock mode is complex**: `App.tsx` intercepts `window.fetch` globally for simulated latency/offline
2. **Backend is optional**: Frontend works standalone but some features degrade
3. **Session tokens**: Stored in both `session_token` (cookie) and `filenova_token` (localStorage)
4. **File TTL**: Backend automatically cleans; frontend shows countdown bar
5. **Feature flags**: Check `isFeatureEnabled()` before using premium/experimental features
6. **Google OAuth**: Client ID in `VITE_GOOGLE_CLIENT_ID` env var
7. **Razorpay**: India-only payment gateway, key in env
8. **Zod v4**: Uses `zod/v4` imports in some places
9. **Tailwind v4**: Uses CSS-based config, not `tailwind.config.js`
10. **Wouter**: Lightweight router — no `<Link>` from react-router
