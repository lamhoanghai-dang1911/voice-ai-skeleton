# ==============================================================================
# INTEGRIX IX.VOICE - BACKEND & WORKER DOCKERFILE
# ==============================================================================
FROM python:3.10-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PORT=8000

# Install system dependencies (e.g. ffmpeg for audio processing, curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency definition
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && \
    pip install -r /app/requirements.txt

# Create non-root user and set permissions
RUN useradd -u 1000 -m appuser && \
    mkdir -p /app/data/storage /app/contracts /app/logs && \
    chown -R appuser:appuser /app

# Copy source code and contracts
COPY backend/app /app/app
COPY contracts /app/contracts

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# Default command: FastAPI server with Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
