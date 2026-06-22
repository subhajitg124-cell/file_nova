# FileNova — Testing Guide

**Purpose:** QA procedures and checklists for validating changes.

---

## 1. Testing Philosophy

No task is complete until verified. Writing code is 50% of the work. The other 50% is validation.

**Always verify:**
- UI renders correctly
- Logic is correct
- API calls succeed
- Responsiveness
- Accessibility
- Theme (light + dark)
- Animations
- Performance
- No regressions

---

## 2. Test Types

### 2.1 Manual QA
Required for every feature change or UI modification.

### 2.2 Regression QA
Run before every release or major refactor.

### 2.3 Responsive QA
Test at all breakpoints.

### 2.4 Accessibility QA
Keyboard nav, screen readers, contrast.

### 2.5 Theme QA
Light mode + dark mode.

### 2.6 Performance QA
Load times, animations, bundle size.

---

## 3. Manual QA Checklist

Run this checklist after every feature completion.

### 3.1 Functionality
- [ ] Feature works as described in requirements
- [ ] All buttons click and respond
- [ ] Forms submit correctly
- [ ] Error messages display appropriately
- [ ] Success states show
- [ ] Loading states render
- [ ] Retry mechanisms work
- [ ] Offline fallback works (if applicable)

### 3.2 Navigation
- [ ] All navbar links work
- [ ] Mobile hamburger menu opens/closes
- [ ] Dropdowns open on click/hover
- [ ] Search opens with `Cmd+K` / `Ctrl+K`
- [ ] Breadcrumbs update (where applicable)
- [ ] Back button works
- [ ] 404 page shows for invalid routes
- [ ] Redirects from legacy URLs work

### 3.3 Upload/Processing
- [ ] Drag-and-drop upload works
- [ ] Click-to-browse works
- [ ] File type validation shows errors
- [ ] File size validation shows errors
- [ ] Progress indicator animates
- [ ] Cancel button works (if present)
- [ ] Multiple files upload (where allowed)
- [ ] Processing status updates
- [ ] Download button appears on completion
- [ ] File expiry countdown works

### 3.4 Tool Pages (each tool)
- [ ] Upload zone accepts correct file types
- [ ] Tool-specific options render
- [ ] Options updates trigger re-processing (if applicable)
- [ ] Preview renders correctly
- [ ] Download produces correct file
- [ ] File integrity is maintained

### 3.5 AI Assistant
- [ ] Opens/closes correctly
- [ ] Messages send and receive
- [ ] Streaming responses render
- [ ] Markdown renders (if applicable)
- [ ] Preset prompts work
- [ ] Context awareness works (SmartAssistant)
- [ ] Auto-scroll to new messages

### 3.6 Authentication
- [ ] Sign up creates account
- [ ] Login with email/password works
- [ ] Google OAuth works
- [ ] Session persists on refresh
- [ ] Logout clears session
- [ ] Protected routes redirect to login
- [ ] Error messages for invalid credentials

### 3.7 Dashboard
- [ ] Recent files display
- [ ] Statistics calculate correctly
- [ ] Quick actions work
- [ ] File history loads
- [ ] Pagination works (if applicable)

### 3.8 Pricing
- [ ] All 4 tiers render
- [ ] "Most Popular" highlighted
- [ ] Feature comparison is accurate
- [ ] CTA buttons work
- [ ] UPI/QR code generates
- [ ] Razorpay modal opens
- [ ] Coupon redemption works (if implemented)

### 3.9 Admin
- [ ] Admin login works
- [ ] Dashboard stats load
- [ ] User management works
- [ ] Payment records display
- [ ] Coupon creation works

---

## 4. Regression Checklist

Run before every release.

### 4.1 Core Features
- [ ] Navigation visible and clickable
- [ ] Search works (typing, selecting, keyboard)
- [ ] Theme switcher toggles light/dark
- [ ] Language switcher works
- [ ] Upload works (all supported types)
- [ ] Processing completes
- [ ] Download works
- [ ] Dashboard loads
- [ ] AI Assistant opens and responds
- [ ] Pricing page renders
- [ ] Settings save correctly
- [ ] Authentication flow intact

### 4.2 Routes
- [ ] `/` — Home loads
- [ ] `/tools` — Tools catalog loads
- [ ] `/pricing` — Pricing page loads
- [ ] `/dashboard` — Dashboard loads (auth required)
- [ ] `/history` — History loads
- [ ] `/profile` — Profile loads
- [ ] `/login` — Login loads
- [ ] `/workspace` — Workspace loads
- [ ] All 18 canonical tool routes load
- [ ] Legacy redirects resolve correctly

### 4.3 API Endpoints
- [ ] `/api/healthz` returns 200
- [ ] `/api/v1/upload` accepts files
- [ ] `/api/v1/status/{id}` returns progress
- [ ] `/api/v1/download/{id}` returns file
- [ ] `/api/v1/auth/signup` creates user
- [ ] `/api/v1/auth/login` returns token
- [ ] `/api/v1/auth/me` returns user
- [ ] `/api/v1/premium/*` enforces tiers
- [ ] `/api/v1/payments/*` initiates Razorpay

---

## 5. Responsive Checklist

Test at these widths:

### 5.1 Viewport Widths
- [ ] 320px (small phone)
- [ ] 375px (iPhone)
- [ ] 390px (modern phone)
- [ ] 414px (large phone)
- [ ] 768px (iPad portrait)
- [ ] 1024px (iPad landscape / laptop)
- [ ] 1280px (standard desktop)
- [ ] 1440px (large desktop)
- [ ] 1920px (full HD)

### 5.2 Checks per Width
- [ ] No horizontal scroll
- [ ] No clipped content
- [ ] All buttons visible and tappable (≥40px)
- [ ] Text doesn't overflow
- [ ] Images scale correctly
- [ ] Tables/cards stack vertically
- [ ] Navbar collapses to hamburger (mobile)
- [ ] Modals fit within viewport
- [ ] Forms are usable

### 5.3 Orientation
- [ ] Portrait (mobile)
- [ ] Landscape (mobile)
- [ ] Portrait (tablet)
- [ ] Landscape (tablet)

---

## 6. Accessibility Checklist

### 6.1 Keyboard Navigation
- [ ] Tab navigates all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals, dropdowns, search
- [ ] Arrow keys work in dropdowns, lists
- [ ] Focus trap works in modals
- [ ] Focus visible on all interactive elements
- [ ] Skip-to-content link exists (if applicable)

### 6.2 Screen Readers
- [ ] All images have `alt` text
- [ ] Icon buttons have `aria-label`
- [ ] Form inputs have associated labels
- [ ] Error messages announced (`aria-live`)
- [ ] Loading states announced
- [ ] Headings follow logical hierarchy (h1 → h2 → h3)
- [ ] Landmarks used (`nav`, `main`, `aside`)

### 6.3 Visual
- [ ] Text contrast ≥ 4.5:1 (WCAG AA)
- [ ] Focus indicators visible
- [ ] Color not sole indicator (use icons too)
- [ ] Text resizable to 200% without breaking

### 6.4 Reduced Motion
- [ ] Animations disabled when `prefers-reduced-motion: reduce`
- [ ] Content still usable without animations

---

## 7. Theme Checklist

Run for every UI change.

### 7.1 Light Mode
- [ ] Background is not pure white everywhere
- [ ] Text is dark enough to read
- [ ] Borders are visible
- [ ] Shadows are visible
- [ ] Icons have visible strokes
- [ ] Cards distinguishable from background
- [ ] Inputs have visible borders
- [ ] Buttons have sufficient contrast
- [ ] No white-on-white elements
- [ ] Dropdowns visible
- [ ] Modals visible

### 7.2 Dark Mode
- [ ] Background is not pure black (#000)
- [ ] Text is off-white, not pure white (#fff)
- [ ] Text contrast sufficient
- [ ] Cards elevated from background
- [ ] Borders visible (subtle)
- [ ] Icons visible
- [ ] Inputs usable
- [ ] No invisible text

### 7.3 Theme Switching
- [ ] Toggle switches modes
- [ ] Persists on refresh
- [ ] No flash of wrong theme
- [ ] All components update immediately

---

## 8. Performance Checklist

### 8.1 Loading
- [ ] Initial page load < 3s on 3G
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

### 8.2 Runtime
- [ ] Scroll smooth (no jank)
- [ ] Animations run at 60fps
- [ ] No layout thrashing
- [ ] Memory doesn't grow unbounded

### 8.3 Bundle
- [ ] No unexpected bundle size increase
- [ ] Code splitting works (lazy loaded routes)
- [ ] No duplicate dependencies
- [ ] Tree shaking effective

### 8.4 API
- [ ] No unnecessary re-renders
- [ ] Debounced search input
- [ ] Cancelled stale requests
- [ ] Proper caching (React Query staleTime)

---

## 9. i18n Checklist

### 9.1 Coverage
- [ ] All user-visible strings translated
- [ ] No hardcoded English in components (check for "Upload", "Cancel", etc.)
- [ ] Dynamic content uses `tText()`
- [ ] New keys added to dictionary

### 9.2 Layout
- [ ] Hindi/Bengali text doesn't overflow
- [ ] Button widths accommodate longer translations
- [ ] RTL layouts work (future-proofing)

---

## 10. Browser Testing

### 10.1 Supported Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### 10.2 Checks
- [ ] CSS grid/flex works
- [ ] Web APIs available (Clipboard, File, etc.)
- [ ] PWA install prompt appears
- [ ] Service worker caches assets

---

## 11. Database Testing

```bash
# Run DB tests
pnpm test

# Expected output:
# ✓ lib/db/src/db.test.ts
```

### 11.1 Checks
- [ ] Connection string valid
- [ ] Migrations apply cleanly
- [ ] Seeding works (if applicable)
- [ ] Queries return expected results

---

## 12. TypeScript

```bash
# Run type check
pnpm typecheck

# Expected: no errors
```

### 12.1 Checks
- [ ] No `any` types (without explanation)
- [ ] No `@ts-ignore` without comments
- [ ] All props typed
- [ ] Return types explicit
- [ ] Zod schemas match TypeScript types

---

## 13. Build

```bash
# Build all packages
pnpm build

# Expected: success
```

### 13.1 Checks
- [ ] Frontend builds without errors
- [ ] Backend bundles without errors
- [ ] No missing assets
- [ ] No broken imports

---

## 14. Mock Mode Testing

FileNova must work without backend.

### 14.1 How to Test
1. Set `VITE_API_URL=''` or disconnect network
2. Verify `ConnectionStatusIndicator` shows offline
3. Try upload, processing, download
4. Verify mock fallbacks work

### 14.2 Checks
- [ ] App loads without backend
- [ ] Mock uploads succeed
- [ ] Mock processing completes
- [ ] Mock downloads work
- [ ] Error states show gracefully

---

## 15. Security Testing

### 15.1 File Upload
- [ ] Executable files rejected (`.exe`, `.sh`, `.bat`)
- [ ] Path traversal blocked (`../../../etc/passwd`)
- [ ] Oversized files rejected
- [ ] MIME type validation works

### 15.2 Authentication
- [ ] Invalid tokens rejected
- [ ] Expired sessions rejected
- [ ] Protected routes require auth
- [ ] CSRF tokens validated

### 15.3 XSS
- [ ] User input escaped in render
- [ ] No `dangerouslySetInnerHTML` without sanitization

---

## 16. Pre-Release Checklist

Combine all checklists above plus:

### 16.1 Final Checks
- [ ] All tests pass
- [ ] TypeScript compiles
- [ ] Build succeeds
- [ ] No console errors in production build
- [ ] No console warnings
- [ ] No dead code
- [ ] No commented-out code
- [ ] No `TODO` comments
- [ ] No `FIXME` comments
- [ ] All environment variables documented
- [ ] `CHANGELOG_AI.md` updated

### 16.2 Sign-off
- [ ] QA by human (required)
- [ ] Accessibility review
- [ ] Performance review
- [ ] Security review
