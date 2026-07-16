#!/usr/bin/env bash
# Bake one or more local Ollama models into the image (pull or offline GGUF).
set -euo pipefail

# Comma-separated list — use BAKE_MODELS (not OLLAMA_MODELS; that is Ollama's data dir).
MODELS_CSV="${BAKE_MODELS:-${OLLAMA_BAKE_MODELS:-${OLLAMA_MODEL:-llama3.2}}}"
OFFLINE_BUILD="${OFFLINE_BUILD:-0}"
MODELS_DIR="/tmp/models"

IFS=',' read -r -a MODELS <<< "$MODELS_CSV"

echo "==> Models to bake: ${MODELS[*]}"

for MODEL in "${MODELS[@]}"; do
  MODEL="$(echo "$MODEL" | xargs)"
  [[ -n "$MODEL" ]] || continue
  if [[ "$MODEL" == *:cloud ]]; then
    echo "ERROR: Cloud models (*:cloud) are not supported: $MODEL"
    exit 1
  fi
done

echo "==> Starting Ollama…"
ollama serve &
OLLAMA_PID=$!

cleanup() {
  kill "$OLLAMA_PID" 2>/dev/null || true
  wait "$OLLAMA_PID" 2>/dev/null || true
}
trap cleanup EXIT

echo "==> Waiting for Ollama API..."
ready=0
for _ in $(seq 1 90); do
  if curl -sf "http://127.0.0.1:11434/api/tags" >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done

if [[ "$ready" -ne 1 ]]; then
  echo "ERROR: Ollama did not become ready during image build."
  exit 1
fi

bake_one() {
  local MODEL="$1"
  local SAFE_NAME GGUF

  # Prefer exact-name GGUF: models/llama3.2.gguf or models/qwen2.5-7b.gguf
  SAFE_NAME="$(echo "$MODEL" | tr ':/' '--')"
  GGUF="$(find "$MODELS_DIR" -maxdepth 1 -type f \( -iname "${SAFE_NAME}.gguf" -o -iname "${MODEL}.gguf" \) 2>/dev/null | head -n 1 || true)"

  # Single-GGUF offline fallback when only one model requested
  if [[ -z "$GGUF" && "$OFFLINE_BUILD" == "1" && ${#MODELS[@]} -eq 1 ]]; then
    GGUF="$(find "$MODELS_DIR" -maxdepth 1 -type f -name '*.gguf' 2>/dev/null | head -n 1 || true)"
  fi

  if [[ -n "$GGUF" ]]; then
    local GGUF_NAME
    GGUF_NAME="$(basename "$GGUF")"
    echo "==> Offline bake from GGUF: $GGUF_NAME → $MODEL"
    printf 'FROM ./%s\n' "$GGUF_NAME" > "${MODELS_DIR}/Modelfile"
    (cd "$MODELS_DIR" && ollama create "$MODEL" -f Modelfile)
  elif [[ "$OFFLINE_BUILD" == "1" ]]; then
    echo "ERROR: OFFLINE_BUILD=1 but no matching .gguf for '$MODEL' in models/"
    echo "       Place ${SAFE_NAME}.gguf (or ${MODEL}.gguf) then rebuild."
    exit 1
  else
    echo "==> Pulling model: $MODEL"
    ollama pull "$MODEL"
  fi

  local SIZE
  SIZE="$(ollama list 2>/dev/null | awk -v m="$MODEL" 'NR>1 && $1 ~ "^"m"($|:)" { print $3; exit }')"
  if [[ -z "$SIZE" || "$SIZE" == "-" ]]; then
    echo "ERROR: Model '$MODEL' was not installed as a local model."
    exit 1
  fi
  echo "==> Model '$MODEL' baked successfully ($SIZE)."
}

for MODEL in "${MODELS[@]}"; do
  MODEL="$(echo "$MODEL" | xargs)"
  [[ -n "$MODEL" ]] || continue
  bake_one "$MODEL"
done

echo "==> Installed models:"
ollama list
echo "==> All requested models baked."
