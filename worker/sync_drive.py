import os
import json
import logging
from typing import Dict, List, Tuple, Any
from backend.services.drive_service import drive_service

logger = logging.getLogger("photofinder.worker.sync")

def get_drive_sync_plan(data_dir: str) -> Tuple[List[Dict[str, str]], List[str], Dict[str, Any]]:
    """
    Compares current photographs from Drive/storage against data/processed_files.json.
    Returns:
      (photos_to_process, photos_to_remove, current_processed_state)
    """
    processed_path = os.path.join(data_dir, "processed_files.json")
    processed_data = {}
    if os.path.exists(processed_path):
        try:
            with open(processed_path, "r", encoding="utf-8") as f:
                processed_data = json.load(f)
        except Exception as e:
            logger.warning(f"Failed to read processed_files.json: {e}")

    current_photos = drive_service.list_photos()
    current_ids = {p["id"]: p for p in current_photos}

    to_process = []
    for photo in current_photos:
        file_id = photo["id"]
        mod_time = photo.get("modifiedTime", "")

        if file_id not in processed_data:
            to_process.append(photo)
        else:
            prev_mod = processed_data[file_id].get("modified_time", "")
            # Reprocess if modified timestamp has changed
            if str(prev_mod) != str(mod_time):
                to_process.append(photo)

    to_remove = []
    for file_id in list(processed_data.keys()):
        if file_id not in current_ids:
            to_remove.append(file_id)

    logger.info(f"Sync Plan: {len(to_process)} photos to index/reindex, {len(to_remove)} to remove, {len(current_photos) - len(to_process)} unchanged.")
    return to_process, to_remove, processed_data
