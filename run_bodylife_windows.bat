@echo off
REM ========================================================
REM BodyLife Gym Management Suite - Windows Local Launcher
REM ========================================================
title BodyLife Gym Management Suite
echo.
echo ========================================================
echo     BODYLIFE - GYM MANAGEMENT & FEE TRACKING SYSTEM
echo ========================================================
echo.
echo Starting local offline desktop server...
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not detected on this computer.
    echo Please install Node.js from https://nodejs.org to run BodyLife.
    pause
    exit /b
)

if not exist "node_modules" (
    echo [SETUP] Initializing local packages for offline operation...
    call npm install --omit=dev
)

if not exist "dist" (
    echo [BUILD] Creating lightweight optimized local build...
    call npm run build
)

echo.
echo [READY] Opening BodyLife Desktop Console in your default browser...
start http://localhost:4173
call npm run preview -- --port 4173 --host
pause
