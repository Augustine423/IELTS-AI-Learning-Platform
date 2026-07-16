#!/usr/bin/env bash
# Start LiveKit-only IELTS stack.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f "$ROOT/.env" && -f "$ROOT/.env.example" ]]; then
  cp "$ROOT/.env.example" "$ROOT/.env"
  echo "==> Created .env — fill LIVEKIT_* and GROQ_API_KEY"
fi

echo "==> Starting frontend + backend + livekit-agent…"
exec docker compose up --build "$@"
