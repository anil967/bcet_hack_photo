@echo off
title PhotoFinder Backend Logs
echo ===================================================
echo [PHOTOFINDER BACKEND] Live Request & Search Logs
echo Port: 8000 (FastAPI + ArcFace + FAISS)
echo Press Ctrl+C to exit.
echo ===================================================
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Content -Wait -Tail 30 'C:\Users\anilp\.gemini\antigravity-ide\brain\9221337f-32f7-4406-a24c-8c4606ee04af\.system_generated\tasks\task-2198.log'"
