#!/bin/bash
set -e
clear
echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║   BI-CLAW SaaS — Installer (Mac/Linux)  ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

# ── Node.js check ──────────────────────────────────────────
echo "  [1/5] Checking Node.js..."
if ! command -v node &>/dev/null; then
  echo "  Node.js not found. Opening nodejs.org..."
  open "https://nodejs.org/en/download" 2>/dev/null || xdg-open "https://nodejs.org/en/download"
  echo ""
  read -p "  Press ENTER after Node.js finishes installing..."
fi
echo "  ✅ Node.js $(node --version)"

# ── Install server dependencies ────────────────────────────
echo ""
echo "  [2/5] Installing server dependencies..."
cd server && npm install --silent && cd ..
echo "  ✅ Server dependencies ready"

# ── Install client dependencies ────────────────────────────
echo ""
echo "  [3/5] Installing client dependencies..."
cd client && npm install --silent && cd ..
echo "  ✅ Client dependencies ready"

# ── Environment setup ──────────────────────────────────────
echo ""
echo "  [4/5] Environment Setup"
echo ""

if [ ! -f "server/.env" ]; then
  cp server/.env.example server/.env

  echo "  ╔══════════════════════════════════════════╗"
  echo "  ║  You need an Anthropic API key.          ║"
  echo "  ║  Get one at: console.anthropic.com       ║"
  echo "  ╚══════════════════════════════════════════╝"
  echo ""
  read -p "  Paste your Anthropic API key: " ANTHROPIC_KEY
  if [[ "$ANTHROPIC_KEY" == sk-ant* ]]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|sk-ant-your-key-here|$ANTHROPIC_KEY|g" server/.env
    else
      sed -i "s|sk-ant-your-key-here|$ANTHROPIC_KEY|g" server/.env
    fi
    echo "  ✅ Anthropic API key saved"
  else
    echo "  ⚠  Key not saved — edit server/.env manually"
  fi

  echo ""
  read -p "  Enter a JWT secret (or press ENTER to auto-generate): " JWT_INPUT
  if [ -z "$JWT_INPUT" ]; then
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  else
    JWT_SECRET="$JWT_INPUT"
  fi
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|change-this-to-a-long-random-secret-string|$JWT_SECRET|g" server/.env
  else
    sed -i "s|change-this-to-a-long-random-secret-string|$JWT_SECRET|g" server/.env
  fi
  echo "  ✅ JWT secret saved"

  echo ""
  echo "  ╔══════════════════════════════════════════╗"
  echo "  ║  Stripe is optional for local testing.   ║"
  echo "  ║  Skip for now — add keys in server/.env  ║"
  echo "  ║  when you're ready to take payments.     ║"
  echo "  ╚══════════════════════════════════════════╝"
  echo ""
  read -p "  Paste Stripe secret key (or press ENTER to skip): " STRIPE_KEY
  if [ -n "$STRIPE_KEY" ]; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|sk_test_your-stripe-secret-key|$STRIPE_KEY|g" server/.env
    else
      sed -i "s|sk_test_your-stripe-secret-key|$STRIPE_KEY|g" server/.env
    fi
    echo "  ✅ Stripe key saved"
  else
    echo "  ⚠  Stripe skipped — billing features disabled until added"
  fi
else
  echo "  ✅ .env already exists — skipping setup"
fi

# ── Launch ─────────────────────────────────────────────────
echo ""
echo "  [5/5] Launching BI-CLAW..."
echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║  ✅ BI-CLAW is starting up!              ║"
echo "  ║                                          ║"
echo "  ║  Frontend → http://localhost:5173        ║"
echo "  ║  Backend  → http://localhost:3001        ║"
echo "  ║                                          ║"
echo "  ║  Press Ctrl+C to stop both servers       ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""

# Open browser after delay
(sleep 5 && (open "http://localhost:5173" 2>/dev/null || xdg-open "http://localhost:5173" 2>/dev/null)) &

# Start both servers concurrently
(cd server && npm run dev) &
SERVER_PID=$!

(cd client && npm run dev) &
CLIENT_PID=$!

# Wait and handle Ctrl+C cleanly
trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; echo ''; echo '  Servers stopped.'; exit 0" SIGINT SIGTERM
wait
