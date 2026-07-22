# IELTS LiveKit Voice Agent

Realtime voice AI tutor for IELTS Speaking, Listening, and Reading, plus a free local Writing LLM, built on [LiveKit Agents](https://github.com/livekit/agents) and Next.js.

## Skill pages

| Page | Path | Engine |
|------|------|--------|
| Home hub | `/` | — |
| Speaking | `/speaking` | LiveKit voice agent (current) |
| Listening | `/listening` | LiveKit reads a paragraph, then asks questions |
| Reading aloud | `/reading` | You read line by line; AI coaches pronunciation |
| Writing | `/writing` | Free Ollama LLM in Docker (`qwen2.5:3b-instruct`) |

Mic mute/unmute is supported in the session control bar.

## Project structure

```
IELTS-LIVEKIT/
├── agent/              # Python LiveKit voice agent
├── web/                # Next.js frontend (skill pages)
├── docker-compose.yml  # web + agent + ollama
└── .env.example        # Shared environment template
```

## Run with Docker (recommended)

### 1. Configure environment

```bash
cp .env.example .env
```

Fill in LiveKit Cloud credentials. Optional writing model overrides:

```env
OLLAMA_MODEL=qwen2.5:3b-instruct
OLLAMA_BASE_URL=http://ollama:11434
```

### 2. Pull and start

```bash
docker compose pull
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000) and use the skill navigation.

### Useful commands

```bash
docker compose logs -f
docker compose down
IMAGE_TAG=sha-8f706f7 docker compose up -d
```

## CI

GitHub Actions:

- `App Test` — web build, writing API smoke, agent unit tests, compose validation
- `Build and Push Docker Images` — publishes web/agent images

Images:

- `kyawzayarsoe/ielts-ai-livekit-web`
- `kyawzayarsoe/ielts-ai-livekit-agent`
- Writing LLM: official `ollama/ollama` image

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LIVEKIT_URL` | Yes | WebSocket URL from LiveKit Cloud |
| `LIVEKIT_API_KEY` | Yes | LiveKit API key |
| `LIVEKIT_API_SECRET` | Yes | LiveKit API secret |
| `AGENT_NAME` | Web | Must be `ielts-voice-agent` |
| `WEB_PORT` | No | Host port for web UI (default `3000`) |
| `OLLAMA_MODEL` | No | Free writing model (default `qwen2.5:3b-instruct`) |
| `OLLAMA_BASE_URL` | No | Ollama URL inside compose (default `http://ollama:11434`) |

## References

- https://github.com/livekit/agents
- https://docs.livekit.io/agents/start/voice-ai/
- https://ollama.com/library/qwen2.5
