# FileNova — Component Guide

**Purpose:** Inventory and guidance for all major UI components.

---

## 1. Component Organization

```
src/components/
├── ui/                    # Radix primitives (shadcn/ui style)
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   └── ...
├── workspace/             # Workspace-specific components
│   ├── WorkspaceRegistry.tsx
│   ├── ProcessingBadge.tsx
│   ├── PreviewPanel.tsx
│   ├── OptionsPanel.tsx
│   ├── UploadZone.tsx
│   ├── ToolGrid.tsx
│   ├── PdfResultPreview.tsx
│   ├── ProgressTracker.tsx
│   ├── SmartRecommendations.tsx
│   └── ...
├── SmartSearchBar.tsx     # Global search trigger
├── GlobalSearch.tsx       # Search dropdown
├── FileNovaAssistant.tsx  # AI helpdesk
├── Footer.tsx             # Site footer
├── LanguageSelector.tsx   # i18n switcher
├── LoadingScreen.tsx      # Initial app loader
├── OfflineBanner.tsx      # Connection status
├── FeatureGate.tsx        # Premium feature check
├── Skeleton.tsx           # Loading placeholders
├── FreeBadge.tsx          # "Free" indicator
├── ExamToolkit.tsx        # India-specific exam tools
├── PanCardEditor.tsx      # PAN card photo editor
├── YouTubePromo.tsx       # YouTube channel promo
├── GlobalNotice.tsx       # Site-wide announcements
├── FileExpiryBar.tsx      # TTL countdown for files
├── OTPVerificationModal.tsx
├── EditingWindow.tsx      # In-app file editor
├── FloatingShortcuts.tsx  # Quick action buttons
├── ConnectionStatusIndicator.tsx
└── AnimatedEffects.tsx    # Particles, cursor glow
```

---

## 2. Core Components

### 2.1 SmartSearchBar

**File:** `src/components/SmartSearchBar.tsx`  
**Purpose:** Global search trigger in navbar  
**Props:** None (uses context)  
**Children:** SearchInput + SearchDropdown (from `lib/intelligent-search`)  
**Behavior:**
- Opens search dialog on click or `Cmd/Ctrl+K`
- Focuses input automatically
- Closes on Escape
- Shows recent searches, popular tools, suggestions

### 2.2 GlobalSearch

**File:** `src/components/GlobalSearch.tsx`  
**Purpose:** Full search experience overlay  
**Exposes:** 
- Search input with debounce (300ms)
- Grouped results: Recent | Popular | Suggestions
- Keyboard navigation (↑↓ Enter Escape)
- Empty state with helpful message
- Loading skeleton

### 2.3 FileNovaAssistant

**File:** `src/components/FileNovaAssistant.tsx`  
**Purpose:** General AI helpdesk chatbot  
**Props:**
- `isOpen: boolean`
- `onClose: () => void`

**Features:**
- Preset prompts for common questions
- Markdown rendering (via `marked`)
- Streaming response support
- Auto-scroll to bottom
- Copy message support
- Context: general FileNova help (not tool-specific)

### 2.4 SmartAssistant

**File:** `src/assistant/components/SmartAssistant.tsx`  
**Purpose:** Context-aware AI assistant  
**Props:**
- `isOpen: boolean`
- `onClose: () => void`

**Features:**
- Knows current tool, files, operation
- Tool-specific guidance via adapters (`assistant/toolAdapters/pdfTools.ts`)
- Session history (last 4 messages)
- Follow-up tool suggestions
- Streaming responses

**Difference from FileNovaAssistant:** SmartAssistant is workspace-integrated and tool-aware; FileNovaAssistant is a standalone helpdesk.

### 2.5 LoadingScreen

**File:** `src/components/LoadingScreen.tsx`  
**Purpose:** Initial app loading + route-level fallback  
**Behavior:**
- Shows animated logo/branding
- Used as `React.lazy` fallback
- Checks `useAuthStore.initialized` before hiding

### 2.6 OfflineBanner

**File:** `src/components/OfflineBanner.tsx`  
**Purpose:** Notify user when browser is offline  
**Behavior:**
- Fixed at top when `!navigator.onLine`
- Pushes content down via CSS variable `--banner-height`
- Auto-hides when online restored

### 2.7 FeatureGate

**File:** `src/components/FeatureGate.tsx`  
**Purpose:** Conditionally render premium/experimental features  
**Props:**
- `feature: FeatureKey`
- `children: ReactNode`
- `fallback?: ReactNode`

**Behavior:**
- Checks `isFeatureEnabled(feature)` from `features.config.ts`
- Renders `children` if enabled, else `fallback` (default: null)

### 2.8 Skeleton

**File:** `src/components/Skeleton.tsx`  
**Purpose:** Loading placeholder  
**Variants:**
- `text` — single line
- `paragraph` — multiple lines
- `card` — card-shaped placeholder
- `image` — image placeholder

### 2.9 FreeBadge

**File:** `src/components/FreeBadge.tsx`  
**Purpose:** Indicate free tool/tier  
**Appearance:** Small pill badge with green tint

### 2.10 PanCardEditor

**File:** `src/components/PanCardEditor.tsx`  
**Purpose:** Edit PAN card photos (crop, resize, brightness)  
**Integrations:**
- Canvas-based editing
- `useImageEditor` hook
- File output to workspace

### 2.11 EditingWindow

**File:** `src/components/EditingWindow.tsx`  
**Purpose:** Modal editor for images/PDFs  
**Props:**
- `file: File`
- `fileType: 'image' | 'pdf' | 'document'`
- `toolType: string`
- `onClose: () => void`
- `onDone: (blob: Blob) => void`

**Behavior:**
- Opens over workspace
- Returns edited file to upload pipeline
- Used by PAN card, passport photo, etc.

### 2.12 FloatingShortcuts

**File:** `src/components/FloatingShortcuts.tsx`  
**Purpose:** Quick-access buttons (floating action buttons)  
**Features:**
- Top tools: Merge PDF, Compress PDF, PDF to Word
- Scroll-aware visibility

---

## 3. Workspace Components

### 3.1 WorkspaceRegistry

**File:** `src/components/workspace/WorkspaceRegistry.tsx`  
**Purpose:** Central registry mapping tool slugs to workspace configs  
**Structure:**
```tsx
const registry: Record<string, {
  sidebar: React.ComponentType<SidebarProps>;
  title: string;
  description: string;
}> = { ... }
```

### 3.2 UploadZone

**File:** `src/components/workspace/UploadZone.tsx`  
**Purpose:** Drag-and-drop + click-to-upload  
**Props:**
- `accept?: string`
- `multiple?: boolean`
- `maxSize?: number`
- `onFiles: (files: File[]) => void`

**Features:**
- react-dropzone integration
- File type validation (visual feedback)
- Progress indicator
- i18n labels

### 3.3 PreviewPanel

**File:** `src/components/workspace/PreviewPanel.tsx`  
**Purpose:** Render file previews (PDF pages, images)  
**Technologies:**
- `pdfjs-dist` for PDF rendering
- `<img>` for images
- Canvas for PDF-to-image conversion

### 3.4 OptionsPanel

**File:** `src/components/workspace/OptionsPanel.tsx`  
**Purpose:** Tool-specific settings sidebar  
**Behavior:**
- Dynamically renders controls based on `operationOptions`
- Debounced updates to store
- Validation feedback

### 3.5 ToolGrid

**File:** `src/components/workspace/ToolGrid.tsx`  
**Purpose:** Grid of available tools in workspace  
**Features:**
- Category filtering (PDF, Image, Office, Video)
- Search integration
- Favorites (localStorage)
- Recently used tools

### 3.6 ProcessingBadge

**File:** `src/components/workspace/ProcessingBadge.tsx`  
**Purpose:** Animated badge showing processing status  
**States:**
- Uploading
- Processing (with spinner)
- Completed (checkmark)
- Failed (error icon)

### 3.7 ProgressTracker

**File:** `src/components/workspace/ProgressTracker.tsx`  
**Purpose:** Step indicator for multi-step workflows  
**Features:**
- Linear or circular progress
- Step labels
- Animated transitions

### 3.8 SmartRecommendations

**File:** `src/components/workspace/SmartRecommendations.tsx`  
**Purpose:** AI-powered tool suggestions based on uploaded files  
**Logic:**
- Detects file type
- Suggests next logical step in workflow
- Example: PDF → "Compress", "Split", "OCR"

### 3.9 TrustIndicators

**File:** `src/components/workspace/TrustIndicators.tsx`  
**Purpose:** Security/privacy signals  
**Content:**
- "100% Free & Unlimited"
- "Client-Side Security"
- "Instant Auto-Delete"
- Encryption badges

### 3.10 PdfResultPreview

**File:** `src/components/workspace/PdfResultPreview.tsx`  
**Purpose:** Preview processed PDF before download  
**Features:**
- Page thumbnails
- File size display
- Download button

### 3.11 PdfMergeGrid

**File:** `src/components/workspace/PdfMergeGrid.tsx`  
**Purpose:** Drag-and-drop grid for merge order  
**Features:**
- Reorderable cards
- Page count per file
- Remove file button

### 3.12 PassportPhotoEditor

**File:** `src/components/workspace/PassportPhotoEditor.tsx`  
**Purpose:** Crop/position passport photos  
**Features:**
- Aspect ratio lock (35×45mm, etc.)
- Zoom/pan
- Background removal preview

### 3.13 LiveVideoEditor

**File:** `src/components/workspace/LiveVideoEditor.tsx`  
**Purpose:** Browser-based video trimming/compression  
**Technologies:**
- FFmpeg.wasm (if available)
- Or server-side fallback

### 3.14 PrivacyDashboard

**File:** `src/components/workspace/PrivacyDashboard.tsx`  
**Purpose:** Show file security status  
**Content:**
- Encryption status
- Retention timer
- Processing location (local vs server)

### 3.15 VisualGuideModal

**File:** `src/components/workspace/VisualGuideModal.tsx`  
**Purpose:** Step-by-step visual tutorial for complex tools  
**Features:**
- Animated GIF/video
- Text instructions
- Dismissible

---

## 4. Sidebar Components

Each tool has a dedicated sidebar for configuration.

| Component | Tool | Key Options |
|-----------|------|-------------|
| `MergeSidebar.tsx` | Merge PDF | File order, output name |
| `SplitSidebar.tsx` | Split PDF | Mode (pages/ranges), output |
| `CompressSidebar.tsx` | Compress PDF | Quality level (Low/Med/High) |
| `UnlockSidebar.tsx` | Unlock PDF | Password input |
| `ProtectSidebar.tsx` | Protect PDF | Password + confirm |
| `RotateSidebar.tsx` | Rotate PDF | Angle, pages |
| `PANSidebar.tsx` | PAN Card | Width, height, DPI |
| `AadhaarSidebar.tsx` | Aadhaar Mask | Mask position, intensity |

---

## 5. Page Components

### 5.1 Home (`src/pages/Home.tsx`)
**Purpose:** Main workspace entry  
**Features:**
- Hero banner with search
- Tool grid
- Recent files
- AI recommendations
- Trust indicators

### 5.2 SimpleHome (`src/pages/SimpleHome.tsx`)
**Purpose:** Landing page for unauthenticated users  
**Features:**
- Marketing hero
- Feature highlights
- Tool showcase
- CTA to get started

### 5.3 DashboardPage (`src/pages/DashboardPage.tsx`)
**Purpose:** User dashboard after login  
**Features:**
- Recent files list
- Usage statistics
- Quick actions
- AI Assistant access
- Premium upsell

### 5.4 ToolsPage (`src/pages/ToolsPage.tsx`)
**Purpose:** All tools catalog  
**Features:**
- Category tabs
- Search integration
- Grid layout
- Tool detail preview

### 5.5 PricingPage (`src/pages/PricingPage.tsx`)
**Purpose:** Subscription plans  
**Features:**
- 4 tiers (Free, Basic, Pro, Elite)
- SpotlightCard with 3D tilt effect
- Razorpay/UPI integration
- Feature comparison
- Student offers

### 5.6 ToolPage (`src/pages/ToolPage.tsx`)
**Purpose:** Generic tool wrapper for `/tools/:toolId`  
**Behavior:**
- Dynamic import based on `toolId`
- Falls back to generic tool template if no dedicated page
- SEO metadata injection

---

## 6. Component Patterns

### 6.1 Page Structure
Every tool page follows this pattern:
```tsx
export default function ToolPage() {
  return (
    <div className="container mx-auto py-8">
      <ToolHeader />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UploadZone />
          <PreviewPanel />
          <PdfResultPreview />
        </div>
        <div>
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
```

### 6.2 Error Boundary Pattern
All routes wrapped in `App.tsx`:
```tsx
<QueryErrorResetBoundary>
  {({ reset }) => (
    <ErrorBoundary onReset={reset}>
      <LazyMotion features={domAnimation}>
        <Router />
      </LazyMotion>
    </ErrorBoundary>
  )}
</QueryErrorResetBoundary>
```

### 6.3 Loading Pattern
```tsx
const Component = React.lazy(() => import('./Component'));
// In route:
<Route path="/x">
  <React.Suspense fallback={<LoadingScreen />}>
    <Component />
  </React.Suspense>
</Route>
```

---

## 7. Styling Conventions

### 7.1 Card Component
```tsx
<div className="rounded-xl border border-border bg-card text-card-foreground shadow-md">
  {/* Content */}
</div>
```

### 7.2 Button Variants
```tsx
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
```

### 7.3 Form Field
```tsx
<div className="space-y-2">
  <Label htmlFor="field">Label</Label>
  <Input id="field" placeholder="Enter value" />
  <p className="text-xs text-destructive">{error}</p>
</div>
```

---

## 8. Animation Conventions

### 8.1 Page Transitions
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25 }}
>
  {content}
</motion.div>
```

### 8.2 List Stagger
```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
      }}
    />
  ))}
</motion.div>
```

### 8.3 Hover Scale
```tsx
<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
  <Card>...</Card>
</motion.div>
```
