# Razorpay Payment Integration — Full Audit Report

**Date:** July 1, 2026
**Audited By:** AI Agent
**Scope:** End-to-end payment flow, frontend to database

---

## Issue Status Legend

| Icon | Meaning |
|------|---------|
| ✅ **SOLVED** | Fix has been applied |
| ❌ **UNSOLVED** | Issue remains, requires action |
| ⚠️ **PARTIAL** | Mitigated but not fully resolved |

---

## 1. PAYMENT CONFIGURATION

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1.1 | `RAZORPAY_WEBHOOK_SECRET` missing from `.env.example` | **High** | ✅ **SOLVED** — Added to `.env.example` |
| 1.2 | `RAZORPAY_KEY_ID` hardcoded as fallback in `DevWorkspace.tsx` | Low | ❌ **UNSOLVED** — Test key `rzp_test_T85GDT2zbaoAAb` is hardcoded |
| 1.3 | `RAZORPAY_KEY_SECRET` never exposed to frontend | — | ✅ Verified secure |
| 1.4 | `VITE_RAZORPAY_KEY_ID` in `.env` exposed to frontend | — | ✅ Acceptable — Razorpay key_id is public by design |

---

## 2. DUPLICATE CODE & ROUTES

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 2.1 | Duplicate payment routes: `razorpay.ts` (no subscription) vs `subscriptions.ts` (with subscription) | **High** | ⚠️ **PARTIAL** — Added clarifying comment in `routes/index.ts:15`. Both routes still exist. |
| 2.2 | Duplicate webhook endpoints: `payments.ts` and `subscriptions.ts` both implement identical webhook logic | **Medium** | ❌ **UNSOLVED** — Two webhook handlers at different paths |
| 2.3 | Duplicate order creation: `payments.ts` and `subscriptions.ts` both implement `/order` | **Medium** | ❌ **UNSOLVED** — Two code paths for same operation |

---

## 3. SECURITY

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 3.1 | `local_` token backdoor in `auth.ts` grants elite premium to any request | **Medium** | ❌ **UNSOLVED** — `if (token.startsWith("local_"))` auto-grants `premiumTier: "elite"` |
| 3.2 | `PaymentService.verifySignature` auto-passes when mock mode is enabled | **Medium** | ❌ **UNSOLVED** — Returns `true` for any signature in mock mode |
| 3.3 | No idempotency key for order creation — double-click creates duplicate orders | **Medium** | ❌ **UNSOLVED** — No check for existing pending subscription |
| 3.4 | `CSRF_SECRET` defined in `.env` but never used | Low | ❌ **UNSOLVED** — Configured but not implemented |
| 3.5 | No nonce/timestamp in signature verification — replay attacks possible | Low | ❌ **UNSOLVED** — HMAC uses only `orderId|paymentId` |
| 3.6 | UPI payment endpoint is unauthenticated | **Medium** | ❌ **UNSOLVED** — `POST /upi-payment-verify` has no auth check |
| 3.7 | Webhook signature validation degrades to no-op if secret not set | **Medium** | ⚠️ **PARTIAL** — `.env.example` fixed, but production `.env` still needs the value |

---

## 4. DATABASE & SCHEMA

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 4.1 | Schema comment says `enterprise` but codebase uses `elite` | **High** | ✅ **SOLVED** — Updated `schema/index.ts:33` |
| 4.2 | No unique constraint on `razorpayOrderId` — duplicate pending subs possible | Low | ❌ **UNSOLVED** — DB allows multiple pending subs for same order ID |
| 4.3 | `pass_24h` and `pass_7d` plans not reflected in `PLAN_PRICES` on backend `subscriptions.ts` | Low | ❌ **UNSOLVED** — Only `basic`, `pro`, `elite` have prices; passes handled only on frontend |

---

## 5. LOGGING & DEBUG CODE

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 5.1 | `console.log` in `auth.ts` exposing auth headers | **High** | ✅ **SOLVED** — Removed |
| 5.2 | `console.log` in `useSubscription.ts` exposing API responses | **High** | ✅ **SOLVED** — Removed |
| 5.3 | `console.log` in `useIntelligentSearch.ts` | Low | ❌ **UNSOLVED** — Logs search analytics to console |

---

## 6. PAYMENT FLOW

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 6.1 | No `modal.ondismiss` in `CheckoutModal.tsx` — user gets no feedback if they close Razorpay popup | **Medium** | ❌ **UNSOLVED** — `DevWorkspace.tsx` has it, but CheckoutModal doesn't |
| 6.2 | No phone number prefill in Razorpay options | Low | ❌ **UNSOLVED** — Only name and email are prefilled |
| 6.3 | No Razorpay logo set in checkout options | Low | ❌ **UNSOLVED** — `image` option not configured |
| 6.4 | No in-modal retry button on payment failure | Low | ❌ **UNSOLVED** — User must close and re-open modal |

---

## 7. WEBHOOKS

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 7.1 | `payment.authorized` event not handled | Low | ❌ **UNSOLVED** — Only `order.paid` and `payment.captured` are processed |
| 7.2 | `payment.failed` event not handled | Low | ❌ **UNSOLVED** — Failed payments not reconciled via webhook |
| 7.3 | `refund.*` events not handled | Low | ❌ **UNSOLVED** — No refund reconciliation |

---

## 8. USER EXPERIENCE

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 8.1 | Inconsistent error response format — some endpoints return `{ error }`, others `{ success: false, error }` | Low | ❌ **UNSOLVED** |
| 8.2 | Magic number `3847` hardcoded as users-served count | Low | ❌ **UNSOLVED** — Used in `SubscriptionService` and `subscriptions.ts` |
| 8.3 | Testing period auto-grant (`isTestingPeriodActive()`) expired (May 2026) but still in code | Low | ❌ **UNSOLVED** — No longer active but dead code remains |

---

## Summary

| Category | Total Issues | Solved | Partial | Unsolved |
|----------|-------------|--------|---------|----------|
| Payment Configuration | 4 | 1 | 0 | 3 |
| Duplicate Code & Routes | 3 | 0 | 1 | 2 |
| Security | 7 | 0 | 1 | 6 |
| Database & Schema | 3 | 1 | 0 | 2 |
| Logging & Debug Code | 3 | 2 | 0 | 1 |
| Payment Flow | 4 | 0 | 0 | 4 |
| Webhooks | 3 | 0 | 0 | 3 |
| User Experience | 3 | 0 | 0 | 3 |
| **TOTAL** | **30** | **4** | **2** | **24** |

---

## Production Readiness: ⚠️ NOT READY

The core payment loop (create order → checkout → verify → activate) is **functionally working** and cryptographically sound. However, the following **must** be resolved before production:

1. Set `RAZORPAY_WEBHOOK_SECRET` in production `.env`
2. Disable or gate the `local_` token backdoor behind `NODE_ENV=development`
3. Add idempotency to order creation to prevent duplicate charges
4. Add rate limiting to the UPI payment endpoint
5. Add `modal.ondismiss` handler in `CheckoutModal.tsx` for cancelled payments
