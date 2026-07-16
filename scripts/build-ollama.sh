#!/usr/bin/env bash
# Build separate per-model Ollama images (shared multi-stage base).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

TARGET="${1:-all}"
OFFLINE_BUILD="${OFFLINE_BUILD:-0}"
if [[ "${1:-}" == "--offline" ]]; then
  OFFLINE_BUILD=1
  TARGET="${2:-all}"
fi
export OFFLINE_BUILD

case "$TARGET" in
  llama32) SERVICES=(ollama-llama32) ;;
  llama31) SERVICES=(ollama-llama31) ;;
  qwen25)  SERVICES=(ollama-qwen25) ;;
  gemma2)  SERVICES=(ollama-gemma2) ;;
  all|*)   SERVICES=(ollama-llama32 ollama-llama31 ollama-qwen25 ollama-gemma2) ;;
esac

echo "==> Building separate Ollama images: ${SERVICES[*]}"
echo "    Offline: $OFFLINE_BUILD"

if [[ "$TARGET" == "llama32" ]]; then
  docker compose build "${SERVICES[@]}"
else
  docker compose --profile full build "${SERVICES[@]}"
fi

echo "==> Done. Quick: docker compose up"
echo "    Full:  docker compose --profile full up"
