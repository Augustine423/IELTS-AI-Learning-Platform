#!/usr/bin/env bash
# Start IELTS AI stack (LiveKit-first by default — no big Ollama).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f "$ROOT/.env" && -f "$ROOT/.env.example" ]]; then
  cp "$ROOT/.env.example" "$ROOT/.env"
  echo "==> Created .env from .env.example — fill LIVEKIT_* and GROQ_API_KEY"
fi

FULL=0
OLLAMA=0
ARGS=()
for a in "$@"; do
  if [[ "$a" == "--full" || "$a" == "full" ]]; then
    FULL=1
  elif [[ "$a" == "--ollama" || "$a" == "ollama" ]]; then
    OLLAMA=1
  else
    ARGS+=("$a")
  fi
done

if [[ "$FULL" -eq 1 ]]; then
  echo "==> Pulling Hub images (full Ollama + app)…"
  docker compose --profile full pull
  echo "==> Starting full stack (all Ollama models + LiveKit agent)…"
  exec docker compose --profile full up --build "${ARGS[@]}"
elif [[ "$OLLAMA" -eq 1 ]]; then
  echo "==> Pulling Hub images (llama3.2 + app)…"
  docker compose --profile ollama pull
  echo "==> Starting LiveKit + llama3.2…"
  exec docker compose --profile ollama up --build "${ARGS[@]}"
else
  echo "==> Pulling app images (LiveKit-first, no Ollama)…"
  docker compose pull backend frontend || true
  echo "==> Starting frontend + backend + livekit-agent…"
  echo "    Tip: add --ollama or --full if you need local models."
  exec docker compose up --build "${ARGS[@]}"
fi
