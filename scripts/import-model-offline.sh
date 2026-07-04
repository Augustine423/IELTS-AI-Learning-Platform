#!/usr/bin/env bash
# Import a locally downloaded GGUF file into Ollama (no internet needed).
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
MODEL="${2:-${OLLAMA_MODEL:-}}"

if [[ -z "$MODEL" && -f "$CONFIG" ]]; then
  MODEL="$(grep -E '^\s*model:' "$CONFIG" | head -1 | sed -E 's/.*model:\s*//')"
fi
MODEL="${MODEL:-llama3.2}"
OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"

[[ -f "$GGUF_PATH" ]] || { echo "ERROR: File not found: $GGUF_PATH"; exit 1; }
[[ "$GGUF_PATH" == *.gguf ]] || { echo "ERROR: Expected a .gguf file"; exit 1; }

if ! curl -sf "${OLLAMA_HOST}/api/tags" >/dev/null 2>&1; then
  echo "ERROR: Ollama is not running. Install and start Ollama first."
  exit 1
fi

GGUF_DIR="$(cd "$(dirname "$GGUF_PATH")" && pwd)"
GGUF_NAME="$(basename "$GGUF_PATH")"
MODELFILE="${GGUF_DIR}/Modelfile"

echo "FROM ./${GGUF_NAME}" > "$MODELFILE"

echo "==> Importing offline model"
echo "    GGUF:      ${GGUF_DIR}/${GGUF_NAME}"
echo "    Name:      $MODEL"
echo "    Modelfile: $MODELFILE"
echo ""

(cd "$GGUF_DIR" && ollama create "$MODEL" -f Modelfile)

SIZE="$(ollama list 2>/dev/null | awk -v m="$MODEL" 'NR>1 && $1 ~ "^"m"($|:)" { print $3; exit }')"
if [[ -n "$SIZE" && "$SIZE" != "-" ]]; then
  echo ""
  echo "==> Success! Local model '$MODEL' is ready ($SIZE)."
  echo "    Run: ./scripts/start.sh"
else
  echo "ERROR: Import finished but model not found in ollama list."
  exit 1
fi
