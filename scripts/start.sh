#!/usr/bin/env bash
# Pull Docker Hub images and start the stack (no local builds).
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

echo "==> Pulling images from Docker Hub…"
if [[ "$FULL" -eq 1 ]]; then
  docker compose --profile full pull
  echo "==> Starting full stack…"
  exec docker compose --profile full up "${ARGS[@]}"
else
  docker compose pull
  echo "==> Starting stack (llama3.2). Use --full for all models."
  exec docker compose up "${ARGS[@]}"
fi
