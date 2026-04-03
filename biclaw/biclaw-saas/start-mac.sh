#!/bin/bash
cd "$(dirname "$0")"
echo ""
echo "  🚀 Starting BI-CLAW..."
echo "  Frontend → http://localhost:5173"
echo "  Backend  → http://localhost:3001"
echo "  Press Ctrl+C to stop"
echo ""
(sleep 4 && (open "http://localhost:5173" 2>/dev/null || xdg-open "http://localhost:5173" 2>/dev/null)) &
(cd server && npm run dev) &
(cd client && npm run dev) &
trap "kill 0; exit 0" SIGINT SIGTERM
wait
