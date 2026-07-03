# IELTS AI Learning Platform

An offline-first IELTS tutor with voice conversation, configurable accents (UK / US / Australian), and support for all four skills: **Listening**, **Speaking**, **Reading**, and **Writing**.

---

## Stack Recommendations (Why These Choices)

### LLM Engine — **LangChain + Ollama (primary)**

| Option | Cost | Best for | Verdict |
|--------|------|----------|---------|
| **Ollama** (`llama3.2`, `qwen2.5:7b`) | Free, offline | Writing feedback, reading Q&A, speaking prompts | **Primary choice** |
| Groq (Llama 3) | Free tier online | Fast fallback when Ollama is slow | Optional online |
| OpenRouter | Pay-per-use | Future premium models | Plug-in ready |

**Why LangChain over LlamaIndex?** LangChain excels at multi-provider LLM switching and conversational agents. LlamaIndex is better for document RAG — use it later if you add IELTS passage libraries.

### Speech-to-Text (STT)

| Provider | Cost | Offline? | Verdict |
|----------|------|----------|---------|
| **Deepgram Nova-2** | $200 free credit | No | **Best accuracy** for speaking practice |
| AssemblyAI | Free tier | No | Good alternative |
| faster-whisper | Free | **Yes** | Offline fallback (install separately) |

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

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- [Ollama](https://ollama.com) installed with a model: `ollama pull llama3.2`

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

### 3. Ollama (offline LLM)

```bash
ollama pull llama3.2
# or for better IELTS writing feedback:
ollama pull qwen2.5:7b
```

---

## Configuration

Edit `backend/config.yaml` to switch providers:

```yaml
llm:
  provider: ollama          # ollama | openai_compatible | groq
  model: llama3.2
  base_url: http://localhost:11434

stt:
  provider: deepgram        # deepgram | assemblyai | whisper

tts:
  provider: edge            # edge | elevenlabs
```

Environment variables (`.env`) override secrets:

```
OLLAMA_BASE_URL=http://localhost:11434
DEEPGRAM_API_KEY=
ASSEMBLYAI_API_KEY=
ELEVENLABS_API_KEY=
OPENAI_API_KEY=              # for openai_compatible / groq
```

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

Pull pre-built images from Docker Hub (built by GitHub Actions) and run:

```bash
docker compose pull
docker compose up
```

Images used:
- `kyawzayarsoe/ielts-ai-backend:latest`
- `kyawzayarsoe/ielts-ai-frontend:latest`

To build images locally instead (optional):

```bash
docker build -t kyawzayarsoe/ielts-ai-backend ./backend
docker build -t kyawzayarsoe/ielts-ai-frontend --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 ./frontend
```

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
