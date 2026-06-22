# FileNova — Design System

**Purpose:** Single source of truth for all visual design decisions in FileNova.

---

## 1. Design Philosophy

FileNova is a premium SaaS platform. Every visual decision should communicate:
- **Trust** — professional, clean, reliable
- **Speed** — minimal, fast, responsive
- **Clarity** — readable, organized, scannable
- **Efficiency** — productive, distraction-free

**Inspiration** (take principles, not copies):
- **Linear**: Keyboard-first, minimal chrome
- **Vercel**: Clean typography, subtle borders
- **Stripe**: Trust signals, premium card treatment
- **Notion**: Readability, whitespace
- **Raycast**: Delightful micro-interactions

**FileNova's own identity:** Indian-first document automation with a professional, trustworthy feel. Not playful, not cold.

---

## 2. Color System

### 2.1 Semantic Tokens (Tailwind v4)

All colors are accessed via semantic tokens. **Never hardcode hex values in components.**

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `bg-background` | White / warm gray | Deep slate | Page background |
| `bg-foreground` | — | — | Inverted text (rare) |
| `text-foreground` | Near-black | Off-white | Primary text |
| `bg-primary` | Indigo/slate | Indigo/slate lighter | CTAs, active states |
| `text-primary-foreground` | White | Dark | Text on primary |
| `bg-secondary` | Light gray | Dark gray | Secondary surfaces |
| `bg-muted` | Very light gray | Dark with opacity | Subtle backgrounds |
| `text-muted-foreground` | Medium gray | Muted gray | Secondary text |
| `bg-accent` | — | — | Accent highlights |
| `text-accent-foreground` | — | — | Text on accent |
| `bg-card` | White | Dark elevated | Card backgrounds |
| `text-card-foreground` | Dark | Light | Card text |
| `border-border` | Light gray | Dark gray | All borders |
| `bg-destructive` | Red-500 | Red-600 | Error states |
| `text-destructive-foreground` | White | White | Text on destructive |
| `bg-ring` | Primary color | Primary color | Focus rings |

### 2.2 Brand Colors

| Color | Hex (approximate) | Token Override | Usage |
|-------|------------------|----------------|-------|
| Indigo | `#4F46E5` | `primary` | Primary CTAs, links, active states |
| Sky | `#0EA5E9` | — | Secondary accents, info |
| Emerald | `#10B981` | — | Success, completed |
| Amber | `#F59E0B` | — | Warnings, processing |
| Rose | `#F43F5E` | — | Errors, destructive |
| Slate | `#64748B` | — | Neutral, muted text |

### 2.3 Color Rules
- ✅ Use `bg-primary`/`text-primary-foreground` for buttons
- ✅ Use `bg-card` for card backgrounds
- ✅ Use `border-border` for all borders
- ❌ Never use `bg-white`, `text-black`, `bg-gray-100` in components
- ❌ Never use flat `#000` or `#fff`
- ❌ Never use random gradients

---

## 3. Typography

### 3.1 Font Family
- **Primary:** Inter (Google Fonts)
- **Monospace:** `font-mono` for code/technical content
- Loaded with `font-display: swap`

### 3.2 Type Scale

| Role | Class | Size | Weight | Line Height |
|------|-------|------|--------|-------------|
| Display | `text-4xl md:text-5xl` | 36–48px | 800 | 1.1 |
| H1 | `text-3xl md:text-4xl` | 30–36px | 700 | 1.2 |
| H2 | `text-2xl md:text-3xl` | 24–30px | 600 | 1.3 |
| H3 | `text-xl md:text-2xl` | 20–24px | 600 | 1.4 |
| Body L | `text-lg` | 18px | 400 | 1.6 |
| Body | `text-base` | 16px | 400 | 1.6 |
| Body S | `text-sm` | 14px | 400 | 1.5 |
| Caption | `text-xs` | 12px | 400 | 1.4 |
| Overline | `text-xs uppercase tracking-wider` | 12px | 600 | 1.4 |

### 3.3 Typography Rules
- Maintain clear heading hierarchy
- Avoid random font weights
- Use `tracking-tight` for headings, `tracking-normal` for body
- Never use `text-[17px]` or arbitrary font sizes

---

## 4. Spacing System

### 4.1 Scale

Use these values exclusively. Never arbitrary spacing.

| Token | Value | Usage |
|-------|-------|-------|
| `1` | 4px | Tight gaps, icon padding |
| `2` | 8px | Default gap, inline spacing |
| `3` | 12px | Small section padding |
| `4` | 16px | Card padding, component spacing |
| `5` | 20px | Large gaps, input padding |
| `6` | 24px | Section spacing |
| `8` | 32px | Major section spacing |
| `10` | 40px | Page section padding |
| `12` | 48px | Large containers |
| `16` | 64px | Hero sections |
| `20` | 80px | Full-page vertical rhythm |
| `24` | 96px | Major breaks |

### 4.2 Common Patterns
```tsx
// Card padding
className="p-4 md:p-6"

// Section spacing
className="py-8 md:py-16"

// Grid gaps
className="gap-4 md:gap-6"

// Inline spacing
className="space-x-2" // icons in button
className="space-y-4" // vertical list
```

---

## 5. Border Radius

| Token | Value | Class | Usage |
|-------|-------|-------|-------|
| `sm` | 6px | `rounded-sm` | Small badges, tags |
| `md` | 10px | `rounded-md` | Buttons, inputs, small cards |
| `lg` | 16px | `rounded-lg` | Standard cards, modals |
| `xl` | 24px | `rounded-xl` | Hero cards, feature cards |
| `2xl` | 32px | `rounded-2xl` | Large containers, error screens |
| `full` | 9999px | `rounded-full` | Pills, avatars, circular elements |

### 5.1 Rules
- ✅ Use `rounded-xl` for most cards
- ✅ Use `rounded-full` for pills/avatars
- ❌ Never mix `2px`, `8px`, `18px`, `40px` randomly

---

## 6. Shadows

| Level | Class | Usage |
|-------|-------|-------|
| Subtle | `shadow-sm` | Elevated buttons, inputs |
| Default | `shadow-md` | Cards in grid |
| Elevated | `shadow-lg` | Modals, dropdowns, dialogs |
| Overlay | `shadow-xl` | Floating panels |

### 6.1 Rules
- Keep shadows subtle
- Cards and dropdowns should share shadow depth
- Avoid heavy shadows (`shadow-2xl`, etc.)
- Glassmorphism uses `backdrop-blur` + subtle border, not heavy shadow

---

## 7. Icons

### 7.1 Library
- **lucide-react** exclusively
- Consistent stroke width (2px)

### 7.2 Sizes
| Size | Class | Usage |
|------|-------|-------|
| Small | `h-4 w-4` | Inline with text, badges |
| Medium | `h-5 w-5` | Buttons, nav items |
| Large | `h-6 w-6` | Feature cards, headings |

### 7.3 Rules
- Never mix icon libraries
- Never use different stroke weights
- Maintain consistent alignment

---

## 8. Buttons

### 8.1 Variants

| Variant | Class | Usage |
|---------|-------|-------|
| Primary | `bg-primary text-primary-foreground` | Main CTAs |
| Secondary | `bg-secondary text-secondary-foreground` | Alternative actions |
| Outline | `border border-border bg-background` | Tertiary, cancel |
| Ghost | `hover:bg-accent` | Minimal actions |
| Destructive | `bg-destructive text-destructive-foreground` | Delete, remove |

### 8.2 States

Every button must have:
- Default → Hover → Active → Focus → Disabled → Loading

### 8.3 Sizes

| Size | Class | Touch Target |
|------|-------|-------------|
| sm | `h-9 px-3 text-sm` | 36px |
| md | `h-10 px-4 text-sm` | 40px |
| lg | `h-11 px-8 text-base` | 44px |

### 8.4 Rules
- Minimum 40px height for touch targets
- Consistent padding across same tier
- Visible focus ring (`ring-2 ring-ring`)
- Disabled: `opacity-50 cursor-not-allowed`
- Loading: spinner + `cursor-wait`

---

## 9. Cards

### 9.1 Anatomy
```
┌─────────────────────────┐
│  Card Container          │
│  ├── Border              │
│  ├── Background          │
│  ├── Shadow              │
│  │                       │
│  └── Padding (p-4/6)     │
│      ├── Header          │
│      ├── Content         │
│      ├── Footer/CTA      │
│      └── Optional icon   │
└─────────────────────────┘
```

### 9.2 Base Classes
```tsx
className="rounded-xl border border-border bg-card text-card-foreground shadow-md"
```

### 9.3 Rules
- Equal padding (use `p-4`, `p-6`, not mixed)
- Visible border
- Consistent shadow depth
- Clear hierarchy (header > body > footer)
- Never overcrowd

---

## 10. Dialogs / Modals

- Overlay: `bg-black/60 backdrop-blur-sm`
- Container: `rounded-xl border border-border bg-background shadow-lg`
- Animation: `scale(0.95)` → `scale(1)` with fade
- Trap focus inside
- Close on Escape and overlay click
- Max width: `max-w-lg` or `max-w-2xl`

---

## 11. Navbar

### 11.1 Behavior
- Sticky at top on scroll
- Height: `h-16`
- Background: `bg-background/80 backdrop-blur-md border-b`
- Z-index above content

### 11.2 Layout (Desktop)
```
[Logo] [Popular Tools ▼] [All Tools] [Search trigger] ... [Lang ▼] [Theme] [User ▼]
```

### 11.3 Layout (Mobile)
```
[Logo] [Menu button]
  └─ [Hamburger drawer with all items]
```

### 11.4 Rules
- Never clip dropdowns
- Never hide popovers
- All items must remain clickable
- Search input visible in expanded state

---

## 12. Forms

### 12.1 Inputs
```tsx
// Base
className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background"

// Focus
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

// Error
className="border-destructive"

// With label
<Label htmlFor="field">Label</Label>
<Input id="field" />
```

### 12.2 Labels
- Always associate with `<label htmlFor="">`
- Position: above input, `text-sm font-medium`
- Error messages: `text-xs text-destructive mt-1`

---

## 13. Pricing Cards

### 13.1 Structure
- Equal height cards
- "Most Popular" tier highlighted with border + subtle glow
- Feature list with checkmarks
- Clear CTA button
- Responsive: `grid grid-cols-1 md:grid-cols-3`

### 13.2 Highlight Style
```tsx
className="relative rounded-xl border-2 border-primary bg-primary/5 p-6"
// Plus badge:
<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
  MOST POPULAR
</div>
```

---

## 14. Dashboard

- Prioritize quick actions at top
- Recent activity cards
- Statistics with large numbers
- File history table/list
- AI Assistant accessible via floating button
- Everything discoverable without scrolling

---

## 15. Workspace

- Productivity-first layout
- Left: Upload zone + file list
- Center: Preview panel
- Right: Options/settings panel
- Bottom: Progress + download actions
- Minimal decoration

---

## 16. Animations

### 16.1 Library
- **Framer Motion** with `LazyMotion` + `domAnimation`

### 16.2 Timing

| Interaction | Duration |
|-------------|----------|
| Button press | 100–150ms |
| Hover transition | 150–200ms |
| Normal component transition | 200–250ms |
| Page transition | 250–300ms |
| Complex animation | 300–350ms |

### 16.3 Preferred Animations
- Fade in/out
- Slide up/down
- Scale (modals, hover)
- Stagger (lists)
- Blur reveal (subtle)

### 16.4 Rules
- Only use `transform` and `opacity`
- Never animate `width`, `height`, `top`, `left`
- Respect `prefers-reduced-motion`
- Target 60 FPS

---

## 17. Responsive Behavior

### 17.1 Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| Mobile | 0–639px | `default` (mobile-first) |
| Tablet | 640–1023px | `md:` |
| Laptop | 1024–1439px | `lg:` |
| Desktop | 1440px+ | `xl:` |

### 17.2 Test Widths
- 320px (small phone)
- 375px (iPhone)
- 768px (iPad portrait)
- 1024px (iPad landscape / laptop)
- 1440px (standard desktop)
- 1920px (large desktop)

### 17.3 Rules
- No horizontal overflow
- No clipped content
- No hidden buttons
- Touch targets ≥ 40px on mobile
- Text never overflows containers

---

## 18. Light & Dark Mode

### 18.1 Light Mode
- Background: warm white/off-white
- Text: near-black (#0F172A)
- Cards: white with subtle border
- Shadows: visible, warm
- Icons: dark strokes

### 18.2 Dark Mode
- Background: deep slate (#020817 or similar)
- Text: off-white (#E2E8F0)
- Cards: elevated dark (#0F172A)
- Shadows: subtle, avoid pure black
- Icons: light strokes

### 18.3 Rules
- Every component must work in both modes
- Never pure `#000` or `#fff`
- Test contrast: WCAG AA (4.5:1 for text)
- Nothing should become invisible

---

## 19. Empty States

Every empty section must include:
1. Icon or illustration (lucide)
2. Helpful message (what + why)
3. Primary CTA (clear action)
4. Optional: secondary action

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold mb-1">No files yet</h3>
  <p className="text-muted-foreground mb-4 max-w-sm">
    Upload your first document to get started. We support PDFs, images, and Office files.
  </p>
  <Button onClick={handleUpload}>Upload Document</Button>
</div>
```

---

## 20. Loading States

### 20.1 Preferred
- Skeleton loaders for lists/cards
- Progress bars for file processing
- Optimistic UI where safe

### 20.2 Avoid
- Indefinite spinners without context
- Spinners on large content areas

### 20.3 Rules
- Show estimated time when available
- Allow cancel when possible
- Show success/failure state

---

## 21. Error States

```tsx
<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
  <div className="flex items-start gap-3">
    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
    <div>
      <h4 className="font-medium text-destructive">Upload failed</h4>
      <p className="text-sm text-muted-foreground mt-1">
        The file exceeded the 3MB limit for free users. Upgrade to Basic for 15MB uploads.
      </p>
      <Button variant="outline" className="mt-3" onClick={retry}>
        Try Again
      </Button>
    </div>
  </div>
</div>
```

### 21.1 Rules
- Explain **what** happened
- Explain **why** it happened
- Provide **how to recover**
- Include **retry** button when possible
- Never generic "Something went wrong"

---

## 22. Glassmorphism (Subtle)

Use sparingly. Only for:
- Navbar
- Floating panels
- Modals (overlay)
- AI Assistant container

```tsx
className="bg-background/80 backdrop-blur-md border border-white/10"
```

Never:
- Heavy blur everywhere
- Everything translucent
- Pure white glass on white background
