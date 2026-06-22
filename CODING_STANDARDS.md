# FileNova — Coding Standards

**Purpose:** Detailed conventions for writing FileNova code.

---

## 1. Philosophy

- **Clarity over cleverness.** Readability trumps brevity.
- **Consistency over personal preference.** Follow existing patterns.
- **Composition over inheritance.** Prefer small, composable functions.
- **Type safety first.** Leverage TypeScript fully.
- **Fail fast.** Validate early, throw errors with context.

---

## 2. File Structure

### 2.1 Naming
- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` (prefix `use`)
- Utilities: `camelCase.ts`
- Types: `PascalCase.ts` or inline in component
- Constants: `UPPER_SNAKE_CASE.ts` or `camelCase.ts` depending on scope

### 2.2 Imports
```tsx
// 1. React
import React, { useState, useEffect, useCallback } from 'react';

// 2. Third-party
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Sparkles } from 'lucide-react';

// 3. Internal aliases (@/)
import { useAuthStore } from '@/store/useAuthStore';
import { apiClient } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';

// 4. Relative
import { UploadZone } from './UploadZone';
import { ProcessingBadge } from '../ProcessingBadge';
import { toolContentMap } from '@/data/toolContent';
```

**Rules:**
- Use `@/` alias for `src/`
- Group by: React → Third-party → Internal → Relative
- Sort alphabetically within groups
- No blank lines between groups

---

## 3. TypeScript Standards

### 3.1 Strict Mode
- `strict: true` in `tsconfig.json`
- No `any` without explanation
- Prefer `unknown` over `any`
- Avoid `@ts-ignore` — add `// @ts-ignore: reason` if unavoidable

### 3.2 Types vs Interfaces
```ts
// Use `type` for unions, intersections, simple shapes
type Theme = 'dark' | 'light';
type UploadStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error';
type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';

type ButtonProps = {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
};

// Use `interface` for public API contracts
interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'operator' | 'admin' | 'super_admin';
}
```

### 3.3 Generics
```ts
// Explicit generic parameter
function getById<T>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}
```

### 3.4 Nullable Handling
```ts
// Prefer explicit unions
const user: User | null = useAuthStore(state => state.user);

// Use optional chaining
const name = user?.profile?.name ?? 'Anonymous';

// Avoid non-null assertions unless proven safe
const name = user!.name; // ❌ Bad
const name = user?.name ?? 'Anonymous'; // ✅ Good
```

---

## 4. React Standards

### 4.1 Component Structure
```tsx
// 1. Imports
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

// 2. Types
interface CardProps {
  title: string;
  description?: string;
  onAction: () => void;
}

// 3. Component
export function Card({ title, description, onAction }: CardProps) {
  // 4. Hooks (state, effects, context)
  const [isOpen, setIsOpen] = useState(false);
  
  // 5. Derived state
  const subtitle = description?.toLowerCase() ?? 'No description';
  
  // 6. Handlers
  const handleClick = useCallback(() => {
    setIsOpen(true);
    onAction();
  }, [onAction]);
  
  // 7. Effects
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);
  
  // 8. Early returns (loading, error, empty)
  if (!title) return null;
  
  // 9. Render
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-muted-foreground mt-2">{description}</p>}
      <Button onClick={handleClick} className="mt-4">
        Action
      </Button>
    </motion.div>
  );
}
```

### 4.2 Hooks Rules
- Always prefix with `use`
- Custom hooks return values, not JSX
- Extract reusable logic from components

```ts
// Good
function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  
  return [value, setValue];
}

// Bad — don't return JSX
function useUserCard() {
  return <div>{user.name}</div>;
}
```

### 4.3 Props
- Destructure in function signature
- Provide defaults for optional props
- Use spread only for documented "pass-through" props

```tsx
// Good
function Button({ 
  children, 
  variant = 'default', 
  size = 'md',
  disabled = false,
  onClick 
}: ButtonProps) {
  // ...
}

// Bad
function Button(props: any) {
  // ...
}
```

### 4.4 State Updates
```tsx
// Functional update for state depending on previous state
setFiles(prev => [...prev, newFile]);

// Object updates
setOptions(prev => ({ ...prev, quality: 82 }));

// Avoid mutating
options.quality = 82; // ❌ Bad
```

---

## 5. Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Component | PascalCase | `UploadCard.tsx` |
| Hook | camelCase + `use` prefix | `useFileUpload.ts` |
| Utility | camelCase | `formatFileSize.ts` |
| Type/Interface | PascalCase | `UploadResult` |
| Enum-like | Union type | `type Status = 'idle' \| 'loading'` |
| Event handler | `handle` + Event | `handleSubmit`, `handleClick` |
| Boolean | `is`/`has`/`should` prefix | `isLoading`, `hasError` |
| Constant | UPPER_SNAKE (module) or camelCase (local) | `MAX_FILE_SIZE` |
| Private method | `_` prefix (rare) | `_calculateHash()` |

---

## 6. CSS / Tailwind

### 6.1 Ordering
```tsx
// 1. Layout
className="flex items-center justify-between"

// 2. Spacing
className="p-4 gap-2"

// 3. Typography
className="text-sm font-medium"

// 4. Colors
className="bg-card text-foreground"

// 5. Borders
className="border border-border rounded-lg"

// 6. Effects
className="shadow-md hover:shadow-lg transition-shadow"

// 7. Responsive
className="md:flex-row lg:gap-6"
```

### 6.2 Extraction Threshold
If `className` exceeds 20 utilities, extract to:
1. Component variant
2. `cn()` utility for conditional classes
3. CSS module for complex animations

```tsx
// Use cn() for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  "rounded-xl border border-border bg-card p-4",
  isActive && "border-primary",
  isLoading && "opacity-50"
)} />
```

### 6.3 Never
```tsx
// ❌ Arbitrary spacing
className="p-[17px]"

// ❌ Arbitrary colors
className="bg-[#123456]"

// ❌ Arbitrary sizes
className="w-[342px]"

// ❌ Inline styles (prefer Tailwind)
style={{ padding: '16px' }}
```

---

## 7. Async Patterns

### 7.1 API Calls
```tsx
// Use apiClient/apiMock exclusively
const result = await apiClient.uploadFiles(files, jobId);

// Handle errors explicitly
try {
  await apiClient.startProcessing(jobId, 'compress', { quality: 82 });
} catch (err) {
  const message = err instanceof Error ? err.message : 'Unknown error';
  setError(message);
  toast.error(message);
}
```

### 7.2 Promises
```ts
// Always await or return
async function processFile(file: File): Promise<Result> {
  const data = await readFile(file); // ✅ Good
  return data;
}

// ❌ Bad — missing await or return
async function processFile(file: File) {
  readFile(file);
}
```

### 7.3 Parallel Operations
```ts
// Concurrent independent operations
const [user, files, settings] = await Promise.all([
  fetchUser(),
  fetchFiles(),
  fetchSettings(),
]);
```

---

## 8. Error Handling

### 8.1 Pattern
```tsx
try {
  await riskyOperation();
} catch (error) {
  // 1. Log (in development)
  if (import.meta.env.DEV) {
    console.error('Operation failed:', error);
  }
  
  // 2. User-friendly message
  const message = getErrorMessage(error);
  
  // 3. State update
  setError(message);
  
  // 4. Recovery action
  toast.error(message, {
    action: {
      label: 'Retry',
      onClick: () => retryOperation(),
    },
  });
}
```

### 8.2 Never
- Swallow errors silently (`catch (_) {}`)
- Show raw error messages to users
- Throw without context (`throw new Error('Error')`)
- Ignore promise rejections

---

## 9. Comments

### 9.1 Rules
- **Comment WHY, not WHAT** (Google code style)
- Keep comments close to the code they describe
- Update comments when code changes
- Delete commented-out code

### 9.2 Good vs Bad
```tsx
// ✅ Good: explains why
// Prevent duplicate uploads while processing is active
if (isProcessing) return;

// ✅ Good: explains non-obvious behavior
// Legacy redirect: old /tools/merge maps to /merge-pdf
<Route path="/tools/merge"><Redirect to="/merge-pdf" /></Route>

// ❌ Bad: explains what (obvious from code)
// Set isProcessing to true
setIsProcessing(true);

// ❌ Bad: useless
// TODO: fix later
```

---

## 10. Zustand Store Patterns

### 10.1 Store Structure
```ts
interface FileState {
  // Primitive state
  isProcessing: boolean;
  progress: number;
  
  // Complex state
  files: FileRecord[];
  
  // Actions
  addFiles: (files: FileRecord[]) => void;
  setProcessing: (processing: boolean) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  isProcessing: false,
  progress: 0,
  files: [],
  
  addFiles: (newFiles) => set((state) => ({
    files: [...state.files, ...newFiles],
  })),
  
  setProcessing: (isProcessing) => set({ isProcessing }),
}));
```

### 10.2 Usage
```tsx
// Select specific values to prevent unnecessary re-renders
const isProcessing = useFileStore(state => state.isProcessing);
const files = useFileStore(state => state.files);

// For multiple values, use shallow comparison
const { isProcessing, progress } = useFileStore(
  state => ({ isProcessing: state.isProcessing, progress: state.progress }),
  shallow
);
```

---

## 11. React Query

### 11.1 Usage
```tsx
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['files', userId],
  queryFn: () => apiClient.getFiles(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: 3,
  retryDelay: 1000,
});
```

### 11.2 Mutations
```tsx
const mutation = useMutation({
  mutationFn: (file: File) => apiClient.uploadFiles([file], jobId),
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['files'] });
    toast.success('Upload complete');
  },
  onError: (error) => {
    toast.error(error.message);
  },
});
```

---

## 12. Testing Standards

### 12.1 Naming
```ts
describe('useFileStore', () => {
  it('should add files to store', () => {});
  it('should clear store when reset called', () => {});
  it('should set processing state', () => {});
});
```

### 12.2 Structure (AAA)
```ts
it('should upload file and return records', async () => {
  // Arrange
  const files = [new File(['content'], 'test.pdf', { type: 'application/pdf' })];
  
  // Act
  const result = await apiClient.uploadFiles(files, 'job-123');
  
  // Assert
  expect(result).toHaveLength(1);
  expect(result[0].name).toBe('test.pdf');
});
```

---

## 13. Accessibility

### 13.1 Semantic HTML
```tsx
// ✅ Good
<button onClick={handleClick}>Upload</button>
<nav aria-label="Main navigation">...</nav>
<main>
  <h1>Page Title</h1>
</main>

// ❌ Bad
<div onClick={handleClick}>Upload</div>
<div class="nav">...</div>
```

### 13.2 ARIA
```tsx
// Icon-only buttons
<button aria-label="Close menu">
  <X className="h-5 w-5" />
</button>

// Expanding sections
<button aria-expanded={isOpen} aria-controls="dropdown-content">
  Options
</button>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

### 13.3 Focus Management
```tsx
// Trap focus in modals
useEffect(() => {
  if (!isOpen) return;
  const focusable = dialogRef.current?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  // Focus first element, trap Tab...
}, [isOpen]);

// Return focus on close
useEffect(() => {
  if (!isOpen && triggerRef.current) {
    triggerRef.current.focus();
  }
}, [isOpen]);
```

---

## 14. Performance

### 14.1 Memoization (only when beneficial)
```tsx
// Expensive calculation
const sortedFiles = useMemo(() => 
  [...files].sort((a, b) => b.size - a.size),
  [files]
);

// Stable callback for child components
const handleUpload = useCallback((files: File[]) => {
  void processFiles(files);
}, [processFiles]);
```

### 14.2 Lists
```tsx
// ✅ Stable keys
{files.map(file => (
  <FileItem key={file.id} file={file} />
))}

// ❌ Index as key (only okay if list is static)
{items.map((item, i) => <div key={i}>{item}</div>)}
```

### 14.3 Code Splitting
```tsx
// Route-level splitting (already done in App.tsx)
const AdminDashboard = React.lazy(() => import('@/pages/AdminDashboard'));

// Component-level splitting (when component is large and not always needed)
const HeavyChart = React.lazy(() => import('./HeavyChart'));
```

---

## 15. Internationalization

### 15.1 Pattern
```tsx
import { useTranslation } from '@/lib/i18n';

function MyComponent() {
  const { t, tText } = useTranslation();
  
  // Key-based (preferred for static strings)
  const title = t('upload.title');
  
  // Dynamic text (for runtime strings)
  const dynamic = tText('Uploading your file…');
  
  return <h1>{title}</h1>;
}
```

### 15.2 Rules
- All user-visible strings must be translated
- Use `t()` for static strings
- Use `tText()` for runtime/dynamic strings
- Add new keys to `document-automation.ts` translations object

---

## 16. API Layer

### 16.1 Location
All API calls go through `src/lib/api.ts`:
```ts
export const apiClient = {
  checkHealth: () => Promise<HealthCheckResult>,
  uploadFiles: (files: File[], jobId: string) => Promise<FileRecord[]>,
  startProcessing: (jobId: string, operation: string, options: Record) => Promise<void>,
  pollStatus: (jobId: string) => Promise<JobStatus>,
  getDownloadUrl: (jobId: string) => string,
};

export const apiMock = {
  // Same interface, mock implementation
};
```

### 16.2 Rules
- Never call `fetch()` or `axios()` directly in components
- Always use `apiClient` (real) or `apiMock` (fallback)
- Check `HAS_BACKEND` before deciding which to use
- Don't duplicate API logic — add to `apiClient` if reusable

---

## 17. Backend Standards (Express)

### 17.1 Route Structure
```ts
import { Router, type Request, type Response, type NextFunction } from "express";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";
import { z } from "zod";

const router = Router();

// Schema validation
const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  size: z.number().max(100 * 1024 * 1024),
});

router.post("/create", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = createItemSchema.parse(req.body);
    
    // Business logic
    const result = await service.create(validated, req.user!.id);
    
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors });
    } else {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
});

export default router;
```

### 17.2 Middleware Order
```ts
app.use(helmet()); // Security headers
app.use(cors({ ... })); // CORS
app.use(express.json({ limit: "50mb" })); // Body parsing
app.use(cookieParser()); // Cookies
app.use(pinoHttp({ logger })); // Logging
app.use("/api", healthRouter); // Health (no auth)
app.use(authMiddleware); // Global auth
app.use(apiLimiter); // Rate limit
app.use("/api/v1", requestTimeout(30000), apiV1Router); // API routes
app.use((err, req, res, next) => { ... }); // Error handler
```

### 17.3 Database Queries
```ts
// Always use parameterized queries (Drizzle does this automatically)
const [user] = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.email, email.toLowerCase()))
  .limit(1);

// Transactions for multi-step operations
const result = await db.transaction(async (tx) => {
  const [job] = await tx.insert(processingJobsTable).values(...).returning();
  await tx.insert(uploadedFilesTable).values(...);
  return job;
});
```

---

## 18. Common Utilities

### 18.1 `cn()` — Class Name Merging
Located at `src/lib/utils.ts` (via `tailwind-merge` + `clsx`):
```tsx
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className // allow override
)} />
```

### 18.2 Formatting
```ts
// File size
formatFileSize(bytes) // "2.4 MB"

// Date
formatDistanceToNow(new Date()) // "2 hours ago"
format(new Date(), 'PPP') // "June 20, 2025"
```

---

## 19. Git Conventions

### 19.1 Commit Messages
```
feat: add PDF watermark tool
fix: resolve upload progress bar stuck at 99%
refactor: extract useFileUpload hook
perf: lazy load PDF preview component
style: align pricing card buttons
docs: update ARCHITECTURE.md
test: add upload validation tests
chore: update dependencies
```

### 19.2 Branch Naming
```
feature/pdf-watermark
fix/upload-progress-stuck
refactor/useFileUpload
perf/pricing-card-lazy-load
```

### 19.3 Pre-commit
- No `console.log`, `console.warn`, `debugger`
- No unused imports
- No commented-out code
- TypeScript compiles
- Lint passes
