# IELTS AI Learning Platform

An offline-first IELTS tutor with voice conversation, configurable accents (UK / US / Australian), and support for all four skills: **Listening**, **Speaking**, **Reading**, and **Writing**.

> **Quickest path:** Install [Ollama](https://ollama.com) + [Docker Desktop](https://www.docker.com/products/docker-desktop/) → pull a free model → `docker compose up` → open http://localhost:3000

---

## Stack Recommendations (Why These Choices)

### LLM Engine — **LangChain + Ollama (primary)**

| Option | Cost | Best for | Verdict |
|--------|------|----------|---------|
| **Ollama** (free local models) | Free, offline | Writing feedback, reading Q&A, speaking prompts | **Primary choice** |
| Ollama cloud models (`:cloud` tag) | Free, online | No GPU / no disk space — runs on Ollama's servers | **Easiest setup** |
| Groq (Llama 3) | Free tier online | Fast fallback when Ollama is slow | Optional online |
| OpenRouter | Pay-per-use | Future premium models | Plug-in ready |

**Why LangChain over LlamaIndex?** LangChain excels at multi-provider LLM switching and conversational agents. LlamaIndex is better for document RAG — use it later if you add IELTS passage libraries.

### Speech-to-Text (STT)

| Provider | Cost | Offline? | Verdict |
|----------|------|----------|---------|
| **faster-whisper** | **100% free** | **Yes** | **Default — no API key needed** |
| Deepgram Nova-2 | $200 free credit | No | Optional online upgrade |
| AssemblyAI | Free tier | No | Optional online alternative |

### Text-to-Speech (TTS)

| Provider | Cost | UK/US/AU accents | Verdict |
|----------|------|------------------|---------|
| **ElevenLabs** | Limited free tier | Yes (premium quality) | Best quality when online |
| **Edge TTS** (Microsoft) | **100% free** | Yes — en-GB, en-US, en-AU | **Default offline TTS** |
| Piper TTS | Free | Limited | Fully offline alternative |

**Voice mapping (Edge TTS — free):**

| Accent | Female | Male |
|--------|--------|------|
| UK | `en-GB-SoniaNeural` | `en-GB-RyanNeural` |
| US | `en-US-JennyNeural` | `en-US-GuyNeural` |
| Australian | `en-AU-NatashaNeural` | `en-AU-WilliamNeural` |

### Frontend — **Next.js 15 + Vercel AI SDK**

Streaming chat UI, audio recording, and accent/voice preferences. Talks to FastAPI via REST + SSE.

### Backend — **FastAPI + LangChain**

Pluggable LLM, STT, and TTS providers via a factory pattern. Add new engines in `config.yaml` without code changes.

---

## Quick Start (Recommended — Docker)

The fastest way to get the app running. Uses **your local Ollama** (not an in-container one) so you stay in control of models, GPU usage, and storage.

### Prerequisites

1. **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** — installed and running
2. **[Ollama](https://ollama.com/download)** — installed and running (`ollama serve`)

### 1. Pull a free model

Pick **one** of the free models below. If you don't know which, start with the recommended option:

```bash
# Recommended — small, fast, runs anywhere (incl. CPU)
ollama pull llama3.2

# Better IELTS writing feedback (heavier, ~4.7 GB)
ollama pull qwen2.5:7b

# Or use Ollama's free cloud model (no download, needs internet)
# Already works if you've signed in to ollama.com once
ollama pull nemotron-3-super:cloud
```

### 2. Start the app

```bash
docker compose up
```

First run will pull images from Docker Hub (~200 MB total). After that it starts in seconds.

Open:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API docs:** http://localhost:8000/docs

### 3. Stop the app

```bash
docker compose down
```

The app talks to your host's Ollama via `host.docker.internal:11434` (set in `docker/config.yaml`).

---

## Quick Start (Development — No Docker)

If you want to hack on the code:

### Prerequisites

- Python 3.11+
- Node.js 20+
- [Ollama](https://ollama.com) with a model pulled (see above)

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env       # Add API keys if using online services
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

Open **http://localhost:3000**

---

## Free Ollama Models (Tested with IELTS)

All models below are **free**. The first two run **locally** on your machine (need RAM/disk). The cloud models need internet but no GPU/disk.

### Local models

| Model | Size | RAM needed | Best for | Command |
|-------|------|------------|----------|---------|
| **llama3.2** ⭐ | 2.0 GB | ~4 GB | General IELTS work, low-end hardware | `ollama pull llama3.2` |
| **llama3.2:3b** | 2.0 GB | ~4 GB | Same as above, smaller variant | `ollama pull llama3.2:3b` |
| **qwen2.5:7b** | 4.7 GB | ~8 GB | **Writing feedback** (best open model for essay grading) | `ollama pull qwen2.5:7b` |
| **mistral** | 4.1 GB | ~8 GB | Reading comprehension, Q&A | `ollama pull mistral` |
| **gemma2:9b** | 5.4 GB | ~10 GB | Balanced writing + speaking | `ollama pull gemma2:9b` |
| **phi3:medium** | 7.9 GB | ~12 GB | Strong reasoning, good for Speaking prompts | `ollama pull phi3:medium` |
| **llama3.1:8b** | 4.7 GB | ~8 GB | General, good fallback | `ollama pull llama3.1:8b` |

### Cloud models (no download, needs Ollama account)

| Model | Hosted by | Notes |
|-------|-----------|-------|
| **nemotron-3-super:cloud** ⭐ | NVIDIA / Ollama | 49B params, 262k context, no download |
| **deepseek-v3.1:cloud** | DeepSeek / Ollama | 671B params, very strong writing feedback |

Cloud models are accessed through Ollama's free tier and require `ollama signin` once. They are listed automatically by `ollama list` once pulled.

### How to switch models

1. Edit `docker/config.yaml` (Docker) or `backend/config.yaml` (dev):
   ```yaml
   llm:
     provider: ollama
     model: qwen2.5:7b          # ← change to any model from the table
     base_url: http://localhost:11434
   ```
2. Restart the backend:
   ```bash
   docker compose restart backend
   ```

### Checking what's installed

```bash
ollama list
```

Shows all locally-pulled models. To remove one:

```bash
ollama rm llama3.2
```

---

## Configuration

Edit `backend/config.yaml` (or `docker/config.yaml` for the Docker setup) to switch providers:

```yaml
llm:
  provider: ollama          # ollama | openai_compatible | groq
  model: llama3.2
  base_url: http://localhost:11434

stt:
  provider: whisper         # whisper | deepgram | assemblyai
  model: base               # whisper: tiny | base | small | medium
  language: en

tts:
  provider: edge            # edge | elevenlabs
```

Environment variables (`.env`) override secrets:

```
OLLAMA_BASE_URL=http://localhost:11434
# Optional — only needed if you switch away from free defaults
DEEPGRAM_API_KEY=
ASSEMBLYAI_API_KEY=
ELEVENLABS_API_KEY=
OPENAI_API_KEY=              # for openai_compatible / groq
```

### How the backend finds your Ollama

The backend (running in Docker) reaches Ollama on your **host machine** using `host.docker.internal`. This works on Windows and macOS out of the box. On Linux you may need `--add-host=host.docker.internal:host-gateway` in the backend's `docker run` command, or replace it with `172.17.0.1` in `docker/config.yaml`.

---

## Project Structure

```
IELTS AI Model/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry
│   │   ├── config.py            # YAML + env config loader
│   │   ├── routers/             # API routes
│   │   └── services/
│   │       ├── llm/             # Ollama, OpenAI-compatible
│   │       ├── voice/           # STT + TTS providers
│   │       └── ielts/           # Skill-specific prompts
│   ├── config.yaml
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── app/                 # Next.js pages
│       ├── components/          # UI components
│       └── lib/                 # API client
├── k8s/                         # Kubernetes manifests
├── .github/workflows/           # CI/CD pipelines
└── docker-compose.yml
```

---

## IELTS Skills

| Skill | Features |
|-------|----------|
| **Listening** | AI reads passages aloud (TTS), comprehension questions |
| **Speaking** | Voice conversation, fluency & pronunciation feedback |
| **Reading** | Passage analysis, vocabulary, inference questions |
| **Writing** | Essay review with band-score-style feedback (TA, CC, LR, GRA) |

---

## Adding a New LLM Provider

1. Create `backend/app/services/llm/your_provider.py` implementing `BaseLLM`.
2. Register in `backend/app/services/llm/factory.py`.
3. Add to `config.yaml` under `llm.provider`.

No frontend changes required.

---

## Docker

Pre-built images are on Docker Hub (built by GitHub Actions). The default `docker-compose.yml` runs **backend + frontend** and uses your **local Ollama** for the LLM (no Ollama in Docker).

```bash
docker compose up      # start
docker compose down    # stop
docker compose logs -f # follow logs
```

Images used:
- `kyawzayarsoe/ielts-ai-backend:latest`
- `kyawzayarsoe/ielts-ai-frontend:latest`

To build images locally instead (optional):

```bash
docker build -t kyawzayarsoe/ielts-ai-backend ./backend
docker build -t kyawzayarsoe/ielts-ai-frontend --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 ./frontend
```

### Troubleshooting Docker

- **Backend keeps restarting / health check fails:** Check `docker compose logs backend`. Usually it's the model name in `docker/config.yaml` not matching `ollama list`.
- **Speaking transcription slow on first use:** Whisper downloads the `base` model (~150 MB) on first STT request. Use `stt.model: tiny` in config for faster/lighter transcription.
- **`host.docker.internal` not resolving (Linux):** Use `172.17.0.1` instead, or run Ollama in Docker (see notes below).
- **Want to use Ollama in Docker instead of local?** Uncomment the `ollama` and `ollama-pull` services in `docker-compose.yml`, then set `base_url: http://ollama:11434` in `docker/config.yaml`.

---

## GitHub Actions → Docker Hub

Workflow: `.github/workflows/docker-build-push.yml`

**Required GitHub secret:**

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_TOKEN` | Docker Hub access token ([create here](https://hub.docker.com/settings/security)) |

Docker Hub username is set to `kyawzayarsoe` in the workflow.

**Optional GitHub variable:**

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Public backend URL baked into frontend image (e.g. `https://api.ielts.example.com`) |

Images pushed to:

- `kyawzayarsoe/ielts-ai-backend:latest`
- `kyawzayarsoe/ielts-ai-frontend:latest`

---

## Kubernetes Deployment

Manifests live in `k8s/`.

1. Update `k8s/secret.yaml` with your API keys (or create via kubectl).
2. Update hostnames in `k8s/ingress.yaml` (`ielts.example.com`, `api.ielts.example.com`).

Deploy:

```bash
kubectl apply -k k8s/
```

Verify:

```bash
kubectl get pods -n ielts-ai
kubectl get ingress -n ielts-ai
```

**Note:** For offline LLM, deploy Ollama separately in the cluster and point `config.yaml` / `OLLAMA_BASE_URL` to that service.

---

## License

MIT — built for personal IELTS learning.
