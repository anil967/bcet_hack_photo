import os
import time
import uuid
import logging
from collections import defaultdict
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from backend.routes.search import router as search_router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [req:%(name)s] %(message)s"
)
logger = logging.getLogger("photofinder")

app = FastAPI(
    title="PhotoFinder API",
    description="Privacy-first, biometric event photography retrieval API powered by ArcFace and FAISS.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "http://localhost:3000")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permissive for mobile devices / LAN testing, can be restricted in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-Memory Sliding Window Rate Limiter ---
RATE_LIMIT_PER_MINUTE = int(os.getenv("MAX_SEARCH_REQUESTS_PER_MINUTE", "10"))
ip_request_history = defaultdict(list)

@app.middleware("http")
async def rate_limiting_and_logging_middleware(request: Request, call_next):
    req_id = str(uuid.uuid4())[:8]
    client_ip = request.client.host if request.client else "unknown"
    start_time = time.time()

    # Apply rate limiting specifically to search endpoint
    if request.url.path == "/api/search-photos" and request.method == "POST":
        now = time.time()
        # Filter timestamps within the last 60 seconds
        recent = [t for t in ip_request_history[client_ip] if now - t < 60.0]
        ip_request_history[client_ip] = recent

        if len(recent) >= RATE_LIMIT_PER_MINUTE:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JSONResponse(
                status_code=429,
                content={
                    "success": False,
                    "error": "RATE_LIMITED",
                    "message": "Too many requests. Please wait a minute before trying another search."
                }
            )
        ip_request_history[client_ip].append(now)

    # Process request
    try:
        response = await call_next(request)
        duration_ms = round((time.time() - start_time) * 1000, 2)
        response.headers["X-Request-ID"] = req_id
        response.headers["X-Response-Time"] = f"{duration_ms}ms"

        # Do NOT log sensitive payloads
        logger.info(f"{request.method} {request.url.path} [{response.status_code}] in {duration_ms}ms (IP: {client_ip})")
        return response
    except Exception as e:
        logger.error(f"Unhandled server error on {request.url.path}: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "INTERNAL_ERROR",
                "message": "An unexpected error occurred. Please try again later."
            }
        )

# Health endpoint
@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint returning service readiness and storage mode.
    """
    from backend.services.drive_service import drive_service
    from backend.services.search_service import search_service
    return {
        "status": "ok",
        "service": "photofinder-backend",
        "version": "1.0.0",
        "drive_mode": drive_service.is_drive_mode,
        "has_folder_id": bool(drive_service.folder_id),
        "has_token_json": bool(drive_service.token_json),
        "has_token_file": bool(drive_service.token_file and os.path.exists(drive_service.token_file)),
        "indexed_vectors": search_service.index.ntotal if search_service.index else 0
    }

# Include routes
app.include_router(search_router)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
