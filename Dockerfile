FROM python:3.11-slim

# Install system dependencies required for OpenCV and FAISS OpenMP runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libgomp1 \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code and models
COPY backend/ ./backend/
COPY worker/ ./worker/
COPY data/ ./data/

# Download YuNet and SFace models during build so container boots instantly
RUN python -c "from backend.services.face_service import face_service; print('Models verified!')"

# Default port (Render overrides with $PORT)
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Start production uvicorn server
CMD exec uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
