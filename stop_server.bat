@echo off
title PhotoFinder - Stopping Server...
echo ======================================================================
echo                  PHOTOFINDER 1-CLICK STOPPER
echo ======================================================================
echo.
echo Stopping Cloudflare Tunnel and Backend processes...

powershell -NoProfile -ExecutionPolicy Bypass -Command "Stop-Process -Name cloudflared -Force -ErrorAction SilentlyContinue; Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

echo.
echo [SUCCESS] Backend and Cloudflare Tunnel have been cleanly stopped.
echo ======================================================================
pause
