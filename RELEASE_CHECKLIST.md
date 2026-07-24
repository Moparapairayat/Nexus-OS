# NexusOS Production Deployment & Release Checklist

This document provides a step-by-step checklist for deploying **NexusOS** to production on **Vercel** with **Supabase**.

---

## 🔑 1. Environment Variables Configuration

Ensure the following environment variables are set in the Vercel Production Dashboard:

```env
# APP CONFIGURATION
NEXT_PUBLIC_APP_URL=https://your-domain.com

# SUPABASE CONFIGURATION
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# UDDOKTAPAY PAYMENT GATEWAY (BANGLADESH)
UDDOKTAPAY_STORE_ID=your-store-id
UDDOKTAPAY_API_KEY=your-api-key
UDDOKTAPAY_API_URL=https://uddoktapay.com/api/v2
UDDOKTAPAY_WEBHOOK_SECRET=your-webhook-secret

# TRANSACTIONAL EMAIL (RESEND)
RESEND_API_KEY=re_your_api_key
RESEND_SENDER_EMAIL=noreply@your-domain.com
```

---

## 🗄️ 2. Supabase Database & Security Verification

- [x] Run all database migrations up to `20260722000015_phase21_performance_optimization.sql`.
- [x] Verify Row-Level Security (RLS) policies are active on `profiles`, `clients`, `services`, `invoices`, `payments`, `support_tickets`, `vault_files`, `workflows`, `security_events`, and `system_settings`.
- [x] Confirm composite database indexes are created for query acceleration.

---

## 💳 3. UddoktaPay Gateway Setup

- [x] Set Webhook URL in UddoktaPay Dashboard: `https://your-domain.com/api/payments/uddoktapay/webhook`.
- [x] Verify IPN (Instant Payment Notification) callback route: `https://your-domain.com/api/payments/uddoktapay/callback`.
- [x] Test live payment verification via UddoktaPay sandbox and production endpoints.

---

## 🔒 4. Security & Production Build Validation

- [x] Run `npx tsc --noEmit --skipLibCheck` — ensure **0 compilation errors**.
- [x] Run `npm run build` — confirm clean Next.js bundle generation.
- [x] Verify HTTP Security Headers (`X-Frame-Options`, `Strict-Transport-Security`, `Permissions-Policy`).
- [x] Verify private `/admin` and `/client` routes are disallowed in `robots.txt`.
