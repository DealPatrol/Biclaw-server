@echo off
setlocal EnableDelayedExpansion
cls
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   BI-CLAW SaaS -- Installer (Windows)   ║
echo  ╚══════════════════════════════════════════╝
echo.
cd /d "%~dp0"

:: ── Node.js check ──────────────────────────────────────────
echo  [1/5] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  Node.js not found. Opening download page...
    start https://nodejs.org/en/download
    pause
)
for /f "tokens=*" %%i in ('node --version') do echo  OK Node.js %%i

:: ── Server deps ────────────────────────────────────────────
echo.
echo  [2/5] Installing server dependencies...
cd server && call npm install --silent && cd ..
echo  OK Server ready

:: ── Client deps ────────────────────────────────────────────
echo.
echo  [3/5] Installing client dependencies...
cd client && call npm install --silent && cd ..
echo  OK Client ready

:: ── Env setup ──────────────────────────────────────────────
echo.
echo  [4/5] Environment Setup
echo.

if not exist "server\.env" (
    copy server\.env.example server\.env >nul

    echo  ╔══════════════════════════════════════════╗
    echo  ║  Get your Anthropic key at:              ║
    echo  ║  console.anthropic.com                   ║
    echo  ╚══════════════════════════════════════════╝
    echo.
    set /p ANTHROPIC_KEY="  Paste your Anthropic API key: "

    if not "!ANTHROPIC_KEY!"=="" (
        echo const fs=require('fs'); > _tmp.js
        echo let c=fs.readFileSync('server/.env','utf8'); >> _tmp.js
        echo c=c.replace('sk-ant-your-key-here','!ANTHROPIC_KEY!'); >> _tmp.js
        echo fs.writeFileSync('server/.env',c); >> _tmp.js
        node _tmp.js && del _tmp.js
        echo  OK API key saved
    )

    :: Auto-generate JWT secret
    echo const crypto=require('crypto'); > _jwt.js
    echo const fs=require('fs'); >> _jwt.js
    echo let c=fs.readFileSync('server/.env','utf8'); >> _jwt.js
    echo c=c.replace('change-this-to-a-long-random-secret-string',crypto.randomBytes(32).toString('hex')); >> _jwt.js
    echo fs.writeFileSync('server/.env',c); >> _jwt.js
    node _jwt.js && del _jwt.js
    echo  OK JWT secret auto-generated

    echo.
    echo  Stripe is optional for local testing.
    echo  Add your Stripe key in server/.env when ready.
    echo.
    set /p STRIPE_KEY="  Paste Stripe secret key (or ENTER to skip): "
    if not "!STRIPE_KEY!"=="" (
        echo const fs=require('fs'); > _stripe.js
        echo let c=fs.readFileSync('server/.env','utf8'); >> _stripe.js
        echo c=c.replace('sk_test_your-stripe-secret-key','!STRIPE_KEY!'); >> _stripe.js
        echo fs.writeFileSync('server/.env',c); >> _stripe.js
        node _stripe.js && del _stripe.js
        echo  OK Stripe key saved
    )
) else (
    echo  OK .env already exists -- skipping
)

:: ── Launch ─────────────────────────────────────────────────
echo.
echo  [5/5] Launching BI-CLAW...
echo.
echo  ╔══════════════════════════════════════════╗
echo  ║  BI-CLAW is starting up!                 ║
echo  ║                                          ║
echo  ║  Frontend: http://localhost:5173         ║
echo  ║  Backend:  http://localhost:3001         ║
echo  ║                                          ║
echo  ║  Close this window to stop both servers  ║
echo  ╚══════════════════════════════════════════╝
echo.

start "" timeout /t 5 >nul && start http://localhost:5173
start "BI-CLAW Server" cmd /k "cd server && npm run dev"
start "BI-CLAW Client" cmd /k "cd client && npm run dev"
