import os
import json
import logging
import faiss
import numpy as np
from typing import Dict, Any

logger = logging.getLogger("photofinder.worker.build")

def save_index_atomically(index: faiss.Index, metadata: Dict[str, Any], data_dir: str):
    """
    Saves the FAISS index and metadata files using atomic replacement
    to avoid index corruption during unexpected shutdown.
    """
    os.makedirs(data_dir, exist_ok=True)
    index_path = os.path.join(data_dir, "face_index.faiss")
    meta_path = os.path.join(data_dir, "face_metadata.json")

    tmp_index_path = index_path + ".tmp"
    tmp_meta_path = meta_path + ".tmp"

    try:
        faiss.write_index(index, tmp_index_path)
        with open(tmp_meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        # Atomic rename on Windows/POSIX
        if os.path.exists(index_path):
            os.replace(tmp_index_path, index_path)
        else:
            os.rename(tmp_index_path, index_path)

        if os.path.exists(meta_path):
            os.replace(tmp_meta_path, meta_path)
        else:
            os.rename(tmp_meta_path, meta_path)

        logger.info(f"FAISS index ({index.ntotal} vectors) and metadata ({len(metadata)} entries) written successfully.")
    except Exception as e:
        logger.error(f"Failed to save FAISS index atomically: {e}")
        if os.path.exists(tmp_index_path):
            os.remove(tmp_index_path)
        if os.path.exists(tmp_meta_path):
            os.remove(tmp_meta_path)
        raise
