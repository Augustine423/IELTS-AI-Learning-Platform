#!/usr/bin/env bash
# Stage a GGUF for offline Ollama image bake, then rebuild the ollama service.
set -euo pipefail

usage() {
  echo "Usage: $0 <path-to-model.gguf> [model-name]"
  echo "Example: $0 ~/Downloads/Llama-3.2-3B-Instruct-Q4_K_M.gguf llama3.2"
  exit 1
}

[[ $# -lt 1 ]] && usage

GGUF_PATH="$1"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONFIG="${ROOT}/docker/config.yaml"
ENV_FILE="${ROOT}/.env"
MODEL="${2:-${OLLAMA_MODEL:-}}"

if [[ -z "$MODEL" && -f "$CONFIG" ]]; then
  MODEL="$(grep -E '^\s*model:' "$CONFIG" | head -1 | sed -E 's/.*model:\s*//')"
fi
MODEL="${MODEL:-llama3.2}"

[[ -f "$GGUF_PATH" ]] || { echo "ERROR: File not found: $GGUF_PATH"; exit 1; }
[[ "$GGUF_PATH" == *.gguf ]] || { echo "ERROR: Expected a .gguf file"; exit 1; }

MODELS_DIR="${ROOT}/models"
mkdir -p "$MODELS_DIR"
DEST="${MODELS_DIR}/$(basename "$GGUF_PATH")"
cp -f "$GGUF_PATH" "$DEST"

if [[ ! -f "$ENV_FILE" ]]; then
  cp "${ROOT}/.env.example" "$ENV_FILE"
fi

tmp="$(mktemp)"
awk -v model="$MODEL" '
  BEGIN { m=0; o=0 }
  /^OLLAMA_MODEL=/ { print "OLLAMA_MODEL=" model; m=1; next }
  /^OFFLINE_BUILD=/ { print "OFFLINE_BUILD=1"; o=1; next }
  { print }
  END {
    if (!m) print "OLLAMA_MODEL=" model
    if (!o) print "OFFLINE_BUILD=1"
  }
' "$ENV_FILE" > "$tmp" && mv "$tmp" "$ENV_FILE"

echo "==> Staged GGUF for offline bake"
echo "    Source: $GGUF_PATH"
echo "    Dest:   $DEST"
echo "    Name:   $MODEL"
echo ""

export OLLAMA_MODEL="$MODEL"
export OFFLINE_BUILD=1
"$ROOT/scripts/build-ollama.sh" --offline "$MODEL"
