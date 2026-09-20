import cv2
import numpy as np
import logging
from typing import List, Tuple, Dict, Any
from backend.services.face_service import face_service

logger = logging.getLogger("photofinder.worker.processor")

def process_photo_bytes(image_bytes: bytes) -> List[Tuple[np.ndarray, Dict[str, Any]]]:
    """
    Decodes image bytes and extracts all detected face embeddings using FaceService.
    Returns list of (normalized_embedding_128d, metadata).
    """
    if not image_bytes or len(image_bytes) == 0:
        return []

    np_arr = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        logger.warning("Failed to decode image bytes into valid OpenCV matrix.")
        return []

    return face_service.extract_faces_from_photo(img_bgr)
