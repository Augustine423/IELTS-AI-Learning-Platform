# syntax=docker/dockerfile:1.7
# Slim FastAPI + Whisper runtime (venv multi-stage, cleaned site-packages).
#
# BuildKit SBOM (attestation):  docker buildx build --sbom=true ...
# Embedded SPDX:                /sbom/sbom.spdx.json

ARG BUILDKIT_SBOM_SCAN_CONTEXT=true
ARG BUILDKIT_SBOM_SCAN_STAGE=true

FROM python:3.11-slim-bookworm AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_ROOT_USER_ACTION=ignore

WORKDIR /app

# ---------------------------------------------------------------------------
# Builder — isolated venv (keeps compilers / headers out of runtime)
# ---------------------------------------------------------------------------
FROM base AS builder

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        gcc \
        g++ \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && find /opt/venv -type d -name "__pycache__" -prune -exec rm -rf {} + \
    && find /opt/venv -type d \( -name "tests" -o -name "test" -o -name "testing" \) -prune -exec rm -rf {} + \
    && find /opt/venv -type f -name "*.pyc" -delete \
    && find /opt/venv -type f -name "*.pyo" -delete \
    && find /opt/venv -type f -name "*.a" -delete

# ---------------------------------------------------------------------------
# Runtime
# ---------------------------------------------------------------------------
FROM base AS runner

# ffmpeg needed for voice; keep recommends off and purge lists
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg \
    && apt-get purge -y --auto-remove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* /tmp/* /var/tmp/*

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY app ./app
COPY config.yaml .

RUN addgroup --system app \
    && adduser --system --ingroup app --home /app app \
    && mkdir -p /app/.cache/huggingface /app/.cache/whisper /app/tmp /sbom \
    && chown -R app:app /app

ENV HOME=/app \
    HF_HOME=/app/.cache/huggingface \
    WHISPER_CACHE_DIR=/app/.cache/whisper \
    TMPDIR=/app/tmp

# Pre-download Whisper tiny for offline STT
RUN python -c "from faster_whisper import WhisperModel; WhisperModel('tiny', device='cpu', compute_type='int8', download_root='/app/.cache/whisper')" \
    && find /app/.cache -type d -name "__pycache__" -prune -exec rm -rf {} + \
    && chown -R app:app /app/.cache

USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
    CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')"]

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

# ---------------------------------------------------------------------------
# SBOM (SPDX JSON embedded in final image)
# ---------------------------------------------------------------------------
FROM alpine:3.21 AS sbom

COPY --from=anchore/syft:v1.19.0 /syft /usr/local/bin/syft
COPY --from=runner / /rootfs
RUN syft dir:/rootfs -o spdx-json=/sbom.spdx.json

FROM runner AS final

USER root
COPY --from=sbom --chown=app:app /sbom.spdx.json /sbom/sbom.spdx.json
USER app

LABEL org.opencontainers.image.title="ielts-ai-backend" \
      org.opencontainers.image.description="IELTS AI FastAPI backend (slim)" \
      org.opencontainers.image.sbom.path="/sbom/sbom.spdx.json"
