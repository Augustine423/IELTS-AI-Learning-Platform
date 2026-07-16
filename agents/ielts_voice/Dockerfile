# syntax=docker/dockerfile:1.7
# IELTS LiveKit voice agent (all 4 skills) — connects to LiveKit Cloud.
#
# BuildKit SBOM: docker buildx build --sbom=true ...
# Embedded SPDX: /sbom/sbom.spdx.json

ARG BUILDKIT_SBOM_SCAN_CONTEXT=true
ARG BUILDKIT_SBOM_SCAN_STAGE=true

FROM python:3.11-slim-bookworm AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_ROOT_USER_ACTION=ignore

WORKDIR /app

FROM base AS builder

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential gcc g++ \
    && rm -rf /var/lib/apt/lists/*

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && find /opt/venv -type d -name "__pycache__" -prune -exec rm -rf {} + \
    && find /opt/venv -type d \( -name "tests" -o -name "test" \) -prune -exec rm -rf {} + \
    && find /opt/venv -type f \( -name "*.pyc" -o -name "*.pyo" -o -name "*.a" \) -delete

FROM base AS runner

# ffmpeg decodes Edge TTS MP3 → PCM for LiveKit
RUN apt-get update \
    && apt-get install -y --no-install-recommends ffmpeg ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* /tmp/* /var/tmp/*

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY agent.py edge_tts_plugin.py ./

RUN addgroup --system agent \
    && adduser --system --ingroup agent --home /app agent \
    && mkdir -p /sbom \
    && chown -R agent:agent /app

USER agent

# LiveKit worker has no HTTP port; keep process alive as health signal
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
    CMD ["python", "-c", "import os,sys; sys.exit(0 if os.getenv('LIVEKIT_URL') and os.getenv('LIVEKIT_API_KEY') else 1)"]

CMD ["python", "agent.py", "start"]

FROM alpine:3.21 AS sbom

COPY --from=anchore/syft:v1.19.0 /syft /usr/local/bin/syft
COPY --from=runner / /rootfs
RUN syft dir:/rootfs -o spdx-json=/sbom.spdx.json

FROM runner AS final

USER root
COPY --from=sbom --chown=agent:agent /sbom.spdx.json /sbom/sbom.spdx.json
USER agent

LABEL org.opencontainers.image.title="ielts-ai-livekit-agent" \
      org.opencontainers.image.description="IELTS LiveKit Cloud voice agent (all 4 skills)" \
      org.opencontainers.image.sbom.path="/sbom/sbom.spdx.json"
