# Multi-stage Ollama images (Ubuntu — not official ollama/ollama).
#
# Targets:
#   ollama-base  — Ubuntu + Ollama binary only (shared cache layer)
#   ollama-model — base + ONE baked local model (small per-image)
#
# Examples:
#   docker build -f docker/ollama/Dockerfile --target ollama-base -t ielts-ai-ollama-base .
#   docker build -f docker/ollama/Dockerfile --target ollama-model \
#     --build-arg BAKE_MODEL=llama3.2 -t ielts-ai-ollama-llama32 .

# ---------------------------------------------------------------------------
# Stage 1 — shared runtime (no model weights)
# ---------------------------------------------------------------------------
FROM ubuntu:24.04 AS ollama-base

ENV DEBIAN_FRONTEND=noninteractive \
    OLLAMA_HOST=0.0.0.0:11434 \
    OLLAMA_MODELS=/root/.ollama

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl bash findutils \
    && curl -fsSL https://ollama.com/install.sh | sh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY docker/ollama/entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 11434

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=10 \
    CMD curl -sf http://127.0.0.1:11434/api/tags || exit 1

ENTRYPOINT ["/entrypoint.sh"]

# ---------------------------------------------------------------------------
# Stage 2 — one model per image (keeps each image smaller)
# ---------------------------------------------------------------------------
FROM ollama-base AS ollama-model

ARG BAKE_MODEL=llama3.2
ARG OFFLINE_BUILD=0

ENV BAKE_MODELS=${BAKE_MODEL} \
    BAKE_MODEL=${BAKE_MODEL} \
    OFFLINE_BUILD=${OFFLINE_BUILD}

COPY models/ /tmp/models/
COPY docker/ollama/bake-model.sh /tmp/bake-model.sh

RUN sed -i 's/\r$//' /tmp/bake-model.sh \
    && chmod +x /tmp/bake-model.sh \
    && BAKE_MODELS="${BAKE_MODEL}" OFFLINE_BUILD="${OFFLINE_BUILD}" /tmp/bake-model.sh \
    && rm -rf /tmp/models /tmp/bake-model.sh
