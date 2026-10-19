@echo off
title PhotoFinder - Starting Server...
echo ======================================================================
echo                  PHOTOFINDER 1-CLICK LAUNCHER
echo ======================================================================
echo.
echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "PhotoFinder Backend (Port 8000)" cmd /k "cd /d %~dp0 && python -m backend.main"

timeout /t 3 /nobreak >nul

echo [2/2] Launching Cloudflare Tunnel (HTTP/2 IPv4) ...
start "Cloudflare Tunnel" cmd /k "cd /d %~dp0 && cloudflared.exe tunnel --protocol http2 --edge-ip-version 4 --url http://127.0.0.1:8000"

echo.
echo ======================================================================
echo [READY] Both services are now running in separate terminal windows!
echo - Keep both windows OPEN while the website is active.
echo - To STOP everything, simply run stop_server.bat or close the windows.
echo ======================================================================
pause
