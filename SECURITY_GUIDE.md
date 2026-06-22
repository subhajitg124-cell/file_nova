# FileNova — Security Guide

**Purpose:** Security policies, best practices, and compliance requirements.

---

## 1. Security Philosophy

FileNova handles sensitive user documents and payment information. Security is not optional — it's foundational.

**Principles:**
1. **Never trust client input** — validate everything server-side
2. **Defense in depth** — multiple layers of protection
3. **Least privilege** — minimal permissions for all operations
4. **Fail securely** — errors should not leak information
5. **Security by default** — safe defaults, opt-in for risky features

---

## 2. Threat Model

### 2.1 Assets to Protect
| Asset | Sensitivity | Protection Required |
|-------|------------|---------------------|
| User documents (uploaded files) | High | Encryption, TTL, secure deletion |
| User accounts (credentials) | High | Bcrypt hashing, HTTPS only |
| Session tokens | High | HTTP-only, Secure, SameSite |
| Payment info | Critical | Razorpay handling only, no storage |
| Personal data (email, phone) | Medium | GDPR/privacy compliant |
| Admin credentials | Critical | Password + 2FA recommended |

### 2.2 Threat Actors
- **Script kiddies:** Automated attacks on upload endpoints
- **Competitors:** Scraping tools/content
- **Malicious users:** Path traversal, XSS, CSRF
- **Insiders:** Admin abuse (mitigated by audit logs)
- **Nation-state:** Low probability, high impact (not primary concern)

---

## 3. Authentication & Authorization

### 3.1 Session Management
```ts
// ✅ Secure session token generation
const token = crypto.randomBytes(32).toString('hex');

// ✅ HTTP-only cookie (prevents XSS theft)
res.cookie('session_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
});
```

### 3.2 Password Handling
```ts
// ✅ Bcrypt with salt rounds
const hash = await bcrypt.hash(password, 12);

// ✅ Verification
const isValid = await bcrypt.compare(password, hash);
```

### 3.3 Role-Based Access
| Role | Permissions |
|------|------------|
| `user` | Own files, own history |
| `operator` | Process files for assigned cafe |
| `admin` | User management, analytics, coupons |
| `super_admin` | Full access |

### 3.4 Google OAuth
- Token verified server-side (never trust client)
- `google-auth-library` for ID token validation
- Link Google account to existing user or create new

### 3.5 Rate Limiting on Auth
```ts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per 15 minutes
  message: { detail: 'Too many attempts. Try again later.' },
});
```

---

## 4. File Upload Security

### 4.1 Validation Checklist
- [ ] MIME type validated (not just extension)
- [ ] File size enforced per tier
- [ ] Filename sanitized (no `../`, no null bytes)
- [ ] File content inspected (magic bytes check for critical types)
- [ ] Duplicate upload detection (optional)

### 4.2 Filename Sanitization
```ts
// ✅ Strip path and dangerous characters
const safeName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_');

// ❌ Never use original filename directly
// ❌ Never allow: ../, null bytes, shell metacharacters
```

### 4.3 Storage
- Temp files in OS temp directory with restricted permissions
- No user-controlled paths
- Automatic cleanup after TTL (configurable, default 60 min)
- Preview files served with path traversal protection

### 4.4 Preview Endpoint Security
```ts
router.get('/preview/:filename', (req, res) => {
  const filename = req.params.filename;
  
  // ✅ Path traversal protection
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  
  const filePath = path.join(uploadDir, filename);
  // Validate file exists and is within uploadDir
  res.sendFile(filePath);
});
```

---

## 5. API Security

### 5.1 CORS
```ts
app.use(cors({
  origin: ['https://filenova.in', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
```

### 5.2 Helmet Headers
```ts
app.use(helmet());
// Sets:
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY
// - X-XSS-Protection: 1; mode=block
// - Strict-Transport-Security (in production)
// - and more
```

### 5.3 Rate Limiting
| Endpoint | Limit | Window |
|----------|-------|--------|
| Global API | 100 req | 15 min |
| Upload | 100 req | 15 min |
| AI Chat | 20 req | 15 min |
| Auth | 10 req | 15 min |

### 5.4 Input Validation
- **Zod schemas** for all request bodies
- Validate on both client AND server
- Never trust client-side validation alone

```ts
const fileValidator = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  mimetype: z.string().refine(val => allowedMimeTypes.includes(val)),
  size: z.number().max(100 * 1024 * 1024),
});
```

---

## 6. Data Protection

### 6.1 Data Classification
| Type | Classification | Retention |
|------|---------------|-----------|
| Uploaded files | Sensitive | Auto-delete after 60 min |
| User profiles | Personal | Until account deletion |
| Session tokens | Sensitive | 30 days then deleted |
| Analytics events | Internal | 90 days |
| File history | Personal | Until account deletion |

### 6.2 Privacy Mode
Users can enable `privacyMode`:
- No file history logged
- No analytics tracked
- No recommendations based on usage

### 6.3 Data Deletion
- File deletion on user request (immediate)
- Account deletion cascades to all related records
- GDPR right to erasure supported

---

## 7. Payment Security

### 7.1 Razorpay
- Never store card details (Razorpay handles PCI compliance)
- Verify payment signature server-side
- Webhook endpoint validates Razorpay signature

### 7.2 UPI
- QR code generated dynamically per transaction
- UPI ID validated format
- No sensitive data in QR payload

### 7.3 Coupons
- Admin-generated, stored hashed (if sensitive)
- Single-use enforcement
- Expiry validation

---

## 8. XSS Prevention

### 8.1 Frontend
- React auto-escapes JSX
- No `dangerouslySetInnerHTML` without sanitization
- User content never injected as HTML

### 8.2 If HTML Rendering Required
```tsx
// Use DOMPurify
import DOMPurify from 'dompurify';

<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userHtml) 
}} />
```

---

## 9. CSRF Protection

### 9.1 Measures
- `SameSite: 'lax'` cookies
- CSRF secret in `CSRF_SECRET` env var
- Origin header validation (where applicable)
- Double-submit cookie pattern (future)

### 9.2 State-Changing Requests
```ts
// Verify Origin header for mutations
if (req.method !== 'GET') {
  const origin = req.headers.origin;
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }
}
```

---

## 10. Secrets Management

### 10.1 Environment Variables
```bash
# .env (never commit)
DATABASE_URL=postgres://...
SESSION_SECRET=...
CSRF_SECRET=...
RAZORPAY_KEY_SECRET=...
GEMINI_API_KEY=...
```

### 10.2 Rules
- ✅ Use env vars for all secrets
- ✅ Rotate secrets periodically
- ✅ Different secrets per environment
- ✅ `.env` in `.gitignore`
- ❌ Never commit `.env`
- ❌ Never log secrets
- ❌ Never expose secrets to client (except Razorpay key ID which is public)

### 10.3 Git Secrets
- Pre-commit hooks scan for secrets
- `git-secrets` or similar tool recommended
- Rotate immediately if leaked

---

## 11. Headers & Security Policy

### 11.1 Content Security Policy (Future)
```ts
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"], // React needs unsafe-inline
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.filenova.in"],
  },
}));
```

### 11.2 Referrer Policy
```ts
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));
```

---

## 12. Audit Logging

### 12.1 Events to Log
- Authentication (success/failure)
- File upload/delete
- Payment events
- Admin actions
- API errors (5xx)
- Rate limit hits

### 12.2 Log Format (Pino)
```ts
{
  level: 'info',
  msg: 'User login',
  userId: 'uuid',
  ip: 'obfuscated',
  userAgent: 'truncated',
  timestamp: 'ISO8601'
}
```

---

## 13. Incident Response

### 13.1 Breach Scenario
1. Identify scope (what data, how many users)
2. Contain (disable affected accounts, rotate tokens)
3. Notify (users, platform if required)
4. Remediate (patch vulnerability)
5. Review (post-mortem)

### 13.2 Contact
- Security issues: security@filenova.in
- Bug bounty: Not yet established

---

## 14. Compliance

### 14.1 India
- DPDP Act: Data protection framework
- UPI compliance: Razorpay handles PCI
- GST: Invoicing for paid tiers

### 14.2 Global
- GDPR: For EU users (data export, deletion)
- CCPA: For California users
- WCAG 2.1 AA: Accessibility

---

## 15. Security Checklist

### Before Every Deployment
- [ ] `pnpm audit` run and advisories addressed
- [ ] No secrets in git history
- [ ] Helmet enabled
- [ ] CORS restricted to known origins
- [ ] Rate limiters active
- [ ] Input validation (Zod) on all endpoints
- [ ] File upload security checks
- [ ] Authentication middleware on protected routes
- [ ] Password hashing uses bcrypt (not plain/md5/sha1)
- [ ] Session cookies HTTP-only + Secure
- [ ] HTTPS enforced (production)

### Regular Reviews
- [ ] Monthly dependency audit
- [ ] Quarterly penetration test (recommended)
- [ ] Annual security review
- [ ] Secret rotation every 90 days
