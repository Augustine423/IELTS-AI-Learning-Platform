#!/usr/bin/env bash
# Run the LiveKit Cloud IELTS agent (all 4 skills).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/agents/ielts_voice"
if [[ ! -d .venv ]]; then
  python -m venv .venv
  # shellcheck disable=SC1091
  source .venv/bin/activate
  pip install -r requirements.txt
else
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi
set -a
# shellcheck disable=SC1091
source "$ROOT/.env"
set +a
exec python agent.py start
