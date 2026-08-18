# KVD — Kindred Vince Donations

> **Give with purpose. See the impact.**

KVD (Kindred Vince Donations) is a modern Kenya-focused charity and donation platform built to connect people with verified causes, transparent fundraising campaigns, volunteer opportunities, and measurable community impact.

The project is designed around a simple idea: **make giving feel trustworthy, clear, and meaningful.**

## 🌍 Live Website

**Frontend:** https://vince551.github.io/charity-donation/

## ✨ What the website offers

### ❤️ Discover verified campaigns

Browse community-focused fundraising campaigns across categories such as:

- Education
- Healthcare
- Food
- Environment

Campaign cards show the location, fundraising progress, target amount, supporters, category, verification status, and remaining campaign time.

### 🔎 Search & filter

Donors can search campaigns or filter them by cause category to quickly find initiatives that match what they care about.

### 💚 Transparent impact

KVD puts impact at the centre of the experience. The platform presents community metrics such as funds raised, donors, verified campaigns, impact delivery, students supported, families reached, community projects, and volunteer hours.

### 🤝 Volunteer opportunities

Giving is not limited to money. The website also highlights volunteer opportunities where people can contribute their time and skills to community projects.

### 🏢 Organization campaigns

Organizations can apply to be verified and launch fundraising campaigns designed around transparency and measurable outcomes.

### 🌙 Light & dark mode

KVD includes a responsive light/dark theme with the user's preference saved locally for a smoother experience.

### 💳 M-Pesa-ready donation experience

The donation interface is designed for Kenya and is prepared for a secure M-Pesa payment flow. The current frontend is a preview and does **not** process real payments yet.

The future payment flow will use server-side verification so a donation is not shown as successful until the transaction has been verified.

> **Security:** Never enter an M-Pesa PIN into the website and never commit payment credentials or production secrets to GitHub.

## 👥 Platform roles

KVD is planned around four main roles:

| Role | Purpose |
| --- | --- |
| **Donor** | Discover causes, donate, and follow impact |
| **Charity / Organization** | Manage verification and fundraising campaigns |
| **Volunteer** | Discover and apply for volunteer opportunities |
| **Administrator** | Verify organizations, moderate campaigns, and monitor platform activity |

## 🖥️ Current frontend

The current website is a polished React/Vite experience focused on the public-facing donation journey.

It includes:

- Responsive navigation
- Hero section and platform statistics
- Verified campaign cards
- Campaign search
- Category filtering
- Donation modal
- Donation amount selection
- Impact dashboard-style section
- Volunteer section
- Organization call-to-action
- Authentication entry points
- Light/dark theme
- Responsive mobile navigation
- Kenya-focused KES currency formatting

The current campaign content is frontend demonstration data while the platform backend is being developed.

## 🛠️ Technology

### Frontend

- **React**
- **Vite**
- **React Router**
- **Lucide React** for interface icons
- **Recharts** for data visualization
- Modern responsive CSS

### Backend foundation

- **Node.js**
- **Express**
- **PostgreSQL**
- **JWT** authentication
- **bcryptjs** password hashing
- **Zod** validation
- **Helmet** security headers
- **CORS**

### Planned integrations

- Safaricom **M-Pesa Daraja API**
- Cloudinary media storage
- Secure donation verification
- Receipt generation
- Campaign notifications

## 🚀 Run locally

### 1. Clone the repository

```bash
git clone https://github.com/vince551/charity-donation.git
cd charity-donation
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the required backend values, including your PostgreSQL connection and JWT secret.

### 4. Start the development environment

```bash
npm run dev
```

The Vite frontend runs on port **5173** and the Express API runs on port **4000**.

### 5. Build the frontend

```bash
npm run build
```

## 🔌 Backend API foundation

The backend already provides the foundation for:

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

The public website is currently being polished independently from the full production payment and platform workflow.

## 🗺️ Roadmap

KVD is being developed in stages:

- [x] Modern public-facing donation website
- [x] Responsive campaign discovery
- [x] Search and campaign filtering
- [x] Impact-focused interface
- [x] Volunteer section
- [x] Light/dark mode
- [x] Donation experience UI
- [x] Backend API foundation
- [ ] Real authentication flow
- [ ] PostgreSQL production integration
- [ ] M-Pesa Daraja STK Push
- [ ] Server-side M-Pesa callback verification
- [ ] Donor dashboard
- [ ] Charity dashboard
- [ ] Volunteer dashboard
- [ ] Administrator dashboard
- [ ] Organization verification workflow
- [ ] Donation receipts
- [ ] Campaign updates and notifications
- [ ] Cloudinary campaign media uploads
- [ ] Fraud monitoring and audit trails
- [ ] PWA support and push notifications
- [ ] AI-powered campaign discovery and impact summaries

## 🔐 Security principles

KVD is intended to handle donations responsibly. Production development will prioritize:

- Server-side payment verification
- Password hashing
- JWT-based authentication
- Input validation
- Secure HTTP headers
- CORS controls
- Environment-based secrets
- Audit trails for sensitive actions
- Never exposing M-Pesa PINs or API secrets to the frontend

## 📁 Project structure

```text
charity-donation/
├── src/                 # React frontend
│   ├── auth/            # Authentication UI
│   ├── pages/           # Application pages
│   ├── assets/          # Frontend assets
│   └── *.css            # UI styling and themes
├── server/              # Express backend
├── public/              # Public frontend assets
├── index.html           # Vite entry HTML
├── package.json         # Project configuration
├── vite.config.js       # Vite configuration
└── .env.example         # Environment variable template
```

## 🎯 Project vision

KVD is more than a donation form. The long-term goal is to build a trusted digital space where:

**People can discover real causes → give securely → see where support goes → measure the impact.**

The platform is being built with a Kenya-first approach while keeping the architecture flexible enough to support wider communities in the future.

## 👨‍💻 Developer

Built by **Vincent Odhiambo (Vince)**.

If you find the project useful, consider giving the repository a ⭐ and following the development journey.

## 📄 License

This project is currently under active development. Licensing terms will be finalized as the project moves toward production.
