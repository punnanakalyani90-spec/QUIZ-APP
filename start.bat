@echo off
title QuizSphere Server
cd /d "%~dp0"

echo =======================================================
echo ⚡ Starting QuizSphere (Frontend, Backend, Database)...
echo =======================================================

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Node.js was not detected in PATH.
    echo Opening QuizSphere directly in your browser...
    start "" "frontend\index.html"
    pause
    exit /b
)

echo.
echo =======================================================
echo 🟢 KEEP THIS BLACK WINDOW OPEN WHILE PLAYING!
echo 🌐 Opening http://localhost:3000 in your browser...
echo =======================================================
echo.

:: Wait 2 seconds so server is fully listening before browser opens
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"

:: Start the backend server
node backend\server.js

echo.
echo Server stopped.
pause