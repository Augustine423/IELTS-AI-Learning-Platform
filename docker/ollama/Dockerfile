# syntax=docker/dockerfile:1.7
# Multi-stage Ollama images (Ubuntu — not official ollama/ollama).
#
# Installs Ollama from GitHub Releases, bakes ONE local model in a bake stage,
# then copies only the binary + model weights into a clean runtime (smaller).
#
# Targets:
#   ollama-base  — Ubuntu + Ollama binary only
#   ollama-model — base + one baked model (+ embedded SBOM)
#
#   docker buildx build -f docker/ollama/Dockerfile --target ollama-model \
#     --build-arg BAKE_MODEL=llama3.2 --sbom=true -t ielts-ai-ollama-llama32 .
#
# Embedded SPDX: /sbom/sbom.spdx.json

ARG BUILDKIT_SBOM_SCAN_CONTEXT=true
ARG BUILDKIT_SBOM_SCAN_STAGE=true

# ---------------------------------------------------------------------------
# Stage 1 — shared Ollama binary (no model weights)
# ---------------------------------------------------------------------------
FROM ubuntu:24.04 AS ollama-base

ARG TARGETARCH
ARG OLLAMA_VERSION=v0.32.0
# CPU-only by default (drops CUDA/ROCm/MLX runners — huge size win for VM/K8s CPU).
ARG INCLUDE_GPU=0

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
    echo "==> Downloading Ollama ${OLLAMA_VERSION} (${arch})"; \
    curl -fL --retry 5 --retry-delay 3 --retry-all-errors -o /tmp/ollama.tar.zst "${url}"; \
    tar --zstd -xf /tmp/ollama.tar.zst -C /usr; \
    chmod +x /usr/bin/ollama; \
    if [ "${INCLUDE_GPU}" != "1" ]; then \
      echo "==> Stripping GPU runners (INCLUDE_GPU=0)"; \
      rm -rf \
        /usr/lib/ollama/cuda* \
        /usr/lib/ollama/rocm* \
        /usr/lib/ollama/mlx* \
        /usr/lib/ollama/vulkan* \
        /usr/lib/ollama/*cuda* \
        /usr/lib/ollama/*rocm* \
        /usr/lib/ollama/*mlx* 2>/dev/null || true; \
      find /usr/lib/ollama -maxdepth 1 -type d \( \
        -iname '*cuda*' -o -iname '*rocm*' -o -iname '*mlx*' -o -iname '*vulkan*' -o -iname '*jetpack*' \
      \) -exec rm -rf {} + 2>/dev/null || true; \
    fi; \
    rm -f /tmp/ollama.tar.zst; \
    apt-get purge -y --auto-remove zstd tar findutils || true; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* /tmp/* /var/tmp/*; \
    ollama --version; \
    du -sh /usr/bin/ollama /usr/lib/ollama 2>/dev/null || true

COPY docker/ollama/entrypoint.sh /entrypoint.sh
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 11434

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=10 \
    CMD curl -sf http://127.0.0.1:11434/api/tags || exit 1

ENTRYPOINT ["/entrypoint.sh"]

# ---------------------------------------------------------------------------
# Stage 2 — bake model (discarded; not the final image)
# ---------------------------------------------------------------------------
FROM ollama-base AS ollama-bake

ARG BAKE_MODEL=llama3.2
ARG OFFLINE_BUILD=0

ENV BAKE_MODELS=${BAKE_MODEL} \
    BAKE_MODEL=${BAKE_MODEL} \
    OFFLINE_BUILD=${OFFLINE_BUILD}

# Reinstall findutils only for bake (GGUF discovery); stays out of final image
RUN apt-get update \
    && apt-get install -y --no-install-recommends findutils \
    && rm -rf /var/lib/apt/lists/*

COPY models/ /tmp/models/
COPY docker/ollama/bake-model.sh /tmp/bake-model.sh

RUN sed -i 's/\r$//' /tmp/bake-model.sh \
    && chmod +x /tmp/bake-model.sh \
    && BAKE_MODELS="${BAKE_MODEL}" OFFLINE_BUILD="${OFFLINE_BUILD}" /tmp/bake-model.sh \
    && rm -rf /tmp/models /tmp/bake-model.sh /tmp/* \
    && find /root/.ollama -type f \( -name '*.tmp' -o -name '*.partial' \) -delete 2>/dev/null || true

# ---------------------------------------------------------------------------
# Stage 3 — clean runtime: binary + weights only
# ---------------------------------------------------------------------------
FROM ubuntu:24.04 AS ollama-runtime

ARG BAKE_MODEL=llama3.2

ENV DEBIAN_FRONTEND=noninteractive \
    OLLAMA_HOST=0.0.0.0:11434 \
    OLLAMA_MODELS=/root/.ollama \
    BAKE_MODEL=${BAKE_MODEL} \
    PATH="/usr/bin:${PATH}"

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl bash \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/* /tmp/* /var/tmp/*

# Ollama release layout under /usr (binary + shared libs).
# Use a shell copy so missing optional paths do not break the build.
COPY --from=ollama-base /usr/bin/ollama /usr/bin/ollama
COPY --from=ollama-base /usr/lib/ollama/ /usr/lib/ollama/
COPY --from=ollama-bake /root/.ollama/ /root/.ollama/
COPY --from=ollama-base /entrypoint.sh /entrypoint.sh

RUN chmod +x /usr/bin/ollama /entrypoint.sh \
    && ollama --version

EXPOSE 11434

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=10 \
    CMD curl -sf http://127.0.0.1:11434/api/tags || exit 1

ENTRYPOINT ["/entrypoint.sh"]

# ---------------------------------------------------------------------------
# Stage 4 — SBOM + final model image
# ---------------------------------------------------------------------------
FROM alpine:3.21 AS sbom

COPY --from=anchore/syft:v1.19.0 /syft /usr/local/bin/syft
COPY --from=ollama-runtime / /rootfs
RUN syft dir:/rootfs -o spdx-json=/sbom.spdx.json

FROM ollama-runtime AS ollama-model

COPY --from=sbom /sbom.spdx.json /sbom/sbom.spdx.json

LABEL org.opencontainers.image.title="ielts-ai-ollama" \
      org.opencontainers.image.description="IELTS AI Ollama runtime with one baked model" \
      org.opencontainers.image.sbom.path="/sbom/sbom.spdx.json"
