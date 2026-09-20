import os
import cv2
import numpy as np
import base64
import logging
from typing import Tuple, List, Optional, Dict, Any

logger = logging.getLogger("photofinder.face")

class FaceService:
    """
    High-performance, privacy-first face detection and recognition service.
    Utilizes YuNet (Apache 2.0) and SFace ArcFace Cosine feature extractor.
    Operates strictly in-memory without saving participant selfies.
    """
    def __init__(self, models_dir: Optional[str] = None):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.models_dir = models_dir or os.path.join(base_dir, "models")
        os.makedirs(self.models_dir, exist_ok=True)

        self.yunet_path = os.path.join(self.models_dir, "face_detection_yunet_2023mar.onnx")
        self.sface_path = os.path.join(self.models_dir, "face_recognition_sface_2021dec.onnx")

        self._ensure_models_exist()

        # Initialize detector with default score threshold 0.6 and nms 0.3
        self.detector = cv2.FaceDetectorYN.create(
            model=self.yunet_path,
            config="",
            input_size=(320, 320),
            score_threshold=0.6,
            nms_threshold=0.3,
            top_k=5000
        )

        # Initialize SFace recognizer
        self.recognizer = cv2.FaceRecognizerSF.create(
            model=self.sface_path,
            config=""
        )
        logger.info("FaceService initialized successfully with YuNet and SFace models.")

    def _ensure_models_exist(self):
        """Downloads the ONNX weights if not present locally."""
        import urllib.request
        urls = {
            self.yunet_path: "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx",
            self.sface_path: "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx"
        }
        for path, url in urls.items():
            if not os.path.exists(path):
                logger.info(f"Downloading model: {os.path.basename(path)}...")
                urllib.request.urlretrieve(url, path)
                logger.info(f"Downloaded {os.path.basename(path)} ({os.path.getsize(path)} bytes).")

    def decode_image_from_base64(self, b64_string: str) -> np.ndarray:
        """
        Safely decodes a base64 image data URL or raw base64 string into an OpenCV BGR image.
        Raises ValueError on corrupted or invalid image format.
        """
        if not b64_string or not isinstance(b64_string, str):
            raise ValueError("Empty or invalid image payload")

        # Strip data URL prefix if present (e.g. data:image/jpeg;base64,...)
        if "," in b64_string:
            b64_string = b64_string.split(",", 1)[1]

        try:
            image_bytes = base64.b64decode(b64_string)
        except Exception as e:
            raise ValueError("Malformed base64 encoding") from e

        if len(image_bytes) == 0:
            raise ValueError("Zero-byte image payload")

        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None or img.size == 0:
            raise ValueError("Unable to decode image buffer into valid graphic")

        h, w, _ = img.shape
        if h < 40 or w < 40:
            raise ValueError("Image dimensions are too small for facial recognition")

        return img

    def process_selfie(self, b64_string: str) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Validates participant selfie:
        - Must contain EXACTLY one face.
        - Returns (embedding, face_box_info).
        - Raises ValueError with specific code on failure:
          'NO_FACE_DETECTED' or 'MULTIPLE_FACES' or 'INVALID_IMAGE'.
        """
        img = self.decode_image_from_base64(b64_string)
        h, w, _ = img.shape

        # Set detector input size to image dimensions
        self.detector.setInputSize((w, h))
        _, faces = self.detector.detect(img)

        face_count = len(faces) if faces is not None else 0

        if face_count == 0:
            raise ValueError("NO_FACE_DETECTED")
        if face_count > 1:
            # Check if there's a dominant foreground face vs tiny background faces
            # Sort by bounding box area (w * h)
            areas = [face[2] * face[3] for face in faces]
            sorted_indices = np.argsort(areas)[::-1]
            largest_area = areas[sorted_indices[0]]
            second_largest_area = areas[sorted_indices[1]]

            # If second largest is more than 25% of largest, reject as multiple people
            if second_largest_area > (0.25 * largest_area):
                raise ValueError("MULTIPLE_FACES")
            primary_face = faces[sorted_indices[0]]
        else:
            primary_face = faces[0]

        # Align, crop, and extract ArcFace cosine embedding
        aligned_face = self.recognizer.alignCrop(img, primary_face)
        feature = self.recognizer.feature(aligned_face)

        # L2-normalize embedding vector
        norm = np.linalg.norm(feature)
        if norm > 1e-6:
            normalized_vec = feature / norm
        else:
            normalized_vec = feature

        box_info = {
            "x": float(primary_face[0]),
            "y": float(primary_face[1]),
            "w": float(primary_face[2]),
            "h": float(primary_face[3]),
            "confidence": float(primary_face[-1])
        }

        return normalized_vec.astype(np.float32).flatten(), box_info

    def extract_faces_from_photo(self, img_bgr: np.ndarray) -> List[Tuple[np.ndarray, Dict[str, Any]]]:
        """
        Detects all faces in an event photograph (group shot or solo shot).
        Returns a list of (normalized_embedding, face_metadata) tuples.
        """
        h, w, _ = img_bgr.shape
        # Limit max dimension for detection performance on 4K+ event photos
        scale = 1.0
        max_dim = 1920
        if max(h, w) > max_dim:
            scale = max_dim / float(max(h, w))
            resized_img = cv2.resize(img_bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
            rh, rw, _ = resized_img.shape
            self.detector.setInputSize((rw, rh))
            _, faces = self.detector.detect(resized_img)
            # Scale coordinates back to original size
            if faces is not None:
                faces[:, 0:4] = faces[:, 0:4] / scale
                # Landmark landmarks are indices 4:14
                faces[:, 4:14] = faces[:, 4:14] / scale
        else:
            self.detector.setInputSize((w, h))
            _, faces = self.detector.detect(img_bgr)

        results = []
        if faces is None or len(faces) == 0:
            return results

        for idx, face in enumerate(faces):
            try:
                # Filter out tiny blurry background faces (less than 35px) and low confidence detections
                # Face layout: [x, y, w, h, x_re, y_re, x_le, y_le, x_nt, y_nt, x_rc, y_rc, x_lc, y_lc, score]
                if face[2] < 35 or face[3] < 35 or face[-1] < 0.65:
                    continue

                aligned = self.recognizer.alignCrop(img_bgr, face)
                feature = self.recognizer.feature(aligned)
                norm = np.linalg.norm(feature)
                if norm > 1e-6:
                    norm_vec = feature / norm
                else:
                    norm_vec = feature

                box = {
                    "face_index": idx,
                    "x": float(face[0]),
                    "y": float(face[1]),
                    "w": float(face[2]),
                    "h": float(face[3]),
                    "score": float(face[-1])
                }
                results.append((norm_vec.astype(np.float32).flatten(), box))
            except Exception as e:
                logger.warning(f"Error processing face {idx} in image: {e}")

        return results

# Singleton instance
face_service = FaceService()
