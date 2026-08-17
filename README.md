# KVD — Kindred Vince Donations

KVD is a Kenya-focused charity and donation platform designed around **trust, transparent fundraising and measurable community impact**.

## Stack

- React + Vite
- React Router
- Node.js + Express
- PostgreSQL
- JWT + bcryptjs
- Zod validation
- Helmet + CORS
- Recharts
- M-Pesa-ready payment abstraction
- Cloudinary-ready media storage

## Product roles

- **Donor** — discover causes, donate, track receipts and impact
- **Charity** — manage organization verification, campaigns and volunteers
- **Volunteer** — discover and apply for opportunities
- **Administrator** — verify organizations, moderate campaigns and monitor platform activity

## Core API

```text
GET  /api/health
GET  /api/config/public
GET  /api/campaigns
GET  /api/campaigns/:id
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/donations
GET  /api/donations
```

## Local development

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Set `DATABASE_URL` and a strong `JWT_SECRET`.
4. Apply `server/db/schema.sql` to PostgreSQL.
5. Install dependencies with `npm install`.
6. Run `npm run dev`.

The Vite client runs on port 5173 and the Express API on port 4000.

## M-Pesa

KVD supports a manual M-Pesa workflow now and is structured for Safaricom Daraja STK Push integration. **Never commit Daraja credentials, M-Pesa PINs, or production secrets to GitHub.** Configure them through deployment environment variables.

The donation API intentionally keeps payments in a `pending` state until server-side transaction verification succeeds. This prevents the frontend from falsely marking an unverified payment as successful.

## Production roadmap

- Daraja STK Push + callback verification
- Receipt PDF generation
- Full donor/charity/volunteer/admin dashboards
- Campaign updates and notifications
- Organization document verification
- Fraud monitoring and audit trails
- Cloudinary image uploads
- PWA installation and push notifications
- AI campaign discovery and impact summaries

## Brand

**KVD — Kindred Vince Donations**

> Give with purpose. See the impact.
