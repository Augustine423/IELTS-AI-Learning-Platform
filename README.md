# IELTS AI Learning Platform

LiveKit Cloud voice tutor for **Listening**, **Speaking**, **Reading**, and **Writing** — situational practice with UK / US / Australian accents.

```
Browser (:80) → Frontend → Backend (:8000) → LiveKit Cloud
                              │                    │
                         Groq/OpenAI chat     livekit-agent
```

> **Quick start:** fill `.env` → `.\scripts\start.ps1` → **http://localhost** → any skill → **LiveKit voice**

Ollama / multi-GB local model images are **not** used on this branch. That stack remains on `main` as a backup.

---

## Requirements

| Need | Notes |
|------|--------|
| Docker Desktop / Engine | For Compose |
| LiveKit Cloud | `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` |
| Groq (recommended) or OpenAI | `GROQ_API_KEY` and/or `OPENAI_API_KEY` |
| RAM | ~4–8 GB is enough (no local LLMs) |

---

## Setup

1. Copy env and fill secrets (never commit real values):

```bash
cp .env.example .env
```

2. Start (pulls Hub images — no local build):

```powershell
.\scripts\start.ps1
```

```bash
chmod +x scripts/*.sh
./scripts/start.sh
```

Same as `docker compose pull && docker compose up`.

| Image on Docker Hub | Role |
|---------------------|------|
| `kyawzayarsoe/ielts-ai-backend` | FastAPI + LiveKit tokens |
| `kyawzayarsoe/ielts-ai-frontend` | Next.js UI (port 80) |
| `kyawzayarsoe/ielts-ai-livekit-agent` | LiveKit Cloud voice agent |

| Service | URL |
|---------|-----|
| App | **http://localhost** |
| API | http://localhost:8000 |
| Docs | http://localhost:8000/docs |

3. Open a skill → **LiveKit voice** → Start LiveKit.

Agent-only (host Python): `.\scripts\start-livekit-agent.ps1`

---

## Stack

| Layer | Tech |
|-------|------|
| Voice rooms | LiveKit Cloud + `livekit-agent` |
| Chat LLM | Groq / OpenAI-compatible |
| TTS | Edge TTS (free accents) |
| Classic mic fallback | Whisper tiny + chat API |
| UI | Next.js (port **80**) |
| API | FastAPI |

---

## Project layout

```
├── agents/ielts_voice/   # LiveKit agent worker
├── backend/              # FastAPI + LiveKit tokens + chat
├── frontend/             # Next.js UI
├── docker/config.yaml    # Runtime config (Groq)
├── k8s/                  # LiveKit-only Kubernetes
├── scripts/start.*       # Compose up
└── docker-compose.yml
```

---

## Kubernetes

Edit `k8s/secret.yaml` with LiveKit + Groq keys, then:

```bash
kubectl apply -k k8s/
```

---

## License

MIT — see [LICENSE](LICENSE).
