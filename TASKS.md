# FileNova — Task List

Auto-generated from current repository state.

---

## Critical Bugs

| # | Description | Location | Impact |
|---|-------------|----------|--------|
| 1 | `App.tsx` intercepts `window.fetch` globally — can cause unexpected side effects in third-party scripts | `artifacts/file-nova/src/App.tsx:467-544` | Medium |
| 2 | Backend `jobs` Map is in-memory — all processing state lost on server restart | `artifacts/api-server/src/routes/apiV1.ts:132` | High |
| 3 | Preview endpoint serves from temp dir without TTL-based cleanup | `artifacts/api-server/src/routes/apiV1.ts:296-326` | Medium |
| 4 | Some i18n strings are hardcoded in components (not in dictionary) | Various | Low |
| 5 | Legacy Flask backend still present but only serves health check | `backend/main.py` | Low |
| 6 | `.migration-backup/` directory contains stale code and should be removed | `.migration-backup/` | Low |
| 7 | Error boundary uses emoji and gradient colors not consistent with design system | `artifacts/file-nova/src/App.tsx:122-165` | Low |

---

## High Priority

| # | Description | Status |
|---|-------------|--------|
| 1 | Implement persistent job storage (DB or Redis) to replace in-memory Map | Pending |
| 2 | Add automated file cleanup cron job for temp uploads and preview files | Pending |
| 3 | Complete i18n coverage — extract all hardcoded strings to dictionary | Pending |
| 4 | Add comprehensive error boundaries around all `React.lazy` routes | Pending |
| 5 | Remove `.migration-backup/` and `claude resources/` directories | Pending |
| 6 | Implement proper loading fallbacks for all lazy-loaded pages | Pending |
| 7 | Add offline mode queue for uploads when network is unavailable | Pending |

---

## Medium Priority

| # | Description | Status |
|---|-------------|--------|
| 1 | Refactor search: consolidate duplicate Trie/Fuzzy implementations into `lib/intelligent-search/` | Pending |
| 2 | Replace hardcoded admin email check (`subhajitgho123@gmail.com`) with proper admin role | Pending |
| 3 | Add unit tests for `useFileStore` and `useAuthStore` | Pending |
| 4 | Implement virtualized lists for tools grid (>50 tools) | Pending |
| 5 | Add proper hydration error handling for SSR/prerender | Pending |
| 6 | Create centralized route definitions file instead of hardcoding in `App.tsx` | Pending |
| 7 | Add skeleton loaders for all tool pages | Pending |
| 8 | Implement proper form validation error messages across all tool pages | Pending |
| 9 | Add rate-limit feedback UI (retry-after timer) | Pending |
| 10 | Create admin coupon redemption flow in frontend | Pending |

---

## Low Priority

| # | Description | Status |
|---|-------------|--------|
| 1 | Add dark mode splash screen animation | Pending |
| 2 | Improve Lottie animation loading performance | Pending |
| 3 | AddSound effects for upload/processing (optional, toggle) | Pending |
| 4 | Add keyboard shortcut cheatsheet overlay | Pending |
| 5 | Implement drag-and-drop for file reordering in workspace | Pending |
| 6 | Add batch rename feature in history | Pending |
| 7 | Add export to CSV for usage analytics | Pending |
| 8 | Add tool usage heatmap on dashboard | Pending |

---

## Technical Debt

| # | Description | Status |
|---|-------------|--------|
| 1 | Multiple search implementations (`src/search/` and `src/lib/search/`) | Pending |
| 2 | Mix of service-worker-based PWA and custom offline banner | Pending |
| 3 | `useAuthStore` has business logic mixed with UI concerns (local user creation) | Pending |
| 4 | Backend API V1 route file is 686+ lines — should be split by resource | Pending |
| 5 | Zod v3 and v4 imports mixed in codebase | Pending |
| 6 | No centralized error reporting (Sentry/LogRocket equivalent) | Pending |
| 7 | `App.tsx` is 703 lines — too large | Pending |
| 8 | Some tool pages still use old `/tools/:toolId` pattern alongside new canonical routes | Pending |
| 9 | CSS custom properties for theme not fully standardized | Pending |
| 10 | No integration tests for API routes | Pending |

---

## Future Improvements

| # | Description | Status |
|---|-------------|--------|
| 1 | Real-time collaboration (shared workspace editing) | Planned |
| 2 | WebRTC-based direct file transfer (no server) | Planned |
| 3 | Advanced AI features: document classification, smart cropping | Planned |
| 4 | Integration with DigiLocker API | Planned |
| 5 | WhatsApp Business API integration for sharing | Planned |
| 6 | Voice commands for tool control | Planned |
| 7 | Document scanner using device camera + OCR pipeline | Planned |
| 8 | QR code generation for document sharing | Planned |
| 9 | CSC operator bulk mode with queue management | Planned |
| 10 | Browser extension for right-click processing | Planned |
| 11 | PWA offline-first with full sync | Planned |
| 12 | Multi-language OCR (Tesseract language packs) | Planned |
| 13 | Custom branding for cyber cafes (logo overlay) | Planned |
| 14 | API access for developers (REST + WebSocket) | Planned |
| 15 | Integration with Google Drive / OneDrive | Planned |

---

## Completed Tasks

| Date | Description | Commit/Ref |
|------|-------------|------------|
| 2025-06-20 | Initial monorepo structure setup | — |
| 2025-06-20 | Express API server with upload/process/download pipeline | — |
| 2025-06-20 | React frontend with Wouter routing and code splitting | — |
| 2025-06-20 | Session authentication with DB-backed tokens | — |
| 2025-06-20 | 18 canonical tool pages with SEO metadata | — |
| 2025-06-20 | Zustand stores (auth, files) | — |
| 2025-06-20 | Theme system (dark/light) | — |
| 2025-06-20 | i18n framework with 15+ languages | — |
| 2025-06-20 | AI Assistant integration (Gemini + Anthropic) | — |
| 2025-06-20 | Search engine (Trie + Fuzzy + Ranking) | — |
| 2025-06-20 | Razorpay + UPI payment integration | — |
| 2025-06-20 | Admin dashboard with analytics | — |
| 2025-06-20 | Referral system | — |
| 2025-06-20 | Feature flags system | — |
| 2025-06-20 | PWA setup with manifest | — |
| 2025-06-20 | File expiry and auto-cleanup | — |
| 2025-06-20 | Offline banner and mock mode | — |

---

## How to Use This File

This file is auto-generated from the current repository state. To update:
1. Add new tasks under the appropriate section
2. Mark completed tasks under "Completed Tasks"
3. Review "Critical Bugs" weekly
4. Re-sort by priority when scope changes
