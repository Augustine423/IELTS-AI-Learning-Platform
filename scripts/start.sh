#!/usr/bin/env bash
# Build default (llama3.2) or full model set, then start.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f "$ROOT/.env" && -f "$ROOT/.env.example" ]]; then
  cp "$ROOT/.env.example" "$ROOT/.env"
fi

FULL=0
ARGS=()
for a in "$@"; do
  if [[ "$a" == "--full" || "$a" == "full" ]]; then
    FULL=1
  else
    ARGS+=("$a")
  fi
done

echo "==> Building Ollama image(s)…"
if [[ "$FULL" -eq 1 ]]; then
  docker compose --profile full build ollama-llama32 ollama-llama31 ollama-qwen25 ollama-gemma2
  echo "==> Starting full stack…"
  exec docker compose --profile full up "${ARGS[@]}"
else
  docker compose build ollama-llama32
  echo "==> Starting stack (llama3.2 only). Use --full for all models."
  exec docker compose up "${ARGS[@]}"
fi
