import os
import io
import logging
from typing import List, Dict, Optional, Tuple
from PIL import Image

logger = logging.getLogger("photofinder.drive")

class DriveService:
    """
    Unified photo repository service supporting Google Drive API v3
    with transparent local sample photo fallback for zero-config offline development.
    Guarantees no Google Drive URLs or secrets are ever leaked to the frontend.
    """
    def __init__(self):
        self.client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
        self.refresh_token = os.getenv("GOOGLE_REFRESH_TOKEN", "").strip()
        self.folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID", "").strip()
        self.storage_mode = os.getenv("STORAGE_MODE", "auto").strip().lower()

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.root_dir = os.path.dirname(base_dir)
        self.sample_dir = os.path.join(self.root_dir, "data", "sample_photos")
        self.thumbnail_cache_dir = os.path.join(self.root_dir, "data", "thumbnails")
        os.makedirs(self.sample_dir, exist_ok=True)
        os.makedirs(self.thumbnail_cache_dir, exist_ok=True)

        self._drive_client = None
        self._is_drive_configured = bool(
            self.client_id and self.client_secret and self.refresh_token and self.folder_id
        )

        if self._is_drive_configured and self.storage_mode != "sample":
            self._init_google_drive()
        else:
            logger.info("Operating in Local Sample Storage mode (Google Drive credentials not set or STORAGE_MODE=sample).")

    def _init_google_drive(self):
        try:
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build

            credentials = Credentials(
                token=None,
                refresh_token=self.refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=self.client_id,
                client_secret=self.client_secret,
                scopes=["https://www.googleapis.com/auth/drive.readonly"]
            )
            self._drive_client = build("drive", "v3", credentials=credentials, cache_discovery=False)
            logger.info("Google Drive v3 client connected successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Google Drive client: {e}. Falling back to sample photos.")
            self._drive_client = None

    @property
    def is_drive_mode(self) -> bool:
        return self._drive_client is not None

    def list_photos(self) -> List[Dict[str, str]]:
        """
        Lists all available event photographs.
        Returns a list of dicts:
        [{ 'id': '...', 'name': '...', 'mimeType': 'image/jpeg', 'modifiedTime': '...' }]
        """
        if self.is_drive_mode:
            try:
                query = f"'{self.folder_id}' in parents and mimeType contains 'image/' and trashed = false"
                results = []
                page_token = None
                while True:
                    response = self._drive_client.files().list(
                        q=query,
                        spaces='drive',
                        fields='nextPageToken, files(id, name, mimeType, modifiedTime, thumbnailLink)',
                        pageToken=page_token,
                        pageSize=100
                    ).execute()
                    files = response.get('files', [])
                    for f in files:
                        results.append({
                            "id": f.get("id"),
                            "name": f.get("name"),
                            "mimeType": f.get("mimeType", "image/jpeg"),
                            "modifiedTime": f.get("modifiedTime", "")
                        })
                    page_token = response.get('nextPageToken', None)
                    if not page_token:
                        break
                return results
            except Exception as e:
                logger.error(f"Error querying Google Drive: {e}")
                # Fall through to local fallback

        # Local sample directory fallback
        photos = []
        valid_exts = {".jpg", ".jpeg", ".png", ".webp"}
        if os.path.exists(self.sample_dir):
            for filename in sorted(os.listdir(self.sample_dir)):
                _, ext = os.path.splitext(filename)
                if ext.lower() in valid_exts:
                    filepath = os.path.join(self.sample_dir, filename)
                    stat = os.stat(filepath)
                    photos.append({
                        "id": filename, # Clean stable file identifier
                        "name": filename,
                        "mimeType": "image/jpeg" if ext.lower() in {".jpg", ".jpeg"} else f"image/{ext.lower()[1:]}",
                        "modifiedTime": str(stat.st_mtime)
                    })
        return photos

    def get_photo_bytes(self, file_id: str) -> Tuple[bytes, str]:
        """
        Retrieves raw photo binary bytes and MIME type.
        Returns (bytes, mime_type).
        """
        if self.is_drive_mode:
            try:
                from googleapiclient.http import MediaIoBaseDownload
                request = self._drive_client.files().get_media(fileId=file_id)
                fh = io.BytesIO()
                downloader = MediaIoBaseDownload(fh, request)
                done = False
                while not done:
                    status, done = downloader.next_chunk()
                fh.seek(0)
                return fh.read(), "image/jpeg"
            except Exception as e:
                logger.warning(f"Failed to fetch photo {file_id} from Google Drive: {e}")

        # Local fallback
        local_path = os.path.join(self.sample_dir, file_id)
        if os.path.exists(local_path):
            with open(local_path, "rb") as f:
                content = f.read()
            ext = os.path.splitext(file_id)[1].lower()
            mime = "image/jpeg" if ext in {".jpg", ".jpeg"} else f"image/{ext[1:]}"
            return content, mime

        raise FileNotFoundError(f"Photo with ID {file_id} not found in storage.")

    def get_thumbnail_bytes(self, file_id: str) -> Tuple[bytes, str]:
        """
        Retrieves or generates an optimized thumbnail (max 400px) with disk caching.
        """
        cache_path = os.path.join(self.thumbnail_cache_dir, f"{file_id}_thumb.jpg")
        if os.path.exists(cache_path):
            with open(cache_path, "rb") as f:
                return f.read(), "image/jpeg"

        # Generate thumbnail from source photo
        photo_bytes, _ = self.get_photo_bytes(file_id)
        image = Image.open(io.BytesIO(photo_bytes))
        image.thumbnail((450, 450), Image.Resampling.LANCZOS)
        
        # Convert RGBA to RGB for JPEG
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")

        thumb_io = io.BytesIO()
        image.save(thumb_io, format="JPEG", quality=80)
        thumb_bytes = thumb_io.getvalue()

        try:
            with open(cache_path, "wb") as f:
                f.write(thumb_bytes)
        except Exception as e:
            logger.warning(f"Failed to cache thumbnail for {file_id}: {e}")

        return thumb_bytes, "image/jpeg"

# Singleton instance
drive_service = DriveService()
