# FileNova — Current State Summary

## Mission
Complete FileNova production-readiness: navbar redesign, floating side panel, smart subscription, developer mode, and visual polish across 10 phases.

## Constraints & Preferences
- Do not remove working features. Brand accent colors (amber, indigo, purple, emerald) in data-driven design are acceptable.
- Mock payment path kept for dev testing.
- No unnecessary refactoring — preserve existing patterns unless broken.
- Developer account (subhajitgho123@gmail.com) now gets `role: 'developer'` + `premiumTier: 'elite'` + `phoneVerified: true` in `processUser()`.
- Floating side panel on RIGHT side with Framer Motion hover expand (icons only → label slides out).
- Smart premium button: dev=hidden, free=Upgrade(→pro), basic/pro=Go Elite(→elite), elite="Member ✓" badge.
- Elastic/mobile nav: FAB→bottom-sheet on mobile; floating shortcuts coexist without overlap (FloatingSidePanel left-6, FloatingShortcuts right-6).

## Done
- **Developer Workspace page** (`src/pages/DeveloperWorkspace.tsx`): Full page at `/developer-workspace` with 31 dev tools in a bento grid, search/filter, per-tool animation, dev-only access guard (non-devs see "Access Denied"), live status bar (server health, mode, tool count). Route registered in `routes.tsx` as lazy-loaded chunk (19.26 kB).
- **UserProfileDropdown imports fixed**: Removed unused `Languages` and `Bell`, added `FileText` for "Open Workspace" button.
- **Developer role type**: `'developer'` added to `UserProfile.role` union in `useAuthStore.ts`. Both `processUser()` paths (server-backed + local mock) now set `role: 'developer'` for `subhajitgho123@gmail.com` in dev mode.
- **FloatingSidePanel component** (`src/components/FloatingSidePanel.tsx`): Desktop (lg+): vertical pill dock fixed `right-4` top-1/2, icons only collapsed, label slides out on per-item hover via Framer Motion `animate={{width, opacity}}`. Mobile (<lg): FAB at `bottom-6 left-6` → bottom sheet + backdrop overlay. Three links: India Tools (emerald), Workflows (indigo), Workspace (foreground).
- **Navbar redesign** (`src/components/Navbar.tsx`): Restructured layout — Logo | Search | PopularToolsDropdown ▼ | Pricing | Workspace | Notification | SmartPremiumButton | PlanBadge | UserProfileDropdown. Navigation links India Tools / Workflows / Workspace / "More" dropdown removed (moved to FloatingSidePanel). Settings dropdown moved to gear icon. Mobile menu updated: upgrade CTA, View Plans & Pricing, Open Workspace, All Tools, Contact, Theme, Language.
- **Smart premium button**: Inline IIFE checks `user.premiumTier` + `user.role === 'developer'` — dev→null, elite→green "Member ✓" link to /pricing, free→amber "Upgrade" (opens pro checkout), basic/pro→amber "Go Elite" (opens elite checkout). Same logic replicated in mobile menu.
- **UserProfileDropdown restructured** (`src/components/UserProfileDropdown.tsx`): Labeled sections — Account (name/email/phone + developer badge), Subscription (plan card + progress bar), Developer Tools (dev only: Developer Workspace, Beta Testing Zone, API Explorer, Environment Info), Workspace (Open Workspace, Dashboard, History), Billing (My Plan, Refer & Earn), Appearance (theme toggle, settings), Help (Contact Support, FAQs & Guides), Upgrade/Cancel CTA, Logout.
- **FloatingSidePanel registered** in `App.tsx` — rendered after `<FloatingShortcuts />`.
- **Backdrop added** for mobile bottom sheet (z-40, fixed inset-0).
- **FloatingSidePanel z-index**: desktop z-30 (below navbar z-40), mobile container z-45 (above page content, below modals).

## In Progress
- **(none)**

## Blocked
- **(none)**

## Key Decisions
- **Mock flow retained**: `processUser()` fallback for local users (id starts with `local_`) still generates client-side referral codes — necessary for offline/dev mode without backend.
- **`plan: "pro"` hardcode in PricingPage kept**: Coupon validation input is plan-agnostic; backend validates independently. Not causing functional bugs.
- **`useSEO.ts` kept**: Imported and called by `SimpleHome.tsx` and `ToolPageLayout.tsx`. Function body is intentionally empty (SEO handled by Unhead `<ToolSEO />` declarative component), but interface serves as documentation.
- **`lib/seo.ts` kept**: `toolMeta.ts` still imports `FAQItem` type from it. Other exports are dead but not worth removing mid-sprint.
- **FloatingSidePanel positioned RIGHT** (not left) to match spec and avoid conflict with content margins. Hover expand uses `animate={{width, opacity}}` on label span inside each pill button.
- **Two FABs coexist on mobile** without overlap: FloatingSidePanel at `bottom-6 left-6` (z-45) — side nav; FloatingShortcuts at `bottom-6 right-6` (z-50) — utilities. No overlap due to opposite sides.
- **PopularToolsDropdown re-imported** into Navbar — was removed in earlier iteration, restored as spec requires "Popular Tools ▼" in navbar.
- **Notification bell added** (visual only, no backend connection) — red pulse dot, `aria-label="Notifications"`.
- **DeveloperWorkspace route not prerendered**: Static build prerenders 92 pages; `/developer-workspace` excluded intentionally as it requires auth guard. Falls back to client-side rendering.

## Next Steps
1. Accessibility pass: keyboard nav, ARIA labels, focus states, reduced motion, high contrast — across all new components (FloatingSidePanel, UserProfileDropdown, Navbar, DeveloperWorkspace).
2. Responsiveness audit: no clipping/overflow for DeveloperWorkspace grid, floating buttons reposition correctly around dialogs.
3. Final QA: verify dev tools hidden from non-dev users, verify mobile nav, verify no layout shifts on theme toggle.
4. Remaining code concerns cleanup: 8 `console.log()` in production paths, 5 `@ts-expect-error`/`// @ts-ignore` comments, 4 TODO/FIXME comments, `as any` type casts in PricingPage.

## Critical Context
- Build: Vite 7 + TypeScript 5 + React 19 + Wouter router
- Tiers: Free (₹0), Basic (₹49), Pro (₹99), Elite (₹199)
- Payments: Razorpay primary + UPI direct QR fallback
- 92 pages prerendered in static build
- CSS: `@theme inline` with `--color-background`, `--color-foreground`, `--color-card`, `--color-primary`, etc.
- Theme modes: `dark` (default), `light`, `high-contrast` — persisted via `localStorage` key `filenova-theme`
- Auth: `useAuthStore` with `UserProfile.id` — server users have UUID, local users have `local_` prefix
- Developer account: `subhajitgho123@gmail.com` auto-promoted to `role: 'developer'` + `premiumTier: 'elite'` + `phoneVerified: true` in dev mode via `processUser()` — **no longer `super_admin`**
- FloatingSidePanel desktop: fixed `right-4` z-30, vertical pill dock with per-item hover label animation
- FloatingSidePanel mobile: FAB `bottom-6 left-6` z-45 → bottom sheet + backdrop (z-40)
- FloatingShortcuts mobile: FAB `bottom-6 right-6` z-50 (unchanged)
- Navbar layout (desktop): Logo → Search → PopularToolsDropdown → Pricing → Workspace → Notification → SmartPremiumButton → PlanBadge → UserProfileDropdown
- Navbar z-index: 40 (sticky header)

## Relevant Files
- `src/pages/DeveloperWorkspace.tsx`: New — 31 dev tools in bento grid with search, dev-only access guard
- `src/routes.tsx`: DeveloperWorkspace route added at `/developer-workspace`
- `src/components/FloatingSidePanel.tsx`: Right-side vertical pill dock with hover expand (desktop) + FAB→bottom-sheet (mobile)
- `src/components/Navbar.tsx`: Restructured — PopularToolsDropdown, Pricing, Workspace, Notification bell, smart premium button, no nav shortcuts
- `src/components/UserProfileDropdown.tsx`: Restructured — labeled sections (Account, Subscription, Dev Tools, Workspace, Billing, Appearance, Help, Logout); imports fixed
- `src/store/useAuthStore.ts`: Developer role type added (`'developer'` in union); `processUser()` sets `role: 'developer'` for dev account
- `src/App.tsx`: `FloatingSidePanel` imported and rendered after `FloatingShortcuts`
- `src/components/PopularToolsDropdown.tsx`: Re-imported into Navbar (was removed in earlier iteration)
- `src/components/FloatingShortcuts.tsx`: Existing utility FAB — unchanged, positioned right-6 to coexist with FloatingSidePanel left-6
