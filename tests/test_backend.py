import os
import sys

# Ensure workspace root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import base64
import numpy as np
import cv2
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    print("PASS: Health endpoint works!")

def test_search_photos_success():
    uploaded_portrait = r"C:\Users\anilp\.gemini\antigravity-ide\brain\9221337f-32f7-4406-a24c-8c4606ee04af\.user_uploaded\media_1789886273851.png"
    if os.path.exists(uploaded_portrait):
        selfie_path = uploaded_portrait
    else:
        selfie_path = "data/test_selfie.jpg"
    assert os.path.exists(selfie_path), "Sample selfie not found"
    
    with open(selfie_path, "rb") as f:
        b64_selfie = base64.b64encode(f.read()).decode("utf-8")

    response = client.post(
        "/api/search-photos",
        json={"selfie": f"data:image/jpeg;base64,{b64_selfie}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["count"] > 0
    print(f"PASS: Search photos returned {data['count']} matching photos! Photos: {[p['fileName'] for p in data['photos']]}")

def test_no_face_detected():
    # Create blank black image
    blank = np.zeros((300, 300, 3), dtype=np.uint8)
    _, buffer = cv2.imencode(".jpg", blank)
    b64_blank = base64.b64encode(buffer).decode("utf-8")

    response = client.post(
        "/api/search-photos",
        json={"selfie": b64_blank}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "NO_FACE_DETECTED"
    print("PASS: Blank image correctly triggers NO_FACE_DETECTED!")

def test_multiple_faces_detected():
    group_path = "data/sample_photos/event_001_team.jpg"
    with open(group_path, "rb") as f:
        b64_group = base64.b64encode(f.read()).decode("utf-8")

    response = client.post(
        "/api/search-photos",
        json={"selfie": b64_group}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "MULTIPLE_FACES"
    print("PASS: Multi-person photo correctly triggers MULTIPLE_FACES!")

def test_photo_streaming():
    response = client.get("/api/photos/event_001_team.jpg")
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"
    assert len(response.content) > 1000
    print("PASS: Photo streaming endpoint returns valid JPEG binary!")

def test_thumbnail_streaming():
    response = client.get("/api/photos/event_001_team.jpg/thumbnail")
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/jpeg"
    assert len(response.content) > 500
    print("PASS: Thumbnail endpoint returns valid JPEG thumbnail!")

def test_download_endpoint():
    response = client.get("/api/photos/event_001_team.jpg/download")
    assert response.status_code == 200
    assert "attachment" in response.headers["content-disposition"]
    print("PASS: Download endpoint returns Content-Disposition: attachment header!")

if __name__ == "__main__":
    test_health()
    test_search_photos_success()
    test_no_face_detected()
    test_multiple_faces_detected()
    test_photo_streaming()
    test_thumbnail_streaming()
    test_download_endpoint()
    print("\nALL AUTOMATED BACKEND TESTS PASSED!")
