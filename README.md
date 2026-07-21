# IELTS LiveKit Voice Agent

Realtime voice AI tutor for IELTS Speaking, Listening, Reading, and Writing, built on [LiveKit Agents](https://github.com/livekit/agents) (Python) and the [agent-starter-react](https://github.com/livekit-examples/agent-starter-react) web UI.

## What you get

- **General voice assistant** — natural conversation
- **IELTS practice** — Speaking, Listening, Reading, and Writing with AI coaching
- **Tutor voices** — male or female with UK, US, or Australian pronunciation
- **Web UI** — audio visualizer, chat transcript, mic controls (no camera), light/dark theme

## Project structure

```
IELTS-LIVEKIT/
├── agent/              # Python LiveKit voice agent
├── web/                # Next.js frontend
├── docker-compose.yml  # Run both services together
└── .env.example        # Shared environment template
```

## Run with Docker (recommended)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose)

### 1. Configure environment

Copy the example env file and add your LiveKit Cloud credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
AGENT_NAME=ielts-voice-agent
WEB_PORT=3000
```

### 2. Pull and start (Docker Hub images)

```bash
docker compose pull
docker compose up -d
```

### 3. Test in the browser

Open [http://localhost:3000](http://localhost:3000), allow microphone access, then choose:

- **Talk to assistant** — general voice AI
- **IELTS Speaking practice** — exam-style speaking tutor

### Useful Docker commands

```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Pin a CI tag (default: latest)
IMAGE_TAG=sha-8f706f7 docker compose up -d
```

GitHub Actions publishes:

- `kyawzayarsoe/ielts-ai-livekit-web`
- `kyawzayarsoe/ielts-ai-livekit-agent`

## Services

| Service | Description | Port |
|---------|-------------|------|
| `agent` | Python LiveKit voice worker | — |
| `web` | Next.js UI + token API | `3000` (configurable via `WEB_PORT`) |

The agent connects to your LiveKit Cloud project and joins rooms when the web app starts a session.

## Manual setup (without Docker)

### Prerequisites

- Python 3.10+ and [uv](https://docs.astral.sh/uv/)
- Node.js 20+ and pnpm
- LiveKit Cloud project

### Agent

```bash
cd agent
cp .env.example .env.local   # add your credentials
uv sync
uv run python src/agent.py download-files
uv run python src/agent.py dev
```

### Web

```bash
cd web
cp .env.example .env.local   # add your credentials + AGENT_NAME
pnpm install
pnpm dev
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `LIVEKIT_URL` | Yes | WebSocket URL from LiveKit Cloud |
| `LIVEKIT_API_KEY` | Yes | LiveKit API key |
| `LIVEKIT_API_SECRET` | Yes | LiveKit API secret |
| `AGENT_NAME` | Web only | Must be `ielts-voice-agent` (matches Python agent) |
| `WEB_PORT` | No | Host port for web UI (default `3000`) |

## References

- https://github.com/livekit/agents
- https://github.com/livekit-examples/agent-starter-python
- https://github.com/livekit-examples/agent-starter-react
- https://docs.livekit.io/agents/start/voice-ai/
