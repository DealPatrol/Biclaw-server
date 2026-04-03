# BI-CLAW · Full Vertical AI Team · SaaS Platform

The complete COO Ecosystem as a hosted multi-client SaaS — auth, billing, all 5 agents, and a full dashboard.

---

## ⚡ Quick Start

### Mac / Linux
```bash
# First time
bash install-mac.sh

# After first install
bash start-mac.sh
```

### Windows
```
# First time — double-click:
install-windows.bat

# After first install — double-click:
start-windows.bat
```

Opens at: **http://localhost:5173**

---

## 📁 Project Structure

```
biclaw-saas/
├── server/                   # Express backend
│   ├── routes/
│   │   ├── auth.js           # Register, login, JWT
│   │   ├── billing.js        # Stripe checkout + webhooks
│   │   └── agents.js         # All 5 agents + sessions
│   ├── middleware/
│   │   └── auth.js           # JWT auth + plan limits
│   ├── lib/
│   │   └── db.js             # SQLite database + schema
│   ├── index.js              # Server entry point
│   └── .env.example          # Environment variables template
│
├── client/                   # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx   # Public landing page
│   │   │   ├── Auth.jsx      # Login + Register
│   │   │   ├── Onboarding.jsx # 3-step new user wizard
│   │   │   ├── Dashboard.jsx  # Main BI-CLAW interface
│   │   │   ├── Billing.jsx    # Plans + usage
│   │   │   └── Settings.jsx   # Profile settings
│   │   ├── components/
│   │   │   ├── AppShell.jsx   # Nav wrapper
│   │   │   └── UI.jsx         # Shared components
│   │   ├── hooks/
│   │   │   └── useAuth.jsx    # Auth context
│   │   ├── lib/
│   │   │   └── api.js         # API client
│   │   ├── App.jsx            # Router
│   │   └── main.jsx           # Entry point
│   └── vite.config.js
│
├── install-mac.sh             # One-click installer (Mac)
├── install-windows.bat        # One-click installer (Windows)
├── start-mac.sh               # Quick start after install (Mac)
└── start-windows.bat          # Quick start after install (Windows)
```

---

## 🔑 Environment Variables (server/.env)

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic key — clients never see this |
| `JWT_SECRET` | Random secret for signing tokens |
| `STRIPE_SECRET_KEY` | From stripe.com/dashboard |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook settings |
| `STRIPE_PRICE_STARTER` | Price ID for Starter plan ($99/mo) |
| `STRIPE_PRICE_PRO` | Price ID for Pro plan ($199/mo) |
| `STRIPE_PRICE_AGENCY` | Price ID for Agency plan ($299/mo) |
| `PORT` | Server port (default: 3001) |
| `CLIENT_URL` | Frontend URL (default: http://localhost:5173) |

---

## 💳 Setting Up Stripe (to take payments)

1. Create a Stripe account at stripe.com
2. Go to **Products** → create 3 products: Starter ($99/mo), Pro ($199/mo), Agency ($299/mo)
3. Copy each **Price ID** (starts with `price_`) into `server/.env`
4. Go to **Developers → Webhooks** → Add endpoint: `https://yourdomain.com/api/billing/webhook`
5. Add events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
6. Copy the **Webhook Secret** into `server/.env`

For local webhook testing, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):
```bash
stripe listen --forward-to localhost:3001/api/billing/webhook
```

---

## 🚀 Deploy to Production (Vercel + Railway)

### Backend → Railway
1. Push `server/` folder to a GitHub repo
2. Create new project at railway.app
3. Add all environment variables from `.env`
4. Set `CLIENT_URL` to your Vercel frontend URL
5. Deploy — Railway gives you a URL like `https://biclaw-server.up.railway.app`

### Frontend → Vercel
1. Push `client/` folder to GitHub
2. Import at vercel.com/new
3. Add env variable: `VITE_API_URL=https://biclaw-server.up.railway.app`
4. Update `client/src/lib/api.js` line 1: `const BASE = import.meta.env.VITE_API_URL + '/api'`
5. Deploy — your app is live at `https://biclaw.app` (add your custom domain)

---

## 💰 Business Model

You run BI-CLAW as a white-label SaaS:

- **Free** — 3 audits/month, 2 agents (great for acquisition)
- **Starter** — $99/mo, 20 audits, all 5 agents
- **Pro** — $199/mo, 100 audits, priority + exports
- **Agency** — $299/mo, unlimited, white-label

Your Anthropic API cost per full 5-agent audit: ~$0.05–$0.10
Your margin at $99/mo with 20 audits: ~$97/client/month

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, React Router, Vite |
| Backend | Node.js, Express |
| Database | SQLite (via better-sqlite3) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Billing | Stripe |
| AI | Anthropic Claude API |
