# FileNova — Release Checklist

**Purpose:** Complete production deployment checklist.

---

## 1. Pre-Deployment

### 1.1 Code Quality
- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm build` succeeds (frontend + backend)
- [ ] No `console.log`, `console.warn`, `console.error` in production code
- [ ] No `debugger` statements
- [ ] No commented-out code
- [ ] No `TODO`, `FIXME`, `HACK` comments left behind
- [ ] No unused imports
- [ ] No unused variables
- [ ] No `any` types without justification
- [ ] No `@ts-ignore` without explanatory comment

### 1.2 Environment Variables
- [ ] `DATABASE_URL` set (production PostgreSQL)
- [ ] `SESSION_SECRET` set (strong random value)
- [ ] `CSRF_SECRET` set (strong random value)
- [ ] `VITE_GOOGLE_CLIENT_ID` set
- [ ] `VITE_API_URL` set (Express server URL)
- [ ] `RAZORPAY_KEY_ID` set
- [ ] `RAZORPAY_KEY_SECRET` set
- [ ] `GEMINI_API_KEY` set
- [ ] `ANTHROPIC_API_KEY` set (if using Claude)
- [ ] `NODE_ENV=production`
- [ ] No `.env` file committed to git

### 1.3 Dependencies
- [ ] `pnpm-lock.yaml` is up to date
- [ ] No security advisories in dependencies (`pnpm audit`)
- [ ] Production dependencies minimized
- [ ] Dev dependencies excluded from build

### 1.4 Database
- [ ] All migrations applied (`pnpm init-db`)
- [ ] Connection pooling configured
- [ ] Backups scheduled
- [ ] SSL connection enabled
- [ ] Read replicas configured (if applicable)

### 1.5 Assets
- [ ] `public/manifest.json` updated
- [ ] Favicons present (`favicon.ico`, `apple-touch-icon.png`, etc.)
- [ ] Open Graph image accessible (`/og-image.png`)
- [ ] All images optimized (WebP + fallbacks)

---

## 2. Frontend Build

### 2.1 Build Output
- [ ] `artifacts/file-nova/dist/` generated
- [ ] `index.html` present in dist
- [ ] CSS files bundled and minified
- [ ] JS files chunked correctly
- [ ] Source maps generated (for error tracking)
- [ ] Assets hashed for cache busting

### 2.2 Vercel Configuration
If deploying to Vercel:
- [ ] `vercel.json` includes correct rewrites
- [ ] API routes proxy to Express server
- [ ] SPA fallback configured

```json
// vercel.json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" },
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### 2.3 PWA
- [ ] Manifest serves with correct MIME type
- [ ] Service worker registered
- [ ] Offline fallback page works
- [ ] Install prompt triggered

---

## 3. Backend Build

### 3.1 Build Output
- [ ] `artifacts/api-server/dist/` generated
- [ ] `index.mjs` is entry point
- [ ] Source maps included
- [ ] esbuild bundle is single file

### 3.2 Runtime Configuration
- [ ] `PORT` set (default 3000 or platform default)
- [ ] `DATABASE_URL` accessible
- [ ] Upload directory (`/tmp/file-nova-uploads`) writable
- [ ] System dependencies installed (LibreOffice, FFmpeg, Ghostscript)

### 3.3 Health Checks
- [ ] `/api/healthz` returns 200
- [ ] Database connection healthy
- [ ] Storage accessible
- [ ] CORS allows only production origins

### 3.4 Express Production Config
- [ ] `app.use(express.static(publicDir))` serves frontend
- [ ] SPA fallback for non-API routes
- [ ] Trust proxy set (if behind load balancer)
- [ ] Body size limits configured

---

## 4. Security Review

### 4.1 Headers
- [ ] `Helmet` middleware active
- [ ] `X-Frame-Options: DENY` or `SAMEORIGIN`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Strict-Transport-Security` enabled
- [ ] `Referrer-Policy` set
- [ ] `Permissions-Policy` restricted

### 4.2 Authentication
- [ ] Session cookies: `httpOnly`, `secure`, `sameSite: 'lax'`
- [ ] Session expiry enforced (30 days)
- [ ] Token rotation on login (optional)
- [ ] Password hashing uses bcrypt (not plain sha)
- [ ] Google OAuth tokens verified server-side

### 4.3 Rate Limiting
- [ ] Global API rate limit active
- [ ] Upload rate limit per IP
- [ ] AI endpoint rate limit (expensive)
- [ ] Payment endpoints protected

### 4.4 Input Validation
- [ ] Zod schemas validate all API inputs
- [ ] File MIME types checked server-side
- [ ] File sizes enforced
- [ ] Filenames sanitized (no path traversal)
- [ ] HTML escaped in responses

### 4.5 Secrets
- [ ] No secrets in git history
- [ ] No secrets in build output
- [ ] Environment variables injected at runtime
- [ ] `.env` in `.gitignore`

---

## 5. Functional Verification

### 5.1 End-to-End Smoke Test
- [ ] Homepage loads in < 3s
- [ ] Search works (typing + selecting)
- [ ] Upload + compress PDF works
- [ ] Merge 3 PDFs works
- [ ] PDF → Word conversion works
- [ ] Image compress works
- [ ] Download delivers correct file
- [ ] Sign up + login works
- [ ] Dashboard loads after login
- [ ] Pricing page renders
- [ ] Payment flow initiates
- [ ] Admin panel accessible (if admin)

### 5.2 Mobile
- [ ] iPhone Safari works
- [ ] Android Chrome works
- [ ] Upload works (mobile Safari)
- [ ] PWA install prompt appears

---

## 6. SEO Verification

### 6.1 Meta Tags
- [ ] Unique `<title>` per page (50–60 chars)
- [ ] Meta description per page (150–160 chars)
- [ ] Canonical URL set
- [ ] Open Graph tags present
- [ ] Twitter Card tags present

### 6.2 Structured Data
- [ ] `SoftwareApplication` schema on tool pages
- [ ] `HowTo` schema on tools with steps
- [ ] `FAQPage` schema on tools with FAQs
- [ ] Schema validates in Rich Results Test

### 6.3 Crawlability
- [ ] `robots.txt` allows crawling
- [ ] `sitemap.xml` generates dynamically
- [ ] No `noindex` on public pages
- [ ] Internal links work

### 6.4 Performance (SEO Factor)
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Mobile-friendly test passes

---

## 7. Monitoring Setup

### 7.1 Logging
- [ ] Pino logger configured
- [ ] Log level appropriate (`info` production, `debug` dev)
- [ ] Error stack traces captured
- [ ] Request IDs for tracing

### 7.2 Error Tracking
- [ ] Sentry (or equivalent) configured
- [ ] Frontend errors reported
- [ ] Backend errors reported
- [ ] Source maps uploaded

### 7.3 Analytics
- [ ] Google Analytics (if used)
- [ ] Custom analytics events firing
- [ ] Privacy-compliant (consent if required)

### 7.4 Uptime
- [ ] Health check endpoint monitored
- [ ] Uptime monitoring configured (UptimeRobot, etc.)
- [ ] Alerting configured (email, Slack)

---

## 8. Deployment Steps

### 8.1 Frontend (Vercel)
```bash
# Push to main branch triggers Vercel deployment
git push origin main

# Or manual deploy
vercel --prod
```

### 8.2 Backend (Railway)
```bash
# Push to main branch triggers Railway deployment
git push origin main

# Or use Railway CLI
railway up
```

### 8.3 Database
```bash
# Run migrations
pnpm init-db

# Verify tables created
psql $DATABASE_URL -c "\dt"
```

### 8.4 Post-Deploy
- [ ] Health check returns 200
- [ ] Frontend accessible
- [ ] API endpoints responding
- [ ] SSL certificate valid
- [ ] CDN caches purged (if applicable)

---

## 9. Rollback Plan

### 9.1 Frontend
- Vercel: Rollback to previous deployment via dashboard
- Railway: Rollback to previous deployment

### 9.2 Database
- Backup before migration
- Rollback migration if needed

### 9.3 Monitoring
- Watch error rates for 30 minutes post-deploy
- Monitor response times
- Check crash reports

---

## 10. Post-Deployment

### 10.1 Immediate (0–15 min)
- [ ] Smoke tests pass
- [ ] No 500 errors in logs
- [ ] Health check green
- [ ] SSL valid

### 10.2 Short-term (15–60 min)
- [ ] Core user flows work
- [ ] Payments process correctly
- [ ] Emails deliver
- [ ] File uploads work

### 10.3 Ongoing (24h)
- [ ] Error rate normal
- [ ] Response times stable
- [ ] No unexpected logs
- [ ] User feedback monitored

---

## 11. Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| QA | | | |
| Security | | | |
| Tech Lead | | | |

---

## 12. Common Issues

### 12.1 Build Failures
- Check Node version matches (Node 20+)
- Clear `node_modules` and reinstall
- Verify `pnpm-lock.yaml` not corrupted

### 12.2 Database Issues
- Check connection string format
- Verify PostgreSQL is running
- Check SSL requirements (production)
- Review migration conflicts

### 12.3 CORS Errors
- Verify `CORS_ORIGIN` includes production domain
- Check `credentials: true` matches cookie config
- Ensure no double CORS middleware

### 12.4 Upload Failures
- Check Multer temp directory permissions
- Verify disk space
- Check file size limits
- Review antivirus scanning (if enabled)
