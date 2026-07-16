#!/usr/bin/env bash
# Pull Docker Hub images and start the LiveKit-only stack (no local builds).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f "$ROOT/.env" && -f "$ROOT/.env.example" ]]; then
  cp "$ROOT/.env.example" "$ROOT/.env"
  echo "==> Created .env — fill LIVEKIT_* and GROQ_API_KEY"
fi

echo "==> Pulling kyawzayarsoe/ielts-ai-* images from Docker Hub…"
docker compose pull
echo "==> Starting frontend + backend + livekit-agent…"
exec docker compose up "$@"
