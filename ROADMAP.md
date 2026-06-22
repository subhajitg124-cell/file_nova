# FileNova — Roadmap

**Purpose:** Strategic direction and planned features for FileNova.

---

## 1. Vision

FileNova is building the **definitive document productivity platform for India** — fast, private, affordable, and built for the specific needs of students, CSC operators, and cyber cafes.

---

## 2. Current Status (June 2025)

### 2.1 Completed
- ✅ 30+ document tools (PDF, Image, Office, OCR, AI)
- ✅ React frontend with Wouter routing and code splitting
- ✅ Express backend with upload/process/download pipeline
- ✅ Session authentication + Google OAuth
- ✅ Database schema (11 tables, Drizzle ORM)
- ✅ Theme system (dark/light)
- ✅ i18n (15+ Indian languages)
- ✅ AI Assistant (Gemini + Anthropic)
- ✅ Search engine (Trie + Fuzzy + Ranking)
- ✅ Pricing (Free, Basic, Pro, Elite) with Razorpay + UPI
- ✅ Admin dashboard
- ✅ Referral system
- ✅ PWA setup
- ✅ Offline support

### 2.2 In Progress
- 🔄 Improving mock mode reliability
- 🔄 Complete i18n coverage
- 🔄 Bug fixes and polish

---

## 3. Roadmap Phases

### Phase 1: Foundation (Completed)
**Goal:** MVP with core document tools

- [x] Upload + process + download pipeline
- [x] PDF tools (merge, split, compress, rotate, OCR)
- [x] Image tools (resize, compress, remove bg)
- [x] Office conversion (Word → PDF, etc.)
- [x] Basic auth (email + password)
- [x] Theme system
- [x] Pricing tiers

### Phase 2: Intelligence (Current — Q3 2025)
**Goal:** AI-powered experience

- [x] AI Assistant (general helpdesk)
- [x] AI PDF Summary
- [x] AI Background Remover
- [x] Context-aware Smart Assistant
- [ ] Document Q&A (upload PDF, ask questions)
- [ ] Smart crop/rotate suggestions
- [ ] Auto-document classification
- [ ] AI-powered form filling

### Phase 3: India-Specific (Q4 2025)
**Goal:** Deep India integration

- [x] Aadhaar masking
- [x] PAN card photo resize
- [x] Scholarship ZIP maker
- [ ] DigiLocker integration (fetch documents)
- [ ] Direct government portal upload
- [ ]印度 postal service integrations
- [ ] UPI autopay for subscriptions
- [ ] Regional language OCR (Hindi, Bengali, etc.)

### Phase 4: Collaboration (Q1 2026)
**Goal:** Team and cafe features

- [ ] CSC operator bulk mode with queue
- [ ] Team workspaces (shared folders)
- [ ] Real-time collaboration (WebRTC)
- [ ] Branding for cyber cafes (logo overlay)
- [ ] Usage analytics dashboard for operators
- [ ] Client management for operators

### Phase 5: Ecosystem (Q2 2026)
**Goal:** Platform and integrations

- [ ] REST API for developers
- [ ] Browser extension (right-click processing)
- [ ] WhatsApp Business API integration
- [ ] Telegram bot
- [ ] Google Drive / OneDrive sync
- [ ] Zapier/Make.com integrations
- [ ] Webhook support

### Phase 6: Scale (Q3–Q4 2026)
**Goal:** Enterprise and global

- [ ] Enterprise SSO (SAML, OAuth)
- [ ] Admin audit logs
- [ ] Advanced analytics
- [ ] Custom SLA tiers
- [ ] Regional data centers
- [ ] On-premise deployment option

---

## 4. Feature Backlog

### 4.1 High Priority
| Feature | Description | Priority |
|---------|-------------|----------|
| Persistent job storage | Replace in-memory Map with DB/Redis | P0 |
| Auto file cleanup | Cron job for temp files | P0 |
| Complete i18n | All strings translatable | P1 |
| Error boundaries | Wrap all lazy routes | P1 |
| Virtualized lists | For file history, admin tables | P1 |
| Offline queue | Upload when offline, sync later | P2 |

### 4.2 Medium Priority
| Feature | Description | Priority |
|---------|-------------|----------|
| Document scanner | Camera + OCR pipeline | P2 |
| Voice control | Web Speech API integration | P2 |
| QR code generation | For document sharing | P2 |
| Batch rename | History management | P3 |
| Usage heatmap | Dashboard visualization | P3 |
| Keyboard shortcuts | Full keyboard navigation | P3 |

### 4.3 Low Priority
| Feature | Description | Priority |
|---------|-------------|----------|
| Dark mode animation | Splash screen | P4 |
| Sound effects | Optional audio feedback | P4 |
| Tool templates | Save common configurations | P4 |
| Custom branding | White-label for enterprises | P4 |
| API access | Public REST API | P4 |

---

## 5. Technical Debt

### 5.1 High Impact
| Debt | Effort | Impact |
|------|--------|--------|
| In-memory job Map | Medium | High |
| Split apiV1.ts | Medium | Medium |
| Duplicate search code | Low | Medium |
| Replace hardcoded admin check | Low | Medium |

### 5.2 Medium Priority
| Debt | Effort | Impact |
|------|--------|--------|
| App.tsx too large (703 lines) | High | Medium |
| CSS custom properties not standardized | Medium | Low |
| Zod v3/v4 mixed imports | Low | Low |
| Legacy Flask backend | Low | Low |

---

## 6. Infrastructure Roadmap

### 6.1 Current
- Frontend: Vercel
- Backend: Railway
- Database: PostgreSQL (Railway managed)
- Storage: Local temp + future S3

### 6.2 Planned
- CDN for static assets
- Redis for job queue and caching
- S3-compatible storage for uploaded files
- Load balancer for multi-instance backend
- Monitoring (Sentry, Datadog, or equivalent)
- CI/CD (GitHub Actions)

---

## 7. Business Milestones

| Milestone | Target | Metrics |
|-----------|--------|---------|
| 1,000 users | Q3 2025 | Signups, active users |
| 10,000 files processed | Q3 2025 | Total processing count |
| 100 paying customers | Q4 2025 | Revenue, MRR |
| CSC partnership | Q4 2025 | Signed agreements |
| 50,000 users | Q1 2026 | Growth rate |
| Profitability | Q2 2026 | Revenue > costs |

---

## 8. Platform Evolution

### 8.1 Short-term (3 months)
- Bug fixes and polish
- Complete i18n coverage
- Improve AI assistant quality
- Performance optimization
- Better error handling

### 8.2 Medium-term (6 months)
- India-specific integrations
- CSC operator features
- Enhanced AI capabilities
- Mobile app (React Native or PWA)
- Community features (shared workflows)

### 8.3 Long-term (12 months)
- Enterprise tier
- API platform
- Global expansion (starting with Nepal, Bangladesh)
- Browser extension
- Advanced AI (document understanding, automation)

---

## 9. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Backend costs scale poorly | Medium | High | Redis caching, efficient processing |
| Competitor copycats | High | Medium | Speed, India focus, brand |
| Payment failures | Low | High | Multiple payment methods, monitoring |
| Data breach | Low | Critical | Security audits, encryption |
| Team burnout | Medium | High | Sustainable pace, clear priorities |

---

## 10. Success Metrics

### 10.1 Product
- Daily active users (DAU)
- Monthly active users (MAU)
- Files processed per day
- Average session duration
- Tool usage distribution

### 10.2 Technical
- Uptime: > 99.5%
- API response time: p95 < 500ms
- Page load: LCP < 2.5s
- Error rate: < 0.1%
- Bundle size: < 300KB initial

### 10.3 Business
- Monthly recurring revenue (MRR)
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- Churn rate
- Net promoter score (NPS)

---

**Last Updated:** 2025-06-22  
**Next Review:** 2025-07-22
