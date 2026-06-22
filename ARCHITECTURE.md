# FileNova — System Architecture

**Purpose:** Complete technical architecture reference for developers and AI agents.

---

## 1. Architecture Overview

FileNova is a **monorepo** containing:
- **Frontend:** React 19 SPA (`artifacts/file-nova/`)
- **Backend:** Express 5 API server (`artifacts/api-server/`)
- **Shared libraries:** `lib/` (db, api-zod, search, etc.)
- **Legacy backend:** Flask health-check only (`backend/`)

### 1.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         FILE NOVA                            │
├───────────────────────────┬─────────────────────────────────┤
│      FRONTEND (Vite)      │       BACKEND (Express)         │
│  artifacts/file-nova/     │   artifacts/api-server/         │
│                           │                                 │
│  ┌─────────────────────┐  │  ┌───────────────────────────┐  │
│  │  Wouter Router       │  │  │  Express 5 + TypeScript   │  │
│  │  ├─ / (Home)         │  │  │                           │  │
│  │  ├─ /tools           │  │  │  Routes:                  │  │
│  │  ├─ /pricing         │──┼─▶│  ├─ /api/v1/upload        │  │
│  │  ├─ /dashboard       │  │  │  ├─ /api/v1/process       │  │
│  │  ├─ /:toolId         │  │  │  ├─ /api/v1/status/:id    │  │
│  │  └─ 18 canonical     │  │  │  ├─ /api/v1/download/:id  │  │
│  │     tool pages        │  │  │  ├─ /api/v1/auth/*        │  │
│  └─────────────────────┘  │  │  ├─ /api/v1/premium/*     │  │
│                           │  │  ├─ /api/v1/payments/*    │  │
│  ┌─────────────────────┐  │  │  └─ ...                    │  │
│  │  Zustand Stores      │  │  │                           │  │
│  │  ├─ useAuthStore     │  │  │  Middlewares:             │  │
│  │  └─ useFileStore     │  │  │  ├─ authMiddleware        │  │
│  └─────────────────────┘  │  │  ├─ rateLimiter            │  │
│                           │  │  ├─ uploadMiddleware       │  │
│  ┌─────────────────────┐  │  │  └─ requestTimeout         │  │
│  │  React Query         │  │  └───────────────────────────┘  │
│  │  (TanStack Query)    │  │             │                    │
│  └─────────────────────┘  │             │                    │
│                           │  ┌──────────▼──────────┐         │
│  ┌─────────────────────┐  │  │   PostgreSQL         │         │
│  │  Other Libraries     │  │  │   (Drizzle ORM)      │         │
│  │  ├─ Framer Motion   │  │  │                       │         │
│  │  ├─ Radix UI        │  │  │  Tables:              │         │
│  │  ├─ pdf-lib         │  │  │  ├─ users             │         │
│  │  ├─ pdfjs-dist      │  │  │  ├─ sessions           │         │
│  │  ├─ lucide-react    │  │  │  ├─ file_history       │         │
│  │  └─ ...             │  │  │  └─ ...               │         │
│  └─────────────────────┘  │  └───────────────────────┘         │
└───────────────────────────┴─────────────────────────────────┘
```

---

## 2. Monorepo Structure

```
file_nova/
├── package.json             # Root workspace config
├── pnpm-workspace.yaml      # Workspace packages
├── tsconfig.base.json       # Shared TS config
│
├── artifacts/               # Main application artifacts
│   ├── file-nova/          # Frontend (React + Vite)
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   │
│   │   └── src/
│   │       ├── components/       # Reusable UI components
│   │       │   ├── ui/          # Radix-based primitives
│   │       │   ├── workspace/   # Workspace components
│   │       │   └── ...          # Feature components
│   │       ├── pages/           # Route-level pages
│   │       │   ├── tools/       # Tool pages (18)
│   │       │   └── ...          # Other pages
│   │       ├── hooks/           # Custom React hooks
│   │       ├── store/           # Zustand stores (auth, file)
│   │       ├── lib/             # Utilities (api, i18n, search)
│   │       ├── search/          # Search engine (Trie/Fuzzy)
│   │       ├── assistant/       # AI assistant logic
│   │       ├── features/        # Workflows, config
│   │       ├── data/            # Static content
│   │       ├── config/          # App config (freemiumLimits, events)
│   │       ├── seo/             # SEO components
│   │       ├── sidebars/        # Tool sidebars
│   │       ├── styles/          # Event themes CSS
│   │       ├── tools/           # Shared tool components
│   │       ├── App.tsx          # Root component + routing
│   │       ├── main.tsx         # Entry point
│   │       └── index.css        # Global styles
│   │
│   └── api-server/         # Backend (Express)
│       ├── package.json
│       ├── build.mjs
│       │
│       └── src/
│           ├── app.ts           # Express setup
│           ├── index.ts         # Entry point
│           ├── routes/          # API routes
│           │   ├── apiV1.ts     # Core upload/process/download
│           │   ├── auth.ts      # Auth routes
│           │   ├── premium.ts   # Premium features
│           │   ├── referral.ts  # Referral system
│           │   ├── payments.ts  # Razorpay
│           │   ├── upiPayments.ts # UPI
│           │   ├── share.ts     # Share links
│           │   ├── health.ts    # Health check
│           │   ├── sitemap.ts   # Dynamic sitemap
│           │   └── ai-ppt.ts    # AI PPT generation
│           ├── middlewares/     # Express middlewares
│           │   ├── auth.ts      # Session authentication
│           │   ├── adminAuth.ts # Admin authorization
│           │   ├── rateLimit.ts # Rate limiting
│           │   ├── upload.ts    # Multer setup
│           │   └── timeout.ts    # Request timeout
│           ├── services/        # Business logic services
│           ├── validators/      # Zod validators
│           ├── utils/           # Utilities
│           └── lib/             # Logger, config
│
├── lib/                    # Shared libraries
│   ├── db/                 # Drizzle ORM
│   │   ├── src/
│   │   │   ├── schema/       # Table definitions (11 tables)
│   │   │   ├── index.ts      # DB connection
│   │   │   └── drizzle.config.ts
│   │   └── migrations/       # SQL migrations
│   ├── api-zod/            # Shared Zod schemas
│   ├── api-client-react/   # Generated React API client
│   └── intelligent-search/ # Standalone search library
│
├── backend/                # Legacy Flask (health check only)
│   └── main.py
│
├── docs/                   # Documentation
│   └── filemaster-ai-architecture.md
│
├── scripts/                # Build helpers
│   └── init-db.ts
│
├── sw.js                   # Service worker
├── vercel.json             # Vercel routing config
├── railway.toml            # Railway deployment config
└── Dockerfile              # Container build
```

---

## 3. Frontend Architecture

### 3.1 Routing (Wouter)
**File:** `artifacts/file-nova/src/App.tsx`

Wouter is a lightweight React router. All routes are defined in `App.tsx`:

```tsx
<Switch>
  <Route path="/"><Home /></Route>
  <Route path="/tools"><ToolsPage /></Route>
  <Route path="/merge-pdf"><MergePdf /></Route>
  {/* ... 30+ routes */}
  <Route component={NotFound} />
</Switch>
```

**Key Routes:**
| Path | Component | Lazy | Auth |
|------|-----------|------|------|
| `/` | Home | No | No |
| `/workspace` | Workspace | No | No |
| `/tools` | ToolsPage | No | No |
| `/merge-pdf` | MergePdf | Yes | No |
| `/dashboard` | DashboardPage | Yes | Yes |
| `/login` | LoginPage | Yes | No |
| `/admin/*` | Admin pages | Yes | Admin |

### 3.2 State Management

**Zustand Stores:**
```ts
// useAuthStore — auth state + methods
interface AuthState {
  user: UserProfile | null;
  subscription: UserSubscription | null;
  loading: boolean;
  fetchMe: () => Promise<void>;
  login: (email, password) => Promise<boolean>;
  logout: () => Promise<void>;
  // ...
}

// useFileStore — file processing state
interface FileState {
  files: FileRecord[];
  isProcessing: boolean;
  progress: number;
  selectedOperation: OperationType | null;
  downloadUrl: string | null;
  // ... actions
}
```

**React Query (TanStack Query):**
- Server state management (API responses)
- Caching with `staleTime`
- Background refetching
- Optimistic updates

### 3.3 Data Flow
```
User Action
    ↓
Component calls hook/store
    ↓
Hook calls apiClient (or apiMock)
    ↓
API Client calls fetch()
    ↓
Backend returns JSON
    ↓
React Query caches response
    ↓
Zustand store updated (if needed)
    ↓
Component re-renders with new data
```

### 3.4 Component Architecture

| Layer | Description | Examples |
|-------|-------------|----------|
| Pages | Route components | `Home.tsx`, `DashboardPage.tsx` |
| Features | Business logic components | `FileNovaAssistant.tsx` |
| Workspace | Document processing UI | `UploadZone.tsx`, `PreviewPanel.tsx` |
| UI Primitives | shadcn/ui components | `Button`, `Input`, `Dialog` |
| Hooks | Reusable logic | `useTheme`, `useUpload`, `useSearch` |

---

## 4. Backend Architecture

### 4.1 Express App Structure
**File:** `artifacts/api-server/src/app.ts`

```ts
const app = express();

// 1. Security
app.use(helmet());
app.use(cors({ origin: [...] }));
app.use(express.json({ limit: '50mb' }));

// 2. Logging
app.use(pinoHttp({ logger }));

// 3. Public routes (no auth)
app.use('/api', healthRouter);
app.use(sitemapRouter);

// 4. Auth middleware (global)
app.use(authMiddleware);

// 5. Rate limiting
app.use(apiLimiter);

// 6. API routes
app.use('/api/v1', requestTimeout(30000), apiV1Router);
app.use('/api', requestTimeout(30000), router);

// 7. Static files (production)
if (NODE_ENV === 'production') {
  app.use(express.static('../../file-nova/dist'));
  app.get('/*', (req, res) => res.sendFile('index.html'));
}

// 8. Error handler
app.use((err, req, res, next) => { ... });
```

### 4.2 Route Architecture

**Core API (`apiV1.ts`):**
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/health` | Service health | No |
| POST | `/upload` | Upload files | Optional |
| POST | `/bulk-process` | Bulk processing | Required |
| GET | `/preview/:filename` | Preview file | No |
| POST | `/process` | Start processing | Optional |
| GET | `/status/:id` | Job status | No |
| GET | `/download/:id` | Download result | No |
| POST | `/ocr` | OCR scan | Optional |
| POST | `/ai/chat` | AI chat | No |

**Additional Routes:**
| Route File | Prefix | Purpose |
|-----------|--------|---------|
| `auth.ts` | `/auth` | Signup, login, logout, OAuth |
| `premium.ts` | `/premium` | Premium features |
| `payments.ts` | `/payments` | Razorpay integration |
| `upiPayments.ts` | `/upi` | UPI payments |
| `referral.ts` | `/referral` | Referral tracking |
| `share.ts` | `/share` | Share links |
| `ai-ppt.ts` | `/ai-ppt` | AI PPT generation |
| `sitemap.ts` | `/sitemap.xml` | Dynamic sitemap |

### 4.3 Middleware Stack
```
Request
    ↓
Helmet (security headers)
    ↓
CORS (origin validation)
    ↓
Body Parser (JSON + URL-encoded)
    ↓
Cookie Parser
    ↓
Pino HTTP (logging)
    ↓
Auth Middleware (session validation)
    ↓
Rate Limiter (global)
    ↓
Route Handler
    ↓
Error Handler (global)
```

---

## 5. Database Architecture

### 5.1 ORM
- **Drizzle ORM** (type-safe SQL builder)
- PostgreSQL dialect
- `drizzle-kit` for migrations

### 5.2 Schema

**Tables:**
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User accounts | email, role, premiumTier, language |
| `sessions` | Session tokens | userId, token, expiresAt |
| `referrals` | Referral tracking | referrerUserId, referredEmail, status |
| `event_rules` | Indian document events | slug, title, category, zipStructure |
| `document_rules` | Per-document requirements | eventRuleId, key, acceptedFormats |
| `processing_jobs` | File processing jobs | userId, status, progress, storagePrefix |
| `uploaded_files` | Individual file records | jobId, originalName, checksum, objectKey |
| `analytics_events` | Usage tracking | userId, eventName, toolSlug, metadata |
| `file_history` | User processing history | userId, toolUsed, originalFilename |
| `subscriptions` | Premium subscriptions | userId, plan, status, currentPeriodEnd |
| `coupons` | Discount codes | code, discountPercent, maxUses |

**Enums:**
- `user_role`: user, operator, admin, super_admin
- `job_status`: queued, processing, completed, failed, expired
- `event_category`: scheme, student, identity, job, admission

### 5.3 Data Flow
```
Frontend (React Query)
    ↓ fetches
API Route
    ↓ queries
Drizzle ORM
    ↓ SQL
PostgreSQL
```

---

## 6. Upload & Processing Pipeline

### 6.1 Upload Flow
```
User selects files
    ↓
Frontend: Zod validation (type, size)
    ↓
POST /api/v1/upload (multipart/form-data)
    ↓
Backend: Multer (temp storage)
    ↓
Backend: Zod validation (MIME, size, maxFiles)
    ↓
Backend: Sanitize filename (path.basename + regex)
    ↓
Backend: Create in-memory Job record
    ↓
Response: { files: [{ temp_filename, filename, size, mime_type }] }
    ↓
Frontend: Update useFileStore
```

### 6.2 Processing Flow
```
Frontend: POST /api/v1/process?job_id={id}
    ↓
Body: { operation, options }
    ↓
Backend: Identify file types
    ↓
Backend: Execute system command:
    ├── LibreOffice (DOCX → PDF, etc.)
    ├── FFmpeg (video/audio)
    ├── Ghostscript (PDF)
    └── Custom scripts
    ↓
Backend: Update Job status (Map)
    ↓
Frontend: Poll /api/v1/status/{job_id} (1s interval)
    ↓
On complete: GET /api/v1/download/{job_id}
    ↓
Download file
```

### 6.3 Supported Operations
| Operation | Tool | Backend Command |
|-----------|------|----------------|
| merge | Merge PDF | pdftk or custom |
| split | Split PDF | pdftk or custom |
| compress | Compress PDF | Ghostscript |
| rotate | Rotate PDF | pdf-lib / pdftk |
| ocr | OCR Scan | Tesseract.js (client) or backend |
| docx_to_pdf | Word to PDF | LibreOffice |
| pdf_to_jpg | PDF to JPG | pdftoppm / pdfjs |
| jpg_to_pdf | JPG to PDF | img2pdf or pdf-lib |
| compress | Video | FFmpeg |
| svg_to_png | SVG to PNG | ImageMagick |

---

## 7. Authentication Architecture

### 7.1 Session-Based Auth
```
Client                    Server
  │                          │
  │── POST /auth/login ────▶│
  │                          │── verify password ──▶ DB
  │                          │◀─ create session ──── DB
  │◀─ Set-Cookie: session ──│
  │   (httpOnly, 30d)         │
  │                          │
  │── GET /api/protected ──▶│
  │   Cookie: session=... ──│── validate session ──▶ DB
  │                          │◀─ return user ──────── DB
  │◀─ 200 OK + data ────────│
```

### 7.2 Auth Methods
1. **Email + Password:** Standard bcrypt verification
2. **Google OAuth:** `@react-oauth/google` client, `google-auth-library` server verification
3. **Local Fallback:** localStorage-based accounts when backend unavailable

### 7.3 Session Token
- 64-character hex string (`crypto.randomBytes(32)`)
- Stored in DB `sessions` table (UUID PK, 30-day expiry)
- HTTP-only cookie (`session_token`, SameSite=Lax)
- Frontend also stores token in `localStorage` for fetch interceptor

---

## 8. Search Architecture

### 8.1 Search Engine (src/lib/search/)
Located in `src/lib/search/`:
- `Trie.ts` — Prefix tree for O(k) lookup
- `Fuzzy.ts` — Levenshtein distance matching
- `Ranking.ts` — Click tracking + "recents" boosting

### 8.2 Search Flow
```
User types query
    ↓
Debounce 300ms
    ↓
Fuzzy match against Trie
    ↓
Score + rank results
    ↓
Apply click/recency boost
    ↓
Group by: Recent | Popular | Suggestions
    ↓
Dropdown renders results
```

### 8.3 Data Sources
- Tool names
- Tool keywords (from `toolContent.ts`)
- Tool aliases
- User click history (localStorage)
- Recent tools (localStorage)

---

## 9. Theme Architecture

### 9.1 Implementation
- `src/hooks/useTheme.ts` — React hook with subscriber pattern
- CSS class on `document.documentElement`: `light` or `dark`
- Persisted in `localStorage`: `filenova-theme`
- Default: `dark`

### 9.2 Token System
CSS custom properties defined in Tailwind v4:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.5%;
  --primary: 222.2 47.4% 11.2%;
  /* ... */
}
.dark {
  --background: 222.2 84% 4.5%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### 9.3 Event Themes
Special themes for Indian events (Independence Day, etc.):
- CSS class: `event-theme-{name}` on `document.documentElement`
- Additional CSS in `src/styles/eventThemes.css`

---

## 10. Internationalization

### 10.1 Supported Languages
English, Bengali, Hindi, Nepali, Santali, Telugu, Marathi, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese, Urdu

### 10.2 Implementation
- `src/lib/i18n.tsx` — React Context + `useTranslation` hook
- `src/lib/document-automation.ts` — Translation dictionaries
- `t(key)` for static strings
- `tText(text)` for dynamic/runtime strings
- Dynamic translation block for hardcoded content

---

## 11. PWA & Offline

### 11.1 Service Worker
- `sw.js` — Service worker for caching
- Vite PWA plugin (`vite-plugin-pwa`)
- Caches static assets, images, fonts
- Offline fallback page

### 11.2 Offline Banner
- `src/components/OfflineBanner.tsx`
- Shows when `!navigator.onLine`
- Pushes content via CSS variable `--banner-height`

### 11.3 Mock Mode
- Frontend works without backend
- `apiMock` in `src/lib/api.ts` simulates responses
- Auto-detected via health check failure
- User can toggle manually via localStorage

---

## 12. Plugin System

### 12.1 Tool Registry
`src/components/workspace/WorkspaceRegistry.tsx`:
- Maps tool slugs to sidebar components
- Each tool has: `sidebar`, `title`, `description`

### 12.2 Tool Pages
Each tool page is a dedicated lazy-loaded component or goes through generic `ToolPage`:
- Dedicated pages: 18 canonical tools
- Generic fallback: `/tools/:toolId` → `ToolPage`

---

## 13. Deployment Architecture

### 13.1 Production Targets
| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | https://filenova.in |
| Backend | Railway | https://api.filenova.in |
| Database | Railway (PostgreSQL) | Internal |
| Storage | Local (dev) → S3 (future) | — |

### 13.2 Build Pipeline
```
Source Code
    ↓
pnpm build
    ├── Frontend: Vite → artifacts/file-nova/dist/
    └── Backend: esbuild → artifacts/api-server/dist/
    ↓
Deploy
    ├── Vercel: auto-deploy from git
    └── Railway: auto-deploy from git
```

### 13.3 Environment Variables
- `NODE_ENV` — environment (production/development)
- `DATABASE_URL` — PostgreSQL connection
- `VITE_API_URL` — Backend URL for frontend
- `SESSION_SECRET`, `CSRF_SECRET` — Security secrets
- `RAZORPAY_KEY_ID/SECRET` — Payment
- `GEMINI_API_KEY` — AI (Gemini)
- `GOOGLE_CLIENT_ID` — OAuth

---

## 14. API Versioning

All API routes are under `/api/v1/`. This allows future `/api/v2/` without breaking existing clients.

Current v1 endpoints:
- Core: upload, process, status, download, preview
- Auth: signup, login, logout, me, google
- Premium: upgrade, features, usage
- Payments: create-order, verify, webhook
- UPI: create-qr, verify
- Referral: track, status
- Share: create, redirect

---

## 15. Error Handling Strategy

### 15.1 Frontend
```tsx
<ErrorBoundary onReset={reset}>
  <LazyMotion features={domAnimation}>
    <AppContent />
  </LazyMotion>
</ErrorBoundary>
```

### 15.2 Backend
```ts
app.use((err, req, res, next) => {
  logger.error({ err, stack: err.stack }, 'Unhandled error');
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});
```

### 15.3 API Error Format
```ts
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable message",
  "timestamp": "ISO8601"
}
```

---

## 16. Future Architecture Considerations

### 16.1 Planned
- Redis for job queue and caching
- S3-compatible storage for uploaded files (instead of local temp)
- WebSocket for real-time processing updates
- Message queue (BullMQ) for async processing
- Separate worker processes for CPU-heavy tasks

### 16.2 Evaluation Criteria
- Does it improve user experience?
- Does it reduce costs?
- Does it increase reliability?
- Can it be implemented without breaking existing features?

---

**Last Updated:** 2025-06-22  
**Owner:** Principal Architect  
**Review Cycle:** Monthly
