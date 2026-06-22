# FileNova AI Development Guide

**Version:** 2.0  
**For:** All AI coding agents (Kilo Code, Codex, Claude Code, Gemini CLI, future agents)  
**Location:** Project root  
**Status:** MASTER INSTRUCTION FILE — overrides all generic coding behavior

---

## Table of Contents

1. [Project Philosophy](#1-project-philosophy)
2. [Architecture Rules](#2-architecture-rules)
3. [UI & Design Rules](#3-ui--design-rules)
4. [React Rules](#4-react-rules)
5. [TypeScript Rules](#5-typescript-rules)
6. [Tailwind Rules](#6-tailwind-rules)
7. [Animation Rules](#7-animation-rules)
8. [Theme Rules](#8-theme-rules)
9. [Performance Rules](#9-performance-rules)
10. [Accessibility Rules](#10-accessibility-rules)
11. [Security Rules](#11-security-rules)
12. [SEO Rules](#12-seo-rules)
13. [Testing Rules](#13-testing-rules)
14. [Git Workflow](#14-git-workflow)
15. [Regression Prevention](#15-regression-prevention)
16. [Features That Must Never Be Removed](#16-features-that-must-never-be-removed)
17. [Definition of Done](#17-definition-of-done)

---

## 1. Project Philosophy

FileNova is a premium AI-powered document productivity platform built for Indian users (students, CSC operators, cyber cafes).

**Product Identity:**
- Not a generic document tool
- Not a clone of competitors (Smallpdf, ILovePDF)
- A fast, elegant, trustworthy, professional SaaS experience

**Primary Objectives (in order):**
1. **Preserve functionality** — never break existing features
2. **Prevent regressions** — check every affected area
3. **Improve maintainability** — keep code clean and organized
4. **Improve user experience** — make it feel polished
5. **Improve visual quality** — only after the above

**Never sacrifice functionality for aesthetics.**

---

## 2. Architecture Rules

### 2.1 Monorepo Structure

```
file_nova/
├── artifacts/
│   ├── file-nova/          # Frontend (React + Vite)
│   └── api-server/         # Backend (Express)
├── lib/
│   ├── db/                 # Drizzle ORM schema & migrations
│   ├── api-zod/            # Zod validation schemas
│   ├── api-client-react/   # Generated API client
│   └── intelligent-search/ # Search engine library
├── backend/                # Legacy Flask backend (health check only)
├── scripts/                # DB init, build helpers
└── docs/                   # Documentation
```

### 2.2 Frontend Architecture

- **Router:** Wouter (lightweight, React-focused)
- **State Management:** Zustand stores + React Query (TanStack Query)
- **Component Library:** Custom components based on Radix UI primitives
- **Form Handling:** React Hook Form + Zod validation
- **Animations:** Framer Motion (with `LazyMotion` for reduced bundle)

### 2.3 Backend Architecture

- **Framework:** Express 5
- **ORM:** Drizzle ORM (PostgreSQL)
- **Validation:** Zod
- **Authentication:** Session tokens (DB-backed) + Google OAuth
- **File Processing:** LibreOffice, FFmpeg, Ghostscript (system-installed)
- **Rate Limiting:** express-rate-limit
- **Logging:** Pino
- **Security:** Helmet, CORS, cookie-parser

### 2.4 Data Flow Rules

1. **Never call `fetch` directly inside UI components** — use `lib/api.ts` (`apiClient` / `apiMock`)
2. **Separate business logic from UI** — extract to hooks, services, or utilities
3. **Keep state close to usage** — Local → Context → Zustand → React Query
4. **Never mix validation with rendering** — validate early, render late

### 2.5 Folder Structure

**Frontend (`artifacts/file-nova/src/`):**
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Radix-based primitives (shadcn/ui style)
│   ├── workspace/      # Workspace-specific components
│   └── [Feature].tsx   # Feature components
├── pages/              # Route-level pages
│   └── tools/          # Individual tool pages
├── hooks/              # Custom hooks (useXxx pattern)
├── store/              # Zustand stores
├── lib/                # Utilities, i18n, search, API client
├── search/             # Search engine (Trie, Fuzzy, Ranking)
├── assistant/          # AI Assistant logic
├── assistant/components/
├── assistant/hooks/
├── assistant/services/
├── assistant/toolAdapters/
├── features/           # Feature-specific modules (workflows)
├── data/               # Static content (toolContent.ts, blogPosts.ts)
├── config/             # Config (freemiumLimits.ts, events.ts)
├── seo/                # SEO meta, structured data
├── sidebars/           # Tool-specific sidebars
├── styles/             # CSS (event themes)
├── tools/              # Reusable tool components (AI PPT)
├── index.css           # Global styles
├── App.tsx             # Root component + routing
└── main.tsx            # Entry point
```

**Backend (`artifacts/api-server/src/`):**
```
src/
├── app.ts              # Express app setup
├── index.ts            # Entry point
├── routes/
│   ├── apiV1.ts        # Core v1 API (upload, process, status, download)
│   ├── auth.ts         # Auth routes (signup, login, logout, OAuth)
│   ├── premium.ts      # Premium/subscription routes
│   ├── referral.ts     # Referral system
│   ├── payments.ts     # Razorpay payments
│   ├── upiPayments.ts  # UPI payment handling
│   ├── share.ts        # Share links
│   ├── health.ts       # Health check
│   ├── sitemap.ts      # Dynamic sitemap
│   └── ai-ppt.ts       # AI PPT generation
├── middlewares/
│   ├── auth.ts         # Session authentication
│   ├── adminAuth.ts    # Admin authorization
│   ├── rateLimit.ts    # Rate limiting
│   ├── upload.ts       # Upload middleware
│   └── timeout.ts      # Request timeout
├── services/
│   ├── emailService.ts
│   ├── referralService.ts
│   └── subscriptionNotificationService.ts
├── validators/
│   └── file.ts
├── utils/
│   ├── hash.ts
│   └── cleanup.ts
└── lib/
    └── logger.ts       # Pino logger
```

### 2.6 Shared Libraries (`lib/`)

- **`db`** — Drizzle ORM schema, migrations, database connection
- **`api-zod`** — Zod validation schemas shared between frontend and backend
- **`api-client-react`** — Generated React client for API calls
- **`intelligent-search`** — Standalone search library (Trie, Fuzzy, Ranking)

---

## 3. UI & Design Rules

### 3.1 Design Philosophy

FileNova should feel like a premium productivity platform inspired by:
- **Linear** — speed, minimalism, keyboard-first
- **Vercel** — clean aesthetics, professional typography
- **Stripe** — clarity, trust, premium feel
- **Notion** — simplicity, readability
- **Raycast** — efficiency, delight

**Maintain FileNova's own identity. Do not copy other products.**

### 3.2 Visual Style

Preferred:
- ✓ Minimalism
- ✓ Bento Grid layouts
- ✓ Premium cards
- ✓ Subtle glassmorphism (not everywhere)
- ✓ Soft aurora accents
- ✓ Smooth animations
- ✓ Professional typography
- ✓ Clean spacing

Avoid:
- ✗ Visual clutter
- ✗ Heavy shadows
- ✗ Random gradients
- ✗ Inconsistent spacing
- ✗ Distracting motion
- ✗ Neumorphism
- ✗ Brutalism
- ✗ Heavy blur everywhere

### 3.3 Color System

**Never hardcode colors.** Use semantic theme tokens.

```css
/* Correct semantic tokens */
bg-background
text-foreground
bg-primary
text-primary-foreground
bg-secondary
bg-muted
text-muted-foreground
bg-accent
text-accent-foreground
bg-card
text-card-foreground
border-border
bg-destructive
text-destructive-foreground
bg-ring
```

**Never use:**
- `bg-white`, `text-black`, `bg-gray-100`, `text-gray-700` in components

### 3.4 Typography

- **Font:** Inter (via Google Fonts)
- **Scale:** Consistent heading hierarchy (H1 → H2 → H3 → Body → Caption)
- **Weights:** Avoid random font weights; maintain visual rhythm
- **Clamping:** Use responsive type where appropriate

### 3.5 Spacing

Use the consistent scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`

Never use arbitrary spacing values like `p-[17px]` or `m-[23px]`.

### 3.6 Border Radius

Use consistent radii:
- **sm:** `6px` (rounded-sm)
- **md:** `10px` (rounded-md)
- **lg:** `16px` (rounded-lg)
- **xl:** `24px` (rounded-xl)
- **2xl:** `32px` (rounded-2xl)

Avoid mixing: `2px`, `8px`, `18px`, `40px` randomly.

### 3.7 Shadows

Keep shadows subtle. Cards, dropdowns, dialogs should share similar shadow depth.

Avoid heavy shadows. Prefer:
- `shadow-sm`: Subtle elevation
- `shadow-md`: Cards
- `shadow-lg**: Dialogs, dropdowns

### 3.8 Cards

Cards must have:
- Clear hierarchy
- Consistent padding
- Equal spacing
- Readable typography
- Visible border
- Appropriate elevation

Never overcrowd cards.

### 3.9 Buttons

Every button must have:
- Consistent height (min 40px touch target)
- Consistent padding
- Hover state
- Focus state (visible ring)
- Loading state (spinner or skeleton)
- Disabled state (reduced opacity, cursor-not-allowed)

### 3.10 Forms

Inputs must include:
- Label (or aria-label)
- Placeholder
- Focus state
- Error state (red border + message)
- Success state (green indicator)
- Helper text when needed

### 3.11 Navigation

**Navbar must always remain:**
- Visible
- Clickable
- Responsive (mobile hamburger menu)
- Accessible

Verify:
- Logo
- Main navigation links
- Popular Tools
- All Tools
- Search trigger
- Language selector
- Theme switcher
- User menu / notifications
- Mobile menu

No clipping. No hidden popovers.

### 3.12 Empty States

Every empty page must include:
- Icon or illustration
- Helpful message
- Primary action
- Optional secondary action

Never leave blank screens.

### 3.13 Loading States

Prefer:
- Skeleton loaders
- Progress indicators
- Optimistic UI (update immediately, sync in background)

Avoid indefinite spinners on content areas.

### 3.14 Error States

Errors must explain:
- What happened
- Why it happened
- How to recover
- Retry button when possible

Never show generic "Something went wrong" without context.

---

## 4. React Rules

### 4.1 Component Rules

- **One responsibility per component.** Bad: one component handling UI + API + State + Validation + Navigation. Good: separate concerns.
- **Component size targets:**
  - Small: 50–150 lines
  - Medium: 150–300 lines
  - Large: Max 400 lines (split if larger)

### 4.2 Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `UploadCard.tsx`, `SearchDialog.tsx` |
| Hooks | `use` prefix | `useTheme`, `useUpload`, `useSearch` |
| Utilities | camelCase | `formatDate`, `downloadFile`, `validatePdf` |
| Types/Interfaces | PascalCase | `UserProfile`, `ToolConfig`, `PricingPlan` |

### 4.3 Props

- Keep props minimal and explicit
- Avoid passing entire objects
- Use destructuring
- Prefer named props over positional

```tsx
// Good
<UploadCard onSelect={handleSelect} accept=".pdf" />

// Bad
<UploadCard config={config} data={data} callback={cb} />
```

### 4.4 State Management

1. **Local State** — use `useState` first
2. **Context** — use when state is needed by a subtree
3. **Zustand Store** — use for global state (auth, files)
4. **React Query** — use for server state (API responses)

Never elevate state unnecessarily.

### 4.5 Custom Hooks

Extract reusable logic into hooks:
- `useTheme` — theme management
- `useUpload` — file upload logic
- `useDownload` — download handling
- `useSearch` — search functionality
- `useKeyboardShortcuts` — keyboard navigation
- `useBreakpoint` — responsive detection

### 4.6 API Layer

**Never call `fetch` directly inside UI components.**

Use `lib/api.ts` (`apiClient` / `apiMock`) or dedicated service functions.

### 4.7 Import Order

Always group imports:
```tsx
// 1. React
import React, { useState, useEffect } from 'react';

// 2. Third-party
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

// 3. Internal (aliases)
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/lib/api';

// 4. Relative
import { UploadZone } from './UploadZone';
import { ProcessingBadge } from '../ProcessingBadge';
```

Remove unused imports immediately.

### 4.8 Error Boundaries

Every page route should be wrapped by the global `ErrorBoundary` in `App.tsx`.

### 4.9 Code Splitting

Use `React.lazy()` for route-level splitting. Already implemented for all tool pages and admin pages.

### 4.10 Lists

Every list must use stable keys. Never use `index` as key unless absolutely necessary.

### 4.11 Icons

Use **lucide-react** exclusively. Keep icon sizes consistent.
- Small: `16px` (`h-4 w-4`)
- Medium: `20px` (`h-5 w-5`)
- Large: `24px` (`h-6 w-6`)

Do not mix icon styles.

---

## 5. TypeScript Rules

### 5.1 Strict Mode

TypeScript strict mode is enabled. No exceptions.

### 5.2 Type Safety

- Every function parameter must be typed
- Every return value must be typed
- Avoid `any` — use `unknown` when type is truly unknown
- Avoid `@ts-ignore` — if unavoidable, add a comment explaining why
- Use `zod` schemas shared between frontend and backend (`api-zod`)

### 5.3 Interfaces vs Types

- Use `type` for unions, intersections, and simple object shapes
- Use `interface` for public API contracts (props, stores)

### 5.4 Enum Pattern

Use string literal unions instead of enums where possible:
```ts
// Good
type Theme = 'dark' | 'light';
type Role = 'user' | 'operator' | 'admin' | 'super_admin';

// Avoid
enum Theme { Dark = 'dark', Light = 'light' }
```

### 5.5 Nullable Handling

- Use `T | null` or `T | undefined` explicitly
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Validate inputs with Zod before type assertions

---

## 6. Tailwind Rules

### 6.1 Utility-First

Prefer Tailwind utility classes. Avoid inline styles.
Avoid `className` with 30+ arbitrary values — extract to component.

### 6.2 No Arbitrary Values

Never use arbitrary values like `top-[137px]`, `w-[342px]` unless layout truly requires it.
Use the design system scale instead.

### 6.3 Responsive Classes

Always provide responsive variants for interactive elements:
```tsx
className="text-sm md:text-base lg:text-lg"
className="p-4 md:p-6 lg:p-8"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### 6.4 Theme Tokens

Always use semantic tokens:
```tsx
// Good
className="bg-background text-foreground"

// Bad
className="bg-white text-black"
```

### 6.5 Dark Mode

Every class must work in both themes. Verify in dark mode before completing any component.

---

## 7. Animation Rules

### 7.1 Library

Use **Framer Motion** with `LazyMotion` and `domAnimation` features for minimal bundle.

### 7.2 Animation Principles

- Animations must improve usability, not decorate
- Never animate just because you can
- Every animation must serve a purpose

### 7.3 Preferred Animations

- Fade in/out
- Slide transitions
- Scale (hover states, modals)
- Stagger (lists, cards)
- Smooth height transition
- Micro-interactions (button press, hover)
- Blur reveal (subtle)

Avoid:
- Flashy animations
- Rotating elements
- Bouncing
- Excessive transforms

### 7.4 Timing

- **Fast interactions:** 100–150ms
- **Normal transitions:** 180–250ms
- **Large transitions:** 250–350ms

Keep timing consistent across the application.

### 7.5 Motion Accessibility

Always respect `prefers-reduced-motion`:
```tsx
const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

### 7.6 Performance

- Use `transform` and `opacity` for animations
- Never animate `width`, `height`, `top`, `left` directly
- Target 60 FPS
- Use `will-change` sparingly

---

## 8. Theme Rules

### 8.1 Theme System

FileNova uses a custom `useTheme` hook:
- **Modes:** `dark` (default), `light`
- **Persistence:** `localStorage` key `filenova-theme`
- **Implementation:** CSS class on `document.documentElement`

### 8.2 Requirement

Every component MUST support both light and dark mode.

### 8.3 Light Mode Rules

- Nothing should become invisible
- Ensure readable text, visible borders, visible shadows, visible icons
- No white-on-white elements
- Good contrast ratios (WCAG AA minimum: 4.5:1 for text)

### 8.4 Dark Mode Rules

- Avoid pure black backgrounds (`#000`)
- Avoid pure white text (`#fff`)
- Use softer contrast
- Maintain readability

### 8.5 Testing

Before completing any UI task:
- ✓ Test in light mode
- ✓ Test in dark mode

---

## 9. Performance Rules

### 9.1 Loading Strategy

- **Route-based code splitting:** Already implemented with `React.lazy()` for all tool pages
- **Font loading:** Optimize with `font-display: swap`
- **Image optimization:** Use responsive images, lazy loading
- **Bundle monitoring:** Watch for bundle size regressions

### 9.2 Memoization

Use `useMemo`, `useCallback`, `React.memo` **only when beneficial**.

Do not pre-optimize. Measure first.

### 9.3 React Query

- Set appropriate `staleTime` for data that doesn't change frequently
- Use `placeholderData` for optimistic UI feel
- Implement `retry` logic for transient failures

### 9.4 Animations

- Use `transform` and `opacity` only
- Avoid layout animations
- Use `LazyMotion` with `domAnimation` package

### 9.5 Lists

- Virtualize lists with > 50 items
- Use stable keys
- Debounce search/filter operations

### 9.6 Network

- Debounce API calls (search, autocomplete)
- Cancel stale requests
- Handle offline gracefully

---

## 10. Accessibility Rules

### 10.1 WCAG 2.1 AA Compliance

Target WCAG 2.1 AA compliance for all public-facing pages.

### 10.2 Keyboard Navigation

- Every interactive element must be keyboard accessible
- Support Tab navigation
- Support Enter/Space for activation
- Support Escape to close dialogs/dropdowns
- Implement focus trapping in modals

### 10.3 Focus Visibility

- Never `outline: none` without providing an alternative
- Use visible focus rings (theme-aware)
- Focus must be visible in both light and dark modes

### 10.4 Semantic HTML

- Use correct heading hierarchy (`h1` → `h2` → `h3`)
- Use `<button>` for actions, `<a>` for navigation
- Use `<nav>`, `<main>`, `<aside>` for landmarks
- Avoid `<div>` soup for interactive elements

### 10.5 ARIA

- Use `aria-label` for icon-only buttons
- Use `aria-expanded` for dropdowns/accordions
- Use `aria-live` for dynamic content updates
- Use `role` only when native HTML is insufficient

### 10.6 Screen Readers

- Provide meaningful `alt` text for images
- Ensure form inputs have associated labels
- Announce loading/processing state changes

### 10.7 Reduced Motion

Respect `prefers-reduced-motion`. Reduce or disable animations when enabled.

---

## 11. Security Rules

### 11.1 Never Expose Secrets

- Never commit API keys, tokens, passwords, or secrets
- Use environment variables for all sensitive data
- `.env.example` should contain only placeholders
- `.env` should be in `.gitignore`

### 11.2 Input Validation

- Validate all inputs server-side AND client-side
- Sanitize user-uploaded filenames
- Never trust client-side validation alone
- Use Zod schemas consistently

### 11.3 API Security

- All API routes use auth middleware where appropriate
- Rate limiting on upload and AI endpoints
- CORS configured for specific origins only
- Helmet headers enabled

### 11.4 File Upload Security

- Validate MIME types (not just extensions)
- Limit file sizes per user tier
- Scan filenames for path traversal (`../`)
- Delete temp files after processing
- Never serve files from user-controlled paths without validation

### 11.5 Authentication

- Session tokens stored in HTTP-only cookies + DB
- Token expiry enforced
- Google OAuth tokens verified server-side
- Passwords hashed with bcrypt

### 11.6 XSS Prevention

- Escape user content before rendering
- Use React's built-in JSX escaping
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary

### 11.7 CSRF Protection

- CSRF secrets in environment variables
- Validate origin headers

---

## 12. SEO Rules

### 12.1 Per-Page SEO

Every public page needs:
- Unique `<title>` (50–60 chars)
- Meta description (150–160 chars)
- Canonical URL
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`)
- Twitter Card tags

### 12.2 Structured Data

Tool pages use `ToolSEO` and `ToolStructuredData` components:
- SoftwareApplication schema
- HowTo schema for tool steps
- FAQPage schema for FAQs

### 12.3 URLs

- Use descriptive, hyphenated slugs
- Maintain backward compatibility with legacy redirects
- Avoid query parameters for content pages

### 12.4 Content

- Heading hierarchy must be logical
- Images need alt text
- Internal links should be contextual

### 12.5 Performance (SEO Factor)

- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Mobile-friendly (Core Web Vitals)

---

## 13. Testing Rules

### 13.1 Testing Mindset

Before finishing any change, verify:
- UI works
- Logic is correct
- API calls succeed
- Responsiveness (mobile, tablet, desktop)
- Accessibility
- Theme (light + dark)
- Animations
- Performance

### 13.2 Test Types

- **Manual QA:** Required for every feature change
- **Regression Checklist:** Run before every release
- **Responsive QA:** Test at 320px, 375px, 768px, 1024px, 1440px, 1920px
- **Theme QA:** Test both light and dark modes

### 13.3 Database Tests

Run `pnpm test` for database tests:
```bash
pnpm test
```

### 13.4 Type Checking

Run type checking before committing:
```bash
pnpm typecheck
```

---

## 14. Git Workflow

### 14.1 Commit Messages

Use conventional commit format:
```
feat: add AI workspace improvements
fix: resolve navbar dropdown visibility
refactor: simplify upload workflow
perf: optimize dashboard rendering
style: improve pricing layout
docs: update AGENTS.md
test: verify upload functionality
```

### 14.2 Branch Strategy

- Work on feature branches
- Keep commits small and focused
- Avoid large mixed commits
- Do not update git config or skip hooks

### 14.3 Pre-commit Checklist

Before committing:
- [ ] No features removed
- [ ] No routes broken
- [ ] No API calls broken
- [ ] No theme regressions
- [ ] No responsive regressions
- [ ] Type checking passes
- [ ] No console errors
- [ ] No hardcoded secrets

---

## 15. Regression Prevention

### 15.1 Before Completing Any Task

Verify:
- [ ] No features disappeared
- [ ] No pages disappeared
- [ ] No routes disappeared
- [ ] No components disappeared
- [ ] No API calls failed
- [ ] No buttons stopped working
- [ ] No dropdowns became hidden
- [ ] No dialogs became invisible
- [ ] No theme regressions
- [ ] No responsive regressions

### 15.2 Before Refactoring

- Inspect what the code does
- Understand why it exists
- Can it be improved without replacement?
- Will this affect another page?
- If unsure, inspect more before modifying.

### 15.3 When in Doubt

**Inspect first. Modify later.**

---

## 16. Features That Must Never Be Removed

| Feature | Can Modify | Can Remove |
|---------|-----------|-----------|
| Navigation | ✓ | ✗ |
| Search | ✓ (improve) | ✗ |
| Theme Switcher | ✓ (improve) | ✗ |
| Language Switcher | ✓ (improve) | ✗ |
| AI Assistant | ✓ (improve) | ✗ |
| Dashboard | ✓ (improve) | ✗ |
| Recent Files | ✓ (improve) | ✗ |
| History | ✓ (improve) | ✗ |
| Upload | ✓ (improve) | ✗ |
| Download | ✓ (improve) | ✗ |
| Workspace | ✓ (improve) | ✗ |
| Pricing | ✓ (improve) | ✗ |
| Authentication | ✓ (improve) | ✗ |
| Premium Features | ✓ (improve) | ✗ |
| Notifications | ✓ (improve) | ✗ |
| Settings | ✓ (improve) | ✗ |
| Footer | ✓ (improve) | ✗ |
| SEO Metadata | ✓ (improve) | ✗ |
| Loading States | ✓ (improve) | ✗ |
| Error States | ✓ (improve) | ✗ |
| Empty States | ✓ (improve) | ✗ |
| Keyboard Shortcuts | ✓ (improve) | ✗ |
| Animations | ✓ (improve) | ✗ |

---

## 17. Definition of Done

A task is complete **only when ALL** of the following are verified:

- [ ] **Functionality works** — the feature does what it promises
- [ ] **UI is polished** — spacing, alignment, typography are correct
- [ ] **Responsive behavior verified** — mobile, tablet, desktop all work
- [ ] **Light mode works** — nothing is invisible
- [ ] **Dark mode works** — contrast is readable
- [ ] **Accessibility preserved** — keyboard nav, screen readers
- [ ] **Performance maintained** — no noticeable slowdown
- [ ] **No regressions** — existing features still work
- [ ] **Code is clean** — no dead code, no typos, no unused imports
- [ ] **No console errors** — in both dev and production builds
- [ ] **No TypeScript errors** — `pnpm typecheck` passes
- [ ] **No broken links or routes**
- [ ] **API calls succeed**
- [ ] **Theme switching works** in affected areas

If any item fails, the task is **NOT complete**.

---

## Quick Reference: Essential Commands

```bash
# Development
pnpm dev                    # Start frontend + backend in parallel
pnpm --filter @workspace/file-nova run dev    # Frontend only
pnpm --filter @workspace/api-server run dev   # Backend only

# Build
pnpm build                  # Build all packages

# Type Check
pnpm typecheck              # Type check all projects
pnpm --filter @workspace/file-nova run typecheck  # Frontend only

# Database
pnpm init-db                # Initialize database
pnpm test                   # Run tests

# Lint/Format
npx prettier --write src/
```

---

## Cross-References

For detailed information, see:
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) — Complete project overview
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System architecture deep-dive
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — Design tokens and patterns
- [COMPONENT_GUIDE.md](./COMPONENT_GUIDE.md) — Component inventory
- [CODING_STANDARDS.md](./CODING_STANDARDS.md) — Detailed coding conventions
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) — QA procedures
- [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) — Security policies
- [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md) — Performance optimization
- [SEO_GUIDE.md](./SEO_GUIDE.md) — SEO best practices
- [AI_ASSISTANT_GUIDE.md](./AI_ASSISTANT_GUIDE.md) — AI assistant architecture
- [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) — Production release checklist
- [CONTRIBUTING_AI.md](./CONTRIBUTING_AI.md) — AI agent contribution guide
- [ROADMAP.md](./ROADMAP.md) — Project roadmap
- [TASKS.md](./TASKS.md) — Current task priorities
- [CHANGELOG_AI.md](./CHANGELOG_AI.md) — AI modification history
