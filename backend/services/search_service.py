import os
import json
import logging
import faiss
import numpy as np
from typing import List, Dict, Any, Optional

logger = logging.getLogger("photofinder.search")

class SearchService:
    """
    Manages FAISS vector index and metadata mapping.
    Performs similarity search with threshold filtering and photo deduplication.
    """
    def __init__(self, data_dir: Optional[str] = None):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.root_dir = os.path.dirname(base_dir)
        self.data_dir = data_dir or os.path.join(self.root_dir, "data")
        os.makedirs(self.data_dir, exist_ok=True)

        self.index_path = os.path.join(self.data_dir, "face_index.faiss")
        self.metadata_path = os.path.join(self.data_dir, "face_metadata.json")

        self.dimension = 128 # SFace feature dimension
        self.index: Optional[faiss.Index] = None
        self.metadata: Dict[str, Dict[str, Any]] = {}
        
        # Load threshold from environment or default to 0.36 (calibrated for SFace cosine similarity)
        env_thresh = os.getenv("FACE_MATCH_THRESHOLD")
        self.match_threshold = float(env_thresh) if env_thresh else 0.36

        self.load_index()

    def load_index(self):
        """Loads FAISS index and metadata from disk."""
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            try:
                self.index = faiss.read_index(self.index_path)
                with open(self.metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                logger.info(f"Loaded FAISS index with {self.index.ntotal} vectors and {len(self.metadata)} metadata records.")
            except Exception as e:
                logger.error(f"Error loading FAISS index or metadata: {e}")
                self._init_empty_index()
        else:
            self._init_empty_index()

    def _init_empty_index(self):
        """Initializes a new empty IndexFlatIP (Inner Product = Cosine similarity for normalized vectors)."""
        logger.info("Initializing new empty FAISS IndexFlatIP.")
        self.index = faiss.IndexFlatIP(self.dimension)
        self.metadata = {}

    @property
    def is_ready(self) -> bool:
        return self.index is not None and self.index.ntotal > 0

    def search(self, query_vector: np.ndarray, top_k: int = 100) -> List[Dict[str, Any]]:
        """
        Executes similarity search:
        1. Queries FAISS Inner Product for top_k vectors.
        2. Filters matches by match_threshold.
        3. Deduplicates matching photos by file_id.
        4. Returns photo items with URLs for display and download.
        """
        if not self.is_ready:
            logger.warning("Search called but FAISS index is empty or not loaded.")
            return []

        # Ensure vector shape is (1, d) and float32
        vec = query_vector.astype(np.float32).reshape(1, -1)
        
        # Inner product search
        scores, indices = self.index.search(vec, min(top_k, self.index.ntotal))

        matched_photos_map = {} # file_id -> photo dict
        
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0:
                continue
            idx_str = str(idx)
            if idx_str not in self.metadata:
                continue

            sim_score = float(score)
            if sim_score >= self.match_threshold:
                meta = self.metadata[idx_str]
                file_id = meta["file_id"]
                file_name = meta.get("file_name", file_id)

                # Deduplicate: if photo already added, record the highest similarity score
                if file_id not in matched_photos_map:
                    matched_photos_map[file_id] = {
                        "id": file_id,
                        "fileName": file_name,
                        "thumbnailUrl": f"/api/photos/{file_id}/thumbnail",
                        "imageUrl": f"/api/photos/{file_id}",
                        "downloadUrl": f"/api/photos/{file_id}/download",
                        "matchScore": round(sim_score, 4)
                    }
                else:
                    if sim_score > matched_photos_map[file_id]["matchScore"]:
                        matched_photos_map[file_id]["matchScore"] = round(sim_score, 4)

        # Sort results by similarity score descending
        results = list(matched_photos_map.values())
        results.sort(key=lambda x: x["matchScore"], reverse=True)
        return results

# Singleton instance
search_service = SearchService()
