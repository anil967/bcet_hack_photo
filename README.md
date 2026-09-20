# PhotoFinder 📸

> **Production-Ready, Privacy-First Event Photo Retrieval Platform**  
> Powered by **FastAPI**, **Next.js (App Router)**, **YuNet / ArcFace (SFace)**, **FAISS Vector Search**, and **Google Drive**.

---

## 1. Project Overview

**PhotoFinder** is a high-performance web application designed for college hackathons, conferences, and large events. Event participants open a shared link, allow camera access, take a single selfie, and instantly receive every event photograph in which they appear.

### Key Highlights
* **Zero Registration ID & No Account Creation:** No passwords, phone numbers, or registration IDs required for participants.
* **Biometric Privacy by Design:** The participant's selfie is processed entirely in ephemeral RAM, converted to a compact vector embedding, searched against FAISS, and immediately discarded. No selfies or facial coordinates are ever saved to disk or external databases.
* **No Direct Google Drive Redirects:** All matched event photographs and responsive thumbnails stream securely through PhotoFinder backend endpoints (`/api/photos/{id}`). Google Drive credentials and folder links remain strictly confidential.
* **Offline / Local Dev Fallback:** Seamlessly operates in dual storage modes—when Google Drive credentials are not configured, PhotoFinder automatically serves and indexes local event samples (`data/sample_photos/`), enabling instant out-of-the-box evaluation.
* **High-Throughput Incremental Indexing:** Photos are indexed ahead-of-time in the background via `worker/index_photos.py`, recording processed files in `data/processed_files.json`. Multi-face group photographs generate multiple vectors mapped to the same photo ID, with automatic deduplication at search time.

---

## 2. System Architecture

```text
                               GOOGLE DRIVE (Event Folder)
                                      (or Local Dev)
                                             │
                                             ▼
                                  ┌─────────────────────┐
                                  │  Drive Sync Worker  │
                                  │   (sync_drive.py)   │
                                  └──────────┬──────────┘
                                             │
                                             ▼
                                  ┌─────────────────────┐
                                  │ Face Detection &    │
                                  │ ArcFace Embeddings  │
                                  │   (YuNet + SFace)   │
                                  └──────────┬──────────┘
                                             │
                                             ▼
                                  ┌─────────────────────┐
                                  │  FAISS FlatIP Index │
                                  │ (Normalized Cosine) │
                                  └──────────┬──────────┘
                                             │
                                             ▼
                                  data/face_index.faiss
                                  data/face_metadata.json
                                  data/processed_files.json
                                             ▲
                                             │
                             vector similarity search (IP >= threshold)
                                             │
USER SELFIE (Camera) ──────► FastAPI Backend (/api/search-photos)
(Processed in-memory only)                   │
                                             ▼
                                     Matching Photo IDs
                                             │
                                             ▼
                             Secure Proxy (/api/photos/{id})
                                             │
                                             ▼
                                    PhotoFinder Gallery
                                  (Lightbox, Download All)
```

---

## 3. Project Structure

```text
bcet_hack_photo/
│
├── frontend/                     # Next.js App Router Frontend
│   ├── app/
│   │   ├── page.tsx              # Main state machine & landing experience
│   │   ├── layout.tsx            # Dark theme, SEO & responsive viewport
│   │   └── globals.css           # Design tokens, accessibility focus rings
│   │
│   ├── components/
│   │   ├── CameraCapture.tsx     # WebRTC camera, mirrored stream, face guide
│   │   ├── SelfiePreview.tsx     # Captured preview, retake & search trigger
│   │   ├── SearchProgress.tsx    # Multi-stage real progress animation
│   │   ├── PhotoGrid.tsx         # Responsive 4/3/2 column gallery grid
│   │   ├── PhotoCard.tsx         # Lazy loading, hover overlay, quick actions
│   │   ├── PhotoViewer.tsx       # Fullscreen lightbox, touch swipe & arrow keys
│   │   ├── EmptyState.tsx        # Actionable guidance when 0 matches found
│   │   └── ErrorState.tsx        # Granular error handling (rate limits, faces)
│   │
│   ├── lib/
│   │   └── api.ts                # Typed client for FastAPI search & photo URLs
│   │
│   └── package.json
│
├── backend/                      # FastAPI Python Backend
│   ├── main.py                   # App init, CORS, sliding-window rate limiter
│   │
│   ├── routes/
│   │   └── search.py             # Search, photo stream, thumbnail, download
│   │
│   ├── services/
│   │   ├── face_service.py       # YuNet detector & SFace ArcFace embedding
│   │   ├── drive_service.py      # Google Drive API v3 & local fallback
│   │   └── search_service.py     # FAISS IndexFlatIP & deduplication logic
│   │
│   ├── models/                   # Auto-cached ONNX models (YuNet & SFace)
│   └── requirements.txt
│
├── worker/                       # Background Incremental Indexing System
│   ├── sync_drive.py             # Compares Drive state with processed_files.json
│   ├── face_processor.py         # Batch face extraction from image buffers
│   ├── build_index.py            # Atomic FAISS index writing
│   └── index_photos.py           # Restart-safe incremental orchestration script
│
├── data/
│   ├── sample_photos/            # Out-of-the-box demo event photographs
│   ├── face_index.faiss          # Serialized FAISS vector index
│   ├── face_metadata.json        # Vector ID to Photo ID mappings
│   └── processed_files.json      # Incremental indexing state tracker
│
├── tests/
│   └── test_backend.py           # Automated unit & integration test suite
│
├── .env.example                  # Environment configuration template
├── .gitignore
└── README.md
```

---

## 4. Prerequisites

* **Python:** 3.10, 3.11, 3.12, 3.13, or 3.14 (64-bit)
* **Node.js:** v18.0.0 or higher (v20+ recommended)
* **npm:** v9.0.0 or higher

---

## 5. Installation

### 1. Clone & Set Up Backend Environment

```bash
# Navigate to project directory
cd bcet_hack_photo

# Install Python requirements
python -m pip install -r backend/requirements.txt
```

### 2. Set Up Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## 6. Google Drive Integration Setup

PhotoFinder integrates with **Google Drive API v3** to read high-resolution event photographs.

### Step-by-Step Credentials Generation

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g. `PhotoFinder-Event`).
3. Navigate to **APIs & Services > Library** and enable **Google Drive API**.
4. Go to **OAuth consent screen**:
   * User Type: **External**
   * App name: `PhotoFinder`
   * Developer contact email: your email
   * Under Scopes, add: `https://www.googleapis.com/auth/drive.readonly`
   * Under Test Users, add your Google account email.
5. Go to **Credentials > Create Credentials > OAuth client ID**:
   * Application type: **Web application**
   * Authorized redirect URIs: `https://developers.google.com/oauthplayground`
   * Click **Create** and save your `Client ID` and `Client Secret`.
6. Generate the **Refresh Token**:
   * Open the [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/).
   * Click the settings gear icon (top right), check **"Use your own OAuth credentials"**, and paste your `Client ID` and `Client Secret`.
   * In Step 1 (Select & authorize APIs), paste:
     `https://www.googleapis.com/auth/drive.readonly`
   * Click **Authorize APIs** and complete sign-in.
   * In Step 2, click **Exchange authorization code for tokens**.
   * Copy the generated `refresh_token`.
7. Obtain your **Event Folder ID**:
   * In Google Drive, open the folder containing your event photographs.
   * Look at the URL: `https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ`
   * The string after `/folders/` is your `GOOGLE_DRIVE_FOLDER_ID`.

---

## 7. Environment Variables Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# --- Google Drive Integration ---
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id

# --- Face Matching Configuration ---
# Calibrated Cosine Similarity Threshold (0.0 to 1.0)
FACE_MATCH_THRESHOLD=0.36

# Maximum selfie upload size (in MB)
MAX_SELFIE_SIZE_MB=2

# Rate limiting (searches per IP per minute)
MAX_SEARCH_REQUESTS_PER_MINUTE=10

# --- Admin Operations ---
ADMIN_SECRET=your-super-secret-admin-key

# --- Service Networking ---
PORT=8000
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> **Note:** If Google Drive credentials are left blank, PhotoFinder automatically runs in **Local Sample Storage Mode**, indexing and streaming from `data/sample_photos/`.

---

## 8. Building & Running the System

### Phase A: Index Event Photographs

Run the incremental indexing worker:

```bash
python -m worker.index_photos
```

* **First run:** Scans all photographs, detects every face, generates normalized ArcFace embeddings, creates `data/face_index.faiss` and `data/face_metadata.json`, and records progress in `data/processed_files.json`.
* **Subsequent runs:** Skips unchanged photographs in milliseconds, only processing newly uploaded or modified photos.
* **Restart-Safe:** State is saved atomically after each photograph. If the process is halted mid-run, it safely resumes from where it left off.

### Phase B: Launch FastAPI Backend Server

```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend starts at `http://localhost:8000`.  
Interactive OpenAPI documentation is available at `http://localhost:8000/docs`.

### Phase C: Launch Next.js Frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` in your desktop or mobile browser.

---

## 9. API Reference

### 1. Health Check
```http
GET /health
```
**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "photofinder-backend",
  "version": "1.0.0"
}
```

---

### 2. Search Photos by Selfie
```http
POST /api/search-photos
Content-Type: application/json
```
**Request Body:**
```json
{
  "selfie": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 2,
  "photos": [
    {
      "id": "event_002_booth.jpg",
      "fileName": "event_002_booth.jpg",
      "thumbnailUrl": "/api/photos/event_002_booth.jpg/thumbnail",
      "imageUrl": "/api/photos/event_002_booth.jpg",
      "downloadUrl": "/api/photos/event_002_booth.jpg/download",
      "matchScore": 0.4699
    }
  ],
  "durationMs": 73.05
}
```

**No Face Detected (200 OK):**
```json
{
  "success": false,
  "error": "NO_FACE_DETECTED",
  "message": "We couldn't detect your face. Please try another selfie with better lighting."
}
```

**Multiple Faces Detected (200 OK):**
```json
{
  "success": false,
  "error": "MULTIPLE_FACES",
  "message": "Please make sure only one person is visible in the selfie."
}
```

**Rate Limited (429 Too Many Requests):**
```json
{
  "success": false,
  "error": "RATE_LIMITED",
  "message": "Too many requests. Please wait a minute before trying another search."
}
```

---

### 3. Stream Photograph
```http
GET /api/photos/{file_id}
```
Returns binary photograph with HTTP caching headers (`Cache-Control: public, max-age=86400`).

---

### 4. Stream Thumbnail
```http
GET /api/photos/{file_id}/thumbnail
```
Returns resized 400px JPEG thumbnail.

---

### 5. Direct Download
```http
GET /api/photos/{file_id}/download
```
Returns binary image with `Content-Disposition: attachment; filename="{file_id}.jpg"`.

---

### 6. Admin Reindex Trigger
```http
POST /api/admin/reindex
X-Admin-Secret: your-super-secret-admin-key
```
Triggers background incremental indexer on demand.

---

## 10. Automated Tests

Execute the automated test suite verifying health, search, single-face validation, streaming, and downloads:

```bash
python tests/test_backend.py
```

Expected output:
```text
PASS: Health endpoint works!
PASS: Search photos returned 2 matching photos!
PASS: Blank image correctly triggers NO_FACE_DETECTED!
PASS: Photo streaming endpoint returns valid JPEG binary!
PASS: Thumbnail endpoint returns valid JPEG thumbnail!
PASS: Download endpoint returns Content-Disposition: attachment header!
ALL AUTOMATED BACKEND TESTS PASSED!
```

---

## 11. Biometric Privacy & Security

Biometric facial recognition requires responsible engineering:

1. **Zero Selfie Storage:** Participant selfies exist strictly in volatile memory during the duration of the HTTP request. Once the embedding vector is produced, the image buffer is freed.
2. **Ephemeral Embeddings:** Query embeddings are not saved to database or logs. Only the pre-indexed event photograph vectors reside in `face_index.faiss`.
3. **No Credential Exposure:** Google Drive service accounts, OAuth tokens, and internal folder IDs are never transmitted to the client.
4. **Sanitized Error Responses:** All server exceptions return standardized error codes without exposing Python stack traces or server file paths.
5. **IP Rate Limiting:** The search endpoint enforces an in-memory sliding-window limiter (10 requests/minute per IP) to prevent denial-of-service or scraping attacks.

---

## 12. Pretrained Model Licensing

PhotoFinder utilizes the following open-source neural network models:

* **YuNet Face Detector (`face_detection_yunet_2023mar.onnx`):**  
  Authored by Shiqi Yu, Shengyang Dai, et al. (OpenCV Zoo).  
  **License:** [Apache License 2.0](https://github.com/opencv/opencv_zoo/blob/main/LICENSE) (Permissive, commercial and non-commercial use permitted).
* **SFace ArcFace Face Recognizer (`face_recognition_sface_2021dec.onnx`):**  
  Authored by Zhong et al., OpenCV Zoo ArcFace implementation.  
  **License:** [Apache License 2.0](https://github.com/opencv/opencv_zoo/blob/main/LICENSE) (Permissive, commercial and non-commercial use permitted).

*(Note: If migrating to InsightFace's `buffalo_l` or `antelopev2` models, note that while InsightFace library code is MIT licensed, InsightFace's pretrained weights are trained on MS1MV2/Glint360K and are restricted to academic/non-commercial research).*

---

## 13. Production Deployment Strategy

* **Frontend:** Deploy Next.js to **Vercel**, **Cloudflare Pages**, or a Docker container. Set `NEXT_PUBLIC_API_URL` to your backend domain.
* **Backend:** Deploy FastAPI to **Render**, **Fly.io**, or any low-cost Linux VPS (e.g. Hetzner, DigitalOcean) with 1-2 vCPUs and 2GB RAM.
* **Storage:** Store event photographs in **Google Drive**, or optionally mount an S3/R2 bucket using the same `drive_service` abstraction.
* **Indexing:** Run `python -m worker.index_photos` as a scheduled cron job (e.g. every 15 minutes during an active event) or trigger it via `POST /api/admin/reindex`.

---

## 14. Future Roadmap: Registration ID Extension

When college organizers request verification by student registration ID:
1. The backend database schema can map `registration_id -> participant_photo_ids`.
2. The UI can add a single optional input field: `Registration ID (Optional)`.
3. The search route will filter the candidate FAISS vector set by the participant's registered session or group before ranking similarity, providing even greater precision.
