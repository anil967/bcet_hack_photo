import os
import json
import time
import logging
import faiss
import numpy as np
from datetime import datetime, timezone

from backend.services.drive_service import drive_service
from worker.sync_drive import get_drive_sync_plan
from worker.face_processor import process_photo_bytes
from worker.build_index import save_index_atomically

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("photofinder.indexer")

def run_incremental_indexer(data_dir: str = None) -> dict:
    """
    Executes an incremental indexing pass:
    - Queries storage for photos
    - Compares with data/processed_files.json
    - Detects faces and generates embeddings for new/modified photos
    - Appends to FAISS index and metadata
    - Atomic restart-safe updates
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = data_dir or os.path.join(base_dir, "data")
    os.makedirs(data_dir, exist_ok=True)

    index_path = os.path.join(data_dir, "face_index.faiss")
    meta_path = os.path.join(data_dir, "face_metadata.json")
    processed_path = os.path.join(data_dir, "processed_files.json")

    # 1. Load or initialize FAISS index and metadata
    dimension = 128
    if os.path.exists(index_path) and os.path.exists(meta_path):
        try:
            index = faiss.read_index(index_path)
            with open(meta_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)
            logger.info(f"Loaded existing index: {index.ntotal} vectors, {len(metadata)} metadata entries.")
        except Exception as e:
            logger.error(f"Failed to load existing index, creating new: {e}")
            index = faiss.IndexFlatIP(dimension)
            metadata = {}
    else:
        index = faiss.IndexFlatIP(dimension)
        metadata = {}

    # 2. Get Sync Plan
    to_process, to_remove, processed_data = get_drive_sync_plan(data_dir)

    if not to_process and not to_remove:
        logger.info("Index is fully up to date. No new or modified photographs found.")
        return {
            "status": "up_to_date",
            "processed_count": 0,
            "total_vectors": index.ntotal,
            "total_photos": len(processed_data)
        }

    # 3. Process new and modified files
    processed_count = 0
    total_faces_added = 0
    start_time = time.time()

    for idx, photo in enumerate(to_process):
        file_id = photo["id"]
        file_name = photo.get("name", file_id)
        mod_time = photo.get("modifiedTime", "")

        logger.info(f"[{idx+1}/{len(to_process)}] Processing: {file_name} (ID: {file_id})...")

        try:
            photo_bytes, _ = drive_service.get_photo_bytes(file_id)
            faces = process_photo_bytes(photo_bytes)

            # Add each detected face into FAISS index
            for face_emb, face_meta in faces:
                vector_id = index.ntotal # next index position
                # FAISS expects 2D float32 array
                vec_2d = face_emb.reshape(1, -1).astype(np.float32)
                index.add(vec_2d)

                metadata[str(vector_id)] = {
                    "file_id": file_id,
                    "file_name": file_name,
                    "face_index": face_meta.get("face_index", 0),
                    "box": {
                        "x": face_meta.get("x", 0),
                        "y": face_meta.get("y", 0),
                        "w": face_meta.get("w", 0),
                        "h": face_meta.get("h", 0)
                    }
                }
                total_faces_added += 1

            # Update processed_files state
            processed_data[file_id] = {
                "modified_time": mod_time,
                "status": "processed",
                "faces_detected": len(faces),
                "indexed_at": datetime.now(timezone.utc).isoformat()
            }
            processed_count += 1

            # Save incrementally after each photo to ensure restart-safety
            save_index_atomically(index, metadata, data_dir)
            with open(processed_path, "w", encoding="utf-8") as f:
                json.dump(processed_data, f, indent=2)

        except Exception as e:
            logger.error(f"Failed to process photo {file_name}: {e}")
            processed_data[file_id] = {
                "modified_time": mod_time,
                "status": "error",
                "error": str(e),
                "attempted_at": datetime.utcnow().isoformat()
            }

    duration = time.time() - start_time
    logger.info(
        f"Indexing run complete in {duration:.2f}s! "
        f"Processed {processed_count} photos, added {total_faces_added} face vectors. "
        f"Total index vectors: {index.ntotal}."
    )

    # Reload search_service if in-process
    try:
        from backend.services.search_service import search_service
        search_service.load_index()
    except Exception:
        pass

    return {
        "status": "success",
        "processed_count": processed_count,
        "new_faces": total_faces_added,
        "total_vectors": index.ntotal,
        "duration_seconds": round(duration, 2)
    }

if __name__ == "__main__":
    run_incremental_indexer()
