@echo off
title Cloudflare Tunnel Logs
echo ===================================================
echo [CLOUDFLARE TUNNEL] Live Streaming Logs (HTTP/2 IPv4)
echo Tunnel URL: https://parts-setting-tough-recipes.trycloudflare.com
echo Press Ctrl+C to exit.
echo ===================================================
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Content -Wait -Tail 30 'C:\Users\anilp\.gemini\antigravity-ide\brain\9221337f-32f7-4406-a24c-8c4606ee04af\.system_generated\tasks\task-2200.log'"
