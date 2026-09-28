import os
import io
import logging
from typing import List, Dict, Optional, Tuple
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("photofinder.drive")

class DriveService:
    """
    Unified photo repository service supporting Google Drive API v3
    with transparent local sample photo fallback for zero-config offline development.
    Guarantees no Google Drive URLs or secrets are ever leaked to the frontend.
    """
    def __init__(self):
        self.service_account_file = os.getenv("GOOGLE_SERVICE_ACCOUNT_FILE", "").strip() or os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "").strip()
        self.service_account_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
        self.client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
        self.refresh_token = os.getenv("GOOGLE_REFRESH_TOKEN", "").strip()
        self.folder_id = os.getenv("GOOGLE_DRIVE_FOLDER_ID", "").strip()
        self.storage_mode = os.getenv("STORAGE_MODE", "auto").strip().lower()

        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.root_dir = os.path.dirname(base_dir)
        self.sample_dir = os.path.join(self.root_dir, "data", "sample_photos")
        self.thumbnail_cache_dir = os.path.join(self.root_dir, "data", "thumbnails")
        self.photo_cache_dir = os.path.join(self.root_dir, "data", "photos")
        os.makedirs(self.sample_dir, exist_ok=True)
        os.makedirs(self.thumbnail_cache_dir, exist_ok=True)
        os.makedirs(self.photo_cache_dir, exist_ok=True)

        # Check default service_account.json location in project root
        default_sa_file = os.path.join(self.root_dir, "service_account.json")
        if not self.service_account_file and os.path.exists(default_sa_file):
            self.service_account_file = default_sa_file

        # Check default token.json location in project root (from OAuth desktop flow)
        token_env = os.getenv("GOOGLE_TOKEN_FILE", "").strip()
        if token_env:
            self.token_file = token_env if os.path.isabs(token_env) else os.path.join(self.root_dir, token_env)
        else:
            self.token_file = os.path.join(self.root_dir, "token.json")
        self.token_json = os.getenv("GOOGLE_TOKEN_JSON", "").strip()
        self._token_file_mtime = 0

        self._drive_client = None
        has_token = bool((self.token_file and os.path.exists(self.token_file)) or self.token_json)
        has_sa = bool((self.service_account_file and os.path.exists(self.service_account_file)) or self.service_account_json)
        has_oauth = bool(self.client_id and self.client_secret and self.refresh_token)
        self._is_drive_configured = bool((has_token or has_sa or has_oauth) and self.folder_id)

        if self._is_drive_configured and self.storage_mode != "sample":
            self._init_google_drive()
        else:
            logger.info("Operating in Local Sample Storage mode (Google Drive credentials not set or STORAGE_MODE=sample).")

    def _check_and_reload_token_if_needed(self):
        """Automatically re-initialize Google Drive client if token.json has been refreshed on disk."""
        if self.token_file and os.path.exists(self.token_file):
            try:
                current_mtime = os.path.getmtime(self.token_file)
                if current_mtime != self._token_file_mtime:
                    logger.info("Detected modified token.json on disk. Reloading Google Drive client...")
                    self._init_google_drive()
            except Exception as e:
                logger.debug(f"Error checking token mtime: {e}")

    def _init_google_drive(self):
        try:
            from googleapiclient.discovery import build

            scopes = ["https://www.googleapis.com/auth/drive.readonly"]
            credentials = None

            # 1. Try saved user token (from env var string or token.json file)
            if self.token_json:
                import json
                from google.oauth2.credentials import Credentials
                info = json.loads(self.token_json)
                credentials = Credentials.from_authorized_user_info(info, scopes=scopes)
                logger.info("Loaded Google credentials from GOOGLE_TOKEN_JSON environment variable.")
            elif self.token_file and os.path.exists(self.token_file):
                from google.oauth2.credentials import Credentials
                credentials = Credentials.from_authorized_user_file(self.token_file, scopes=scopes)
                self._token_file_mtime = os.path.getmtime(self.token_file)
                logger.info(f"Loaded Google credentials from user token file: {self.token_file}")

                # If token is expired but has a refresh token, try refreshing proactively
                if credentials.expired and credentials.refresh_token:
                    try:
                        from google.auth.transport.requests import Request
                        credentials.refresh(Request())
                        with open(self.token_file, "w", encoding="utf-8") as f:
                            f.write(credentials.to_json())
                        self._token_file_mtime = os.path.getmtime(self.token_file)
                        logger.info("Successfully refreshed and updated Google OAuth access token on disk.")
                    except Exception as refresh_err:
                        logger.warning(
                            f"Google OAuth token refresh failed: {refresh_err}. "
                            "If your token expired or was revoked, run 'python -m worker.auth_drive' to log in."
                        )
            # 2. Try Service Account File or JSON string
            elif self.service_account_json:
                from google.oauth2 import service_account
                import json
                sa_info = json.loads(self.service_account_json)
                credentials = service_account.Credentials.from_service_account_info(sa_info, scopes=scopes)
                logger.info("Loaded Google credentials via Service Account JSON content.")
            elif self.service_account_file and os.path.exists(self.service_account_file):
                from google.oauth2 import service_account
                credentials = service_account.Credentials.from_service_account_file(self.service_account_file, scopes=scopes)
                logger.info(f"Loaded Google credentials from Service Account file: {self.service_account_file}")
            # 3. Fall back to OAuth2 refresh token from env
            elif self.client_id and self.client_secret and self.refresh_token:
                from google.oauth2.credentials import Credentials
                credentials = Credentials(
                    token=None,
                    refresh_token=self.refresh_token,
                    token_uri="https://oauth2.googleapis.com/token",
                    client_id=self.client_id,
                    client_secret=self.client_secret,
                    scopes=scopes
                )
                logger.info("Loaded Google credentials via OAuth2 refresh token.")

            if credentials:
                self._drive_client = build("drive", "v3", credentials=credentials, cache_discovery=False)
                logger.info("Google Drive v3 client connected successfully.")
            else:
                logger.warning("No valid Google Drive credentials could be loaded.")
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
        self._check_and_reload_token_if_needed()
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
                        pageSize=100,
                        supportsAllDrives=True,
                        includeItemsFromAllDrives=True
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
                err_str = str(e)
                if "invalid_grant" in err_str or "expired or revoked" in err_str:
                    logger.error(
                        "Google Drive OAuth token has expired or been revoked! "
                        "Please run 'python -m worker.auth_drive' from bcet_hack_photo to re-authenticate."
                    )
                else:
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
        Retrieves raw photo binary bytes and MIME type with high-speed disk caching.
        Returns (bytes, mime_type).
        """
        # 1. Check local persistent disk cache first (instant 0ms response)
        cache_path = os.path.join(self.photo_cache_dir, f"{file_id}.jpg")
        if os.path.exists(cache_path):
            try:
                with open(cache_path, "rb") as f:
                    return f.read(), "image/jpeg"
            except Exception as e:
                logger.warning(f"Failed to read cached photo {file_id}: {e}")

        # 2. Check local sample directory fallback
        local_path = os.path.join(self.sample_dir, file_id)
        if os.path.exists(local_path):
            with open(local_path, "rb") as f:
                content = f.read()
            ext = os.path.splitext(file_id)[1].lower()
            mime = "image/jpeg" if ext in {".jpg", ".jpeg"} else f"image/{ext[1:]}"
            return content, mime

        # 3. Fetch from Google Drive if in drive mode
        self._check_and_reload_token_if_needed()
        if self.is_drive_mode:
            try:
                from googleapiclient.http import MediaIoBaseDownload
                request = self._drive_client.files().get_media(fileId=file_id, supportsAllDrives=True)
                fh = io.BytesIO()
                # 10MB chunk size ensures photos download in a single HTTP request instead of 50 small roundtrips
                downloader = MediaIoBaseDownload(fh, request, chunksize=10 * 1024 * 1024)
                done = False
                while not done:
                    status, done = downloader.next_chunk()
                fh.seek(0)
                photo_bytes = fh.read()

                # Save to disk cache for instant subsequent reads
                try:
                    with open(cache_path, "wb") as f:
                        f.write(photo_bytes)
                except Exception as save_err:
                    logger.warning(f"Failed to cache full photo {file_id}: {save_err}")

                return photo_bytes, "image/jpeg"
            except Exception as e:
                err_str = str(e)
                if "invalid_grant" in err_str or "expired or revoked" in err_str:
                    logger.error(
                        f"Google Drive access failed for photo {file_id}: OAuth token is expired or revoked. "
                        "Please run 'python -m worker.auth_drive' to log in and re-authorize."
                    )
                else:
                    logger.warning(f"Failed to fetch photo {file_id} from Google Drive: {e}")

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
