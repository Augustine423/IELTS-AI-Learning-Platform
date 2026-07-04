#!/usr/bin/env bash
# Verify Ollama is running and a LOCAL model is installed before starting the app.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG="${ROOT}/docker/config.yaml"
ENV_FILE="${ROOT}/docker/.env"
MODEL="${OLLAMA_MODEL:-}"
OFFLINE="${OFFLINE:-0}"

if [[ "${1:-}" == "--offline" ]]; then
  OFFLINE=1
  shift
fi

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE" 2>/dev/null || true
fi

if [[ -z "$MODEL" && -f "$CONFIG" ]]; then
  MODEL="$(grep -E '^\s*model:' "$CONFIG" | head -1 | sed -E 's/.*model:\s*//')"
fi
MODEL="${MODEL:-llama3.2}"
OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"

echo "==> IELTS AI - local model setup"
echo "    Required model: $MODEL"
echo "    Ollama host:    $OLLAMA_HOST"
[[ "$OFFLINE" == "1" ]] && echo "    Mode:           OFFLINE (skip ollama pull)"

if [[ "$MODEL" == *:cloud ]]; then
  echo ""
  echo "ERROR: Cloud models (e.g. *:cloud) are not supported."
  echo "       Set a local model in docker/config.yaml (default: llama3.2)."
  exit 1
fi

if ! curl -sf "${OLLAMA_HOST}/api/tags" >/dev/null 2>&1; then
  echo ""
  echo "ERROR: Ollama is not reachable at ${OLLAMA_HOST}"
  echo "       Install Ollama and start it: https://ollama.com/download"
  exit 1
fi

has_local_model() {
  ollama list 2>/dev/null | awk -v m="$MODEL" 'NR>1 && $1 ~ "^"m"($|:)" { print $3; exit }'
}

show_offline_help() {
  cat <<EOF

Local model '$MODEL' is not installed.

OFFLINE SETUP (no ollama pull needed):

  Step 1 - Download a GGUF file (use a mirror if Hugging Face is blocked):
    https://hf-mirror.com/bartowski/Llama-3.2-3B-Instruct-GGUF
    File:   Llama-3.2-3B-Instruct-Q4_K_M.gguf  (~2 GB)

  Step 2 - Import into Ollama:
    ./scripts/import-model-offline.sh ~/Downloads/Llama-3.2-3B-Instruct-Q4_K_M.gguf

  Step 3 - Verify (SIZE must NOT be -):
    ollama list

  Step 4 - Start the app:
    ./scripts/start.sh

  Alternative: copy folder from another PC:
    ~/.ollama/models

EOF
}

SIZE="$(has_local_model || true)"
if [[ -n "$SIZE" && "$SIZE" != "-" ]]; then
  echo "==> Local model '$MODEL' is ready ($SIZE)."
  exit 0
fi

if [[ "$OFFLINE" == "1" ]]; then
  show_offline_help
  exit 1
fi

echo ""
echo "Local model '$MODEL' not found. Attempting download..."
echo "(Use --offline or set OFFLINE=1 in docker/.env if pull is blocked.)"
echo ""

if ollama pull "$MODEL"; then
  SIZE="$(has_local_model || true)"
  if [[ -n "$SIZE" && "$SIZE" != "-" ]]; then
    echo "==> Local model '$MODEL' is ready ($SIZE)."
    exit 0
  fi
fi

show_offline_help
exit 1
