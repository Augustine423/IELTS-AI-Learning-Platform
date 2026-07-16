# Multi-stage Ollama images (Ubuntu — not official ollama/ollama).
#
# Installs the Ollama binary from GitHub Releases (reliable in CI),
# bakes ONE local model, then deletes download leftovers so the image stays small.
#
# Targets:
#   ollama-base  — Ubuntu + Ollama binary only
#   ollama-model — base + one baked model
#
#   docker build -f docker/ollama/Dockerfile --target ollama-model \
#     --build-arg BAKE_MODEL=llama3.2 -t ielts-ai-ollama-llama32 .

# ---------------------------------------------------------------------------
# Stage 1 — shared runtime (no model weights, no source tree)
# ---------------------------------------------------------------------------
FROM ubuntu:24.04 AS ollama-base

ARG TARGETARCH
# Pin a release tag for reproducible CI (override with --build-arg).
ARG OLLAMA_VERSION=v0.32.0

ENV DEBIAN_FRONTEND=noninteractive \
    OLLAMA_HOST=0.0.0.0:11434 \
    OLLAMA_MODELS=/root/.ollama \
    PATH="/usr/bin:${PATH}"

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
        ca-certificates curl bash findutils zstd tar; \
    arch="${TARGETARCH:-amd64}"; \
    case "${arch}" in \
      amd64|x86_64) arch=amd64 ;; \
      arm64|aarch64) arch=arm64 ;; \
      *) echo "Unsupported arch: ${arch}"; exit 1 ;; \
    esac; \
    url="https://github.com/ollama/ollama/releases/download/${OLLAMA_VERSION}/ollama-linux-${arch}.tar.zst"; \
    echo "==> Downloading Ollama ${OLLAMA_VERSION} (${arch}) from GitHub Releases"; \
    echo "    ${url}"; \
    curl -fL --retry 5 --retry-delay 3 --retry-all-errors -o /tmp/ollama.tar.zst "${url}"; \
    # Official layout: extract into /usr → /usr/bin/ollama + libs
    tar --zstd -xf /tmp/ollama.tar.zst -C /usr; \
    chmod +x /usr/bin/ollama; \
    # Drop archive + extract tools we no longer need (smaller image)
    rm -f /tmp/ollama.tar.zst; \
    apt-get purge -y --auto-remove zstd || true; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* /tmp/*; \
    ollama --version

COPY docker/ollama/entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 11434

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=10 \
    CMD curl -sf http://127.0.0.1:11434/api/tags || exit 1

ENTRYPOINT ["/entrypoint.sh"]

# ---------------------------------------------------------------------------
# Stage 2 — bake one model, then drop bake scripts / GGUF context
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
    && rm -rf /tmp/models /tmp/bake-model.sh /tmp/*
