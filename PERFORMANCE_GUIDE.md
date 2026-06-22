# FileNova — Performance Guide

**Purpose:** Performance optimization standards and best practices.

---

## 1. Performance Philosophy

Performance is a feature. FileNova targets:
- **Fast perceived load:** Content appears within 1s
- **Smooth interactions:** 60fps animations
- **Efficient processing:** Minimal redundant work
- **Graceful degradation:** Works on slow connections

**Core Rule:** Measure before optimizing. Don't guess.

---

## 2. Core Web Vitals Targets

| Metric | Target | Current (est.) |
|--------|--------|----------------|
| LCP (Largest Contentful Paint) | < 2.5s | ~2.0s |
| FID (First Input Delay) | < 100ms | ~50ms |
| CLS (Cumulative Layout Shift) | < 0.1 | ~0.05 |
| TTFB (Time to First Byte) | < 600ms | ~400ms |

---

## 3. Loading Strategy

### 3.1 Route-Based Code Splitting
Already implemented in `App.tsx`:
```tsx
const MergePdf = React.lazy(() => import('@/pages/tools/MergePdf'));
const SplitPdf = React.lazy(() => import('@/pages/tools/SplitPdf'));
// ... 30+ lazy routes
```

**Rules:**
- All tool pages must be lazy-loaded
- Admin pages must be lazy-loaded
- Use `React.Suspense` with `<LoadingScreen />` fallback

### 3.2 Component-Level Splitting
Use when:
- Component > 50KB bundle impact
- Component not needed on initial render
- Component is heavy (charts, editors, PDF viewers)

```tsx
const HeavyPdfViewer = React.lazy(() => import('./HeavyPdfViewer'));
```

### 3.3 Font Loading
```css
/* In index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
```
- Uses `display=swap` for immediate text rendering
- Font subsetting recommended (future)

### 3.4 Asset Optimization
- Images: Use WebP with JPEG/PNG fallbacks
- SVGs: Inline small icons, externalize large ones
- Fonts: Preload critical weights only

---

## 4. React Optimization

### 4.1 Re-render Prevention
```tsx
// ✅ Memoize expensive calculations
const sortedFiles = useMemo(
  () => [...files].sort((a, b) => b.size - a.size),
  [files]
);

// ✅ Stable callbacks for children
const handleUpload = useCallback((files: File[]) => {
  void processFiles(files);
}, [processFiles]);

// ✅ Memoize components that receive stable props
const MemoizedCard = React.memo(Card);
```

### 4.2 Zustand Selectors
```tsx
// ✅ Select specific values (prevents re-render on unrelated changes)
const isProcessing = useFileStore(state => state.isProcessing);
const progress = useFileStore(state => state.progress);

// ✅ Shallow for multiple values
const { isProcessing, progress, error } = useFileStore(
  state => ({ isProcessing: state.isProcessing, progress: state.progress, error: state.error }),
  shallow
);

// ❌ Don't select entire store
const store = useFileStore(); // Re-renders on ANY change
```

### 4.3 Lists
```tsx
// ✅ Stable keys (never index unless truly static list)
{files.map(file => (
  <FileItem key={file.id} file={file} />
))}

// ❌ Never use index for dynamic content
{items.map((item, i) => <div key={i}>{item.name}</div>)}
```

### 4.4 Virtualization
For lists > 50 items:
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 60,
});
```

**Applied to:**
- Tools catalog (30+ items, currently OK without virtualization)
- File history (can grow unbounded → virtualize when > 50)
- Admin analytics tables

---

## 5. Network Optimization

### 5.1 Request Optimization
- **Debounce search input:** 300ms (already implemented)
- **Cancel stale requests:** AbortController for search
- **Batch requests:** Promise.all for independent fetches
- **Cache responses:** React Query `staleTime`

### 5.2 React Query Configuration
```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Avoids refetch on tab switch
    },
  },
});
```

### 5.3 Image Optimization
- Lazy load images below fold (`loading="lazy"`)
- Responsive images (`srcset`, `sizes`)
- Placeholder/blur-up for preview images
- Canvas-generated thumbnails for PDFs

### 5.4 API Client Retry
```ts
const fetchWithRetry = async (input: RequestInfo, retries = 3, delay = 2000) => {
  try {
    return await fetch(input);
  } catch (error) {
    if (retries > 0 && error instanceof TypeError && error.message === 'Failed to fetch') {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(input, retries - 1, delay);
    }
    throw error;
  }
};
```

---

## 6. Animation Performance

### 6.1 GPU-Accelerated Properties
Only animate:
- `transform` (translate, scale, rotate)
- `opacity`

Never animate:
- `width`, `height` (use transform scale instead)
- `top`, `left` (use transform translate)
- `box-shadow` (use opacity fade)
- `background-color` (use opacity overlay)

### 6.2 Framer Motion Best Practices
```tsx
// ✅ Good — GPU accelerated
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.25 }}
/>

// ❌ Bad — triggers layout
<motion.div
  initial={{ marginTop: 20 }}
  animate={{ marginTop: 0 }}
/>
```

### 6.3 LazyMotion
Already enabled in `App.tsx`:
```tsx
<LazyMotion features={domAnimation}>
  {/* App content */}
</LazyMotion>
```
- Loads only used animation features
- Reduces bundle size

### 6.4 Reduced Motion
```tsx
const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: shouldReduceMotion ? 1 : undefined }}
  transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
/>
```

---

## 7. Bundle Optimization

### 7.1 Current Strategy
- **Vite 7** with tree-shaking
- **Code splitting** via React.lazy
- **LazyMotion** for Framer Motion
- **PWA plugin** for caching

### 7.2 Monitoring
```bash
# Analyze bundle size
npx vite-bundle-visualizer

# Check for duplicates
npx rollup-plugin-visualizer --dist
```

### 7.3 Common Bloat Sources
| Library | Issue | Mitigation |
|---------|-------|-----------|
| `framer-motion` | Large if full imports | Use `LazyMotion` + `domAnimation` |
| `pdfjs-dist` | Large worker | Lazy load, use external worker |
| `pdf-lib` | Moderate | Already tree-shakeable |
| `lucide-react` | Tree-shakeable ✅ | Import specific icons |
| `@tanstack/react-query` | Moderate | Already code-split |

### 7.4 Dynamic Imports
```tsx
// ✅ Load heavy library only when needed
const compressPdf = async (file: File) => {
  const { compress } = await import('@/utils/pdfCompressor');
  return compress(file);
};
```

---

## 8. Mock Mode Efficiency

Frontend can operate without backend. Mock mode must remain performant.

```ts
// apiMock uses setTimeout for simulated latency
await new Promise(resolve => setTimeout(resolve, 800));

// In production, this is bypassed
```

**Rules:**
- Mock mode must not block UI
- Health checks use exponential backoff (already implemented)
- Network status checked every 60s (acceptable)

---

## 9. Memory Management

### 9.1 Cleanup
```tsx
useEffect(() => {
  const controller = new AbortController();
  
  fetch(url, { signal: controller.signal })
    .then(/* ... */);
  
  return () => controller.abort(); // Cancel on unmount
}, [url]);
```

### 9.2 Object URLs
```tsx
// Create
const url = URL.createObjectURL(file);
// Revoke when done
useEffect(() => {
  return () => URL.revokeObjectURL(url);
}, [url]);
```

### 9.3 Large Lists
- Virtualize when > 50 items
- Use `useMemo` for sorted/filtered lists
- Debounce filter operations (300ms)

---

## 10. Service Worker (PWA)

### 10.1 Strategy
- **Cache-first:** Static assets (CSS, JS, fonts)
- **Network-first:** API calls
- **Stale-while-revalidate:** Images

### 10.2 Cache Limits
- Max 50MB cache size
- Oldest entries evicted first
- Versioned cache keys

---

## 11. Database Performance

### 11.1 Queries
- Use indexes on frequently queried columns (email, userId, status)
- Avoid N+1 queries
- Use Drizzle's `select` with specific columns
- Connection pooling configured

### 11.2 Migrations
- Run during low-traffic periods
- Zero-downtime migrations where possible
- Backup before migration

---

## 12. Monitoring

### 12.1 Frontend
```ts
// Performance observer
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // Send to analytics
      analytics.logEvent('performance', entry.name, {
        duration: entry.duration,
        startTime: entry.startTime,
      });
    }
  });
  observer.observe({ type: 'measure', buffered: true });
}
```

### 12.2 Backend
- Pino for structured logging
- Request duration tracking (via pino-http)
- Slow query logging (> 100ms)

---

## 13. Troubleshooting

### 13.1 Slow Initial Load
1. Check bundle size (`vite-bundle-visualizer`)
2. Enable route splitting
3. Lazy load heavy components
4. Optimize images

### 13.2 Janky Animations
1. Check DevTools Performance tab
2. Ensure only `transform`/`opacity` animated
3. Reduce motion complexity
4. Check for layout thrashing

### 13.3 Memory Leaks
1. Chrome DevTools → Memory → Heap snapshot
2. Check for uncleaned intervals/timeouts
3. Verify object URLs revoked
4. Check component unmount cleanup

### 13.4 Slow API Responses
1. Check database query plans (EXPLAIN ANALYZE)
2. Add missing indexes
3. Implement caching (Redis future)
4. Check N+1 patterns

---

## 14. Performance Budget

| Resource | Budget | Current (est.) |
|----------|--------|----------------|
| JS (gzipped) | < 300KB | ~250KB initial |
| CSS (gzipped) | < 50KB | ~30KB |
| Total HTML | < 10KB | ~5KB |
| Images (per page) | < 200KB | Varies |
| API response (JSON) | < 50KB | ~20KB |
| API response (files) | Per tier limit | 3–100MB |

---

## 15. CI/CD Performance Gates

```yaml
# Example GitHub Actions / CI
- name: Bundle Size Check
  run: |
    SIZE=$(gzip -c dist/index.html | wc -c)
    if [ $SIZE -gt 50000 ]; then
      echo "Bundle too large: ${SIZE} bytes"
      exit 1
    fi

- name: Lighthouse CI
  run: lhci autorun
```

---

## 16. Ongoing Optimization

| Task | Frequency | Owner |
|------|-----------|-------|
| Bundle size audit | Monthly | Frontend |
| Dependency update | Weekly | DevOps |
| Performance profiling | Per release | Frontend |
| Database query optimization | Quarterly | Backend |
| CDN cache review | Monthly | DevOps |
