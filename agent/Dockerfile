# syntax=docker/dockerfile:1

# Build with UV (includes package manager + compilers). Final image does not.
ARG PYTHON_VERSION=3.14
FROM ghcr.io/astral-sh/uv:python${PYTHON_VERSION}-bookworm-slim AS build

ENV PYTHONUNBUFFERED=1
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy
ENV UV_NO_DEV=1
ENV HF_HOME=/app/.cache/huggingface
ENV TORCH_HOME=/app/.cache/torch

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    python3-dev \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN mkdir -p src

# Production deps only (skip pytest/ruff from [dependency-groups] dev).
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev --no-install-project

# Pre-download LiveKit plugin model files (turn detector, etc.).
RUN --mount=type=cache,target=/root/.cache/uv \
    uv run --no-dev --module livekit.agents download-files

COPY src ./src
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --locked --no-dev

# Drop leftover build junk from the venv to shrink the copied layer.
RUN find /app/.venv -type d -name "__pycache__" -prune -exec rm -rf {} + \
  && find /app/.venv -type d -name "tests" -prune -exec rm -rf {} + \
  && find /app/.venv -type d -name "test" -prune -exec rm -rf {} + \
  && find /app/.venv -type f -name "*.pyi" -delete

# Slim runtime: stock Python image (no UV binary, no compilers).
FROM python:${PYTHON_VERSION}-slim-bookworm AS production

ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/app/.cache/huggingface
ENV TORCH_HOME=/app/.cache/torch
ENV PATH="/app/.venv/bin:$PATH"

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/app" \
    --shell "/sbin/nologin" \
    --uid "${UID}" \
    appuser

WORKDIR /app

# Copy only what runtime needs — not uv, apt build tools, or source build caches.
COPY --from=build --chown=appuser:appuser /app/.venv /app/.venv
COPY --from=build --chown=appuser:appuser /app/.cache /app/.cache
COPY --from=build --chown=appuser:appuser /app/src /app/src
COPY --from=build --chown=appuser:appuser /app/pyproject.toml /app/pyproject.toml

USER appuser

CMD ["python", "src/agent.py", "start"]
