import os
import sys
import json
import time
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.getcwd())
from dotenv import load_dotenv
load_dotenv()

from backend.services.drive_service import drive_service

def main():
    print("=" * 60)
    print("       PHOTOFINDER BACKGROUND THUMBNAIL PRE-CACHER")
    print("=" * 60)

    meta_file = os.path.join("data", "face_metadata.json")
    if not os.path.exists(meta_file):
        print(f"Metadata file not found: {meta_file}")
        return

    with open(meta_file, "r", encoding="utf-8") as f:
        meta_dict = json.load(f)

    unique_photo_ids = list(set(m["file_id"] for m in meta_dict.values()))
    total = len(unique_photo_ids)
    print(f"Total unique photos in event: {total}")

    thumb_dir = drive_service.thumbnail_cache_dir
    os.makedirs(thumb_dir, exist_ok=True)

    missing = []
    for pid in unique_photo_ids:
        path = os.path.join(thumb_dir, f"{pid}_thumb.jpg")
        if not os.path.exists(path) or os.path.getsize(path) < 500:
            missing.append(pid)

    already_cached = total - len(missing)
    print(f"Already cached: {already_cached} / {total} ({already_cached/total*100:.1f}%)")
    print(f"Remaining to pre-cache: {len(missing)}")

    if not missing:
        print("[SUCCESS] All event thumbnails are already 100% cached on disk!")
        return

    # First pre-load all thumbnail links into memory in 2 batch calls
    print("\nPre-loading Google CDN links into memory...")
    drive_service.warm_thumbnail_links()

    print(f"\nDownloading {len(missing)} thumbnails in parallel worker pool...")
    success_count = 0
    t0 = time.time()

    def _cache_one(pid):
        try:
            drive_service.get_thumbnail_bytes(pid)
            return True
        except Exception:
            return False

    with ThreadPoolExecutor(max_workers=6) as pool:
        for idx, res in enumerate(pool.map(_cache_one, missing), 1):
            if res:
                success_count += 1
            if idx % 100 == 0 or idx == len(missing):
                elapsed = time.time() - t0
                speed = idx / elapsed if elapsed > 0 else 0
                print(f"Progress: [{idx}/{len(missing)}] ({idx/len(missing)*100:.1f}%) - {speed:.1f} thumbs/sec")

    print("\n" + "=" * 60)
    print(f"[DONE] Successfully pre-cached {success_count} thumbnails in {time.time()-t0:.1f}s!")
    print(f"Total on disk now: {already_cached + success_count} / {total}")
    print("=" * 60)

if __name__ == "__main__":
    main()
