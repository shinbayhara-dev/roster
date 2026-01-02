@echo off
echo ========================================
echo   CSSD Roster Pro - Development Mode
echo ========================================
echo.
echo Starting Backend and Frontend...
echo.

REM Start Backend in new window
start "CSSD Backend" cmd /k "node api/index.js"

REM Wait 2 seconds for backend to start
timeout /t 2 /nobreak > nul

REM Start Frontend in new window
start "CSSD Frontend" cmd /k "npm run dev"

echo.
echo ✅ Both servers are starting...
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5174
echo.
echo Press any key to close this window...
pause > nul
