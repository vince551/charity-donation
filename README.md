# KVD — Kindred Vince Donations

KVD is a portfolio-grade charity and donation platform for discovering verified causes, donating securely, volunteering, managing campaigns and measuring impact.

## Stack

- React + Vite
- Express.js REST API
- PostgreSQL schema
- Zod validation
- Helmet + CORS + Morgan
- Recharts analytics
- Lucide icons
- Environment-based payment configuration

## Product areas

- Campaign discovery, search and filters
- Donor, charity and volunteer workspaces
- Admin/verification-ready architecture
- Impact analytics
- Donation receipt/data model
- Notifications and audit logs
- M-Pesa-ready payment abstraction
- Responsive mobile-first UI
- Dark mode

## M-Pesa safety

The repository deliberately contains no live payment credentials or personal payment details. Configure the M-Pesa recipient and Daraja credentials through deployment environment variables. The current UI supports manual payment mode; STK Push should only be enabled after server-side Daraja credentials and callback verification are configured.

## Run locally

```bash
npm install
npm run dev
```

API:

```bash
npm run server
```

Copy `.env.example` to `.env` and fill in deployment-specific values. Never commit `.env`.

## Database

`server/db/schema.sql` defines users, organizations, campaigns, donations, receipts, volunteer workflows, notifications and audit logs.

## Roadmap

The architecture is prepared for authentication/RBAC, verified organizations, secure payment callbacks, receipts, volunteer approvals, notifications, analytics, audit logs, AI recommendations and PWA enhancements.
