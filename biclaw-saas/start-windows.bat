@echo off
cd /d "%~dp0"
echo  Starting BI-CLAW...
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:3001
echo.
start "" timeout /t 4 >nul && start http://localhost:5173
start "BI-CLAW Server" cmd /k "cd server && npm run dev"
start "BI-CLAW Client" cmd /k "cd client && npm run dev"
