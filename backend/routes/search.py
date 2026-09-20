import os
import time
import logging
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Request, Response, Header, Depends
from fastapi.responses import StreamingResponse
import io

from backend.services.face_service import face_service
from backend.services.search_service import search_service
from backend.services.drive_service import drive_service

logger = logging.getLogger("photofinder.api")
router = APIRouter(prefix="/api")

# Pydantic schemas
class SearchPhotoRequest(BaseModel):
    selfie: str = Field(..., description="Base64 encoded selfie image data")

class PhotoItem(BaseModel):
    id: str
    fileName: str
    thumbnailUrl: str
    imageUrl: str
    downloadUrl: str
    matchScore: Optional[float] = None

class SearchPhotoSuccessResponse(BaseModel):
    success: bool = True
    count: int
    photos: List[PhotoItem]
    durationMs: Optional[float] = None

class SearchPhotoErrorResponse(BaseModel):
    success: bool = False
    error: str
    message: str

# Configurable limits
MAX_SELFIE_SIZE_MB = float(os.getenv("MAX_SELFIE_SIZE_MB", "2.0"))
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "change-this-in-production-secure-key")

@router.post("/search-photos", response_model=None)
async def search_photos(payload: SearchPhotoRequest, request: Request):
    """
    Search event photographs matching a participant's selfie.
    Enforces privacy: selfie is processed strictly in-memory and immediately discarded.
    """
    start_time = time.time()
    raw_b64 = payload.selfie

    # Validate approximate size of base64 payload
    payload_size_bytes = len(raw_b64) * 3 / 4
    if payload_size_bytes > (MAX_SELFIE_SIZE_MB * 1024 * 1024):
        return {
            "success": False,
            "error": "IMAGE_TOO_LARGE",
            "message": f"Selfie image exceeds maximum allowed size of {MAX_SELFIE_SIZE_MB}MB."
        }

    # Step 1: Detect face and generate ArcFace embedding
    try:
        embedding, face_box = face_service.process_selfie(raw_b64)
    except ValueError as e:
        error_code = str(e)
        if error_code == "NO_FACE_DETECTED":
            return {
                "success": False,
                "error": "NO_FACE_DETECTED",
                "message": "We couldn't detect your face. Please try another selfie with better lighting."
            }
        elif error_code == "MULTIPLE_FACES":
            return {
                "success": False,
                "error": "MULTIPLE_FACES",
                "message": "Please make sure only one person is visible in the selfie."
            }
        else:
            return {
                "success": False,
                "error": "INVALID_IMAGE",
                "message": "Please upload or capture a valid photo."
            }
    except Exception as e:
        logger.error(f"Unexpected error during face processing: {e}")
        return {
            "success": False,
            "error": "SEARCH_FAILED",
            "message": "Failed to analyze selfie. Please try again."
        }

    # Step 2: Query FAISS Vector Index
    try:
        matches = search_service.search(embedding, top_k=100)
    except Exception as e:
        logger.error(f"Search vector index failure: {e}")
        return {
            "success": False,
            "error": "SEARCH_FAILED",
            "message": "Unable to search photos at this time. Please try again later."
        }

    duration_ms = round((time.time() - start_time) * 1000, 2)
    logger.info(f"Search completed in {duration_ms}ms: found {len(matches)} matching photos.")

    return {
        "success": True,
        "count": len(matches),
        "photos": matches,
        "durationMs": duration_ms
    }

@router.get("/photos/{file_id}")
async def get_photo(file_id: str):
    """
    Streams the full-resolution event photograph securely without exposing Drive URLs.
    """
    try:
        photo_bytes, mime_type = drive_service.get_photo_bytes(file_id)
        return Response(
            content=photo_bytes,
            media_type=mime_type,
            headers={
                "Cache-Control": "public, max-age=86400, immutable"
            }
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Photograph not found")
    except Exception as e:
        logger.error(f"Error streaming photo {file_id}: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving photograph")

@router.get("/photos/{file_id}/thumbnail")
async def get_photo_thumbnail(file_id: str):
    """
    Streams an optimized responsive thumbnail (JPEG, ~400px width).
    """
    try:
        thumb_bytes, mime_type = drive_service.get_thumbnail_bytes(file_id)
        return Response(
            content=thumb_bytes,
            media_type=mime_type,
            headers={
                "Cache-Control": "public, max-age=604800, immutable"
            }
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    except Exception as e:
        logger.error(f"Error streaming thumbnail {file_id}: {e}")
        raise HTTPException(status_code=500, detail="Error generating thumbnail")

@router.get("/photos/{file_id}/download")
async def download_photo(file_id: str):
    """
    Triggers direct file download with attachment header and clean filename.
    """
    try:
        photo_bytes, mime_type = drive_service.get_photo_bytes(file_id)
        filename = f"{file_id}.jpg" if not file_id.lower().endswith((".jpg", ".png", ".jpeg")) else file_id
        return Response(
            content=photo_bytes,
            media_type=mime_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Cache-Control": "private, no-cache"
            }
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Photograph not found")
    except Exception as e:
        logger.error(f"Error downloading photo {file_id}: {e}")
        raise HTTPException(status_code=500, detail="Error downloading photograph")

@router.post("/admin/reindex")
async def trigger_admin_reindex(x_admin_secret: Optional[str] = Header(None)):
    """
    Protected endpoint to trigger incremental indexing.
    Requires X-Admin-Secret header matching configured ADMIN_SECRET.
    """
    if not x_admin_secret or x_admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Unauthorized: invalid admin secret")

    from worker.index_photos import run_incremental_indexer
    result = run_incremental_indexer()
    return {
        "success": True,
        "indexing_summary": result
    }
