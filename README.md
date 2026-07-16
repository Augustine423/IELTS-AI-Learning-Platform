# IELTS AI Learning Platform

Offline-first IELTS tutor for **Listening**, **Speaking**, **Reading**, and **Writing** — situational dialogues, live voice practice, and UK / US / Australian accents.

```
Browser → Frontend (:3000) → Backend API (:8000)
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
   ollama-llama32          ollama-llama31           ollama-qwen25 …
   (llama3.2)              (llama3.1:8b)            (qwen2.5:7b)
   always on               profile: full            profile: full
```

Separate **Ubuntu + Ollama** images (not the official `ollama/ollama` image) — one model per image so builds stay smaller.

> **Quick start:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) → `.\scripts\start.ps1` → http://localhost:3000  
> Default = `llama3.2` only. All skill models: `.\scripts\start.ps1 --full`

---

## Requirements

| Need | Notes |
|------|--------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Recommended path |
| ~8 GB RAM | More RAM if you run `--full` (several models) |
| Disk | ~3 GB for default; ~20 GB if you build all four model images |
| Internet | Only for the **first** image build (or offline GGUF bake) |

No host Ollama install required.

---

## Quick start (Docker)

### Default (small — `llama3.2` only)

**Windows**
```powershell
copy .env.example .env
.\scripts\start.ps1
```

**Linux / macOS**
```bash
cp .env.example .env
chmod +x scripts/*.sh docker/ollama/*.sh
./scripts/start.sh
```

### Full stack (all four models — auto skill routing)

```powershell
.\scripts\start.ps1 --full
```

```bash
./scripts/start.sh --full
```

| Service | URL |
|---------|-----|
| App | http://localhost:3000 |
| API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |
| Ollama `llama3.2` | http://localhost:11434 |
| Ollama `llama3.1:8b` | http://localhost:11435 (`--full`) |
| Ollama `qwen2.5:7b` | http://localhost:11436 (`--full`) |
| Ollama `gemma2:9b` | http://localhost:11437 (`--full`) |

Stop:
```bash
docker compose --profile full down   # if you used --full
docker compose down
```

---

## Models (free, local, offline after bake)

| Image | Model | Skill (auto) | ~Size |
|-------|-------|--------------|-------|
| `ielts-ai-ollama-llama32` | `llama3.2` | Listening (+ fallback) | ~2 GB |
| `ielts-ai-ollama-llama31` | `llama3.1:8b` | Speaking | ~5 GB |
| `ielts-ai-ollama-qwen25` | `qwen2.5:7b` | Writing | ~5 GB |
| `ielts-ai-ollama-gemma2` | `gemma2:9b` | Reading | ~6 GB |

All are **free** open-weight models via Ollama. Cloud tags (`*:cloud`) are **not** supported.

### Auto vs manual

| Mode | How |
|------|-----|
| **Auto** (default) | Backend picks the model from the skill map above |
| **Manual** | UI **Model** control → choose any catalog model |
| **Fallback** | If a model container is down, API uses `llama3.2` |

Web enrich (optional checkbox) adds DuckDuckGo study tips to the prompt. Needs network on the **backend**; Ollama itself does not browse the web.

---

## Offline model bake

If `ollama pull` is blocked during image build, place a matching `.gguf` under `models/` (e.g. `llama3.2.gguf`) then:

```powershell
$env:OFFLINE_BUILD=1
.\scripts\build-ollama.ps1 -Target llama32 -Offline
.\scripts\start.ps1
```

Or use the helper (stages GGUF + rebuilds):

```powershell
.\scripts\import-model-offline.ps1 -GgufPath "C:\Downloads\Llama-3.2-3B-Instruct-Q4_K_M.gguf"
```

---

## Stack

| Layer | Default | Notes |
|-------|---------|--------|
| LLM | Custom Ubuntu images + Ollama | One model per image |
| STT | faster-whisper (`tiny` in Docker) | Free, offline |
| TTS | Edge TTS | Free UK / US / AU |
| API | FastAPI + LangChain | Routes to the right Ollama URL |
| UI | Next.js 15 | Scenarios, chat, live dialogue, model picker |

**Edge TTS voices**

| Accent | Female | Male |
|--------|--------|------|
| UK | `en-GB-SoniaNeural` | `en-GB-RyanNeural` |
| US | `en-US-JennyNeural` | `en-US-GuyNeural` |
| Australian | `en-AU-NatashaNeural` | `en-AU-WilliamNeural` |

Each skill page: **scenario picker** → **Chat** or **Live dialogue** → optional **web enrich** + **Auto/Manual model**.

---

## Configuration

| File | Purpose |
|------|---------|
| `.env` | `OFFLINE_BUILD` for image builds |
| `docker/config.yaml` | Skill→model map + per-model **endpoints** (Compose) |
| `backend/config.yaml` | Same for local dev (host ports 11434–11437) |
| `backend/.env` | Optional paid API keys |

Example (`docker/config.yaml`):

```yaml
llm:
  provider: ollama
  model: llama3.2
  base_url: http://ollama-llama32:11434
  selection_mode: auto
  models:
    catalog: [llama3.2, qwen2.5:7b, llama3.1:8b, gemma2:9b]
    by_skill:
      listening: llama3.2
      speaking: llama3.1:8b
      reading: gemma2:9b
      writing: qwen2.5:7b
    endpoints:
      llama3.2: http://ollama-llama32:11434
      llama3.1:8b: http://ollama-llama31:11434
      qwen2.5:7b: http://ollama-qwen25:11434
      gemma2:9b: http://ollama-gemma2:11434
```

---

## Local development

Start at least the default Ollama container:

```bash
docker compose up ollama-llama32 -d
# or: docker compose --profile full up -d
```

**Backend**
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000

---

## Project layout

```
├── backend/                 # FastAPI — routes chat to the correct Ollama URL
├── frontend/                # Next.js UI + proxy
├── docker/
│   ├── config.yaml          # Mounted into backend
│   └── ollama/              # Multi-stage Dockerfile (base + one model)
├── models/                  # Optional .gguf for offline bake
├── scripts/                 # start / build-ollama / import-model-offline
├── k8s/                     # Kubernetes (llama32 by default)
├── .github/workflows/       # Build & push all images to Docker Hub
├── docker-compose.yml       # Separate Ollama services + profile full
└── .env.example
```

---

## Docker images & Compose

Multi-stage file: `docker/ollama/Dockerfile`

| Target | Role |
|--------|------|
| `ollama-base` | Ubuntu + Ollama binary (shared cache) |
| `ollama-model` | Base + **one** baked model (`BAKE_MODEL`) |

```bash
docker compose up --build                    # llama3.2 only
docker compose --profile full up --build     # all four model containers
.\scripts\build-ollama.ps1 -Target all       # rebuild all model images
.\scripts\build-ollama.ps1 -Target qwen25    # rebuild writing image only
```

Also: `ielts-ai-backend`, `ielts-ai-frontend`.

### Troubleshooting

| Issue | Fix |
|-------|-----|
| First start slow | Model bake downloads once; later starts reuse the image |
| Health degraded | `docker compose up ollama-llama32 -d` then restart backend |
| Auto model not used | Run with `--full` so speaking/reading/writing containers exist |
| `ollama pull` blocked | [Offline model bake](#offline-model-bake) |
| Speaking STT slow | Whisper `tiny` is pre-baked in the backend image |

---

## GitHub Actions → Docker Hub

Workflow: [`.github/workflows/docker-build-push.yml`](.github/workflows/docker-build-push.yml)

Builds and pushes images on **push to `main`/`master`**, **version tags `v*`**, or **manual run**.

| Job | Images |
|-----|--------|
| Backend | `kyawzayarsoe/ielts-ai-backend` |
| Frontend | `kyawzayarsoe/ielts-ai-frontend` |
| Ollama (matrix × 4) | `…-ollama-llama32`, `…-llama31`, `…-qwen25`, `…-gemma2` |

| Event | Backend / Frontend | Ollama (4 images) |
|-------|--------------------|-------------------|
| Pull request | Build only (no push) | Skipped* |
| Push `main` / tags / manual | Build + push | Build + push |

\*Add PR label `build-ollama` to also build Ollama images on a PR.

**Required secret:** `DOCKERHUB_TOKEN` (Docker Hub access token)  
**Optional variable:** `DOCKERHUB_USERNAME` (default `kyawzayarsoe`)

**Manual run inputs:** `skip_ollama`, `platforms` (default `linux/amd64`).

Pull after CI:

```bash
docker pull kyawzayarsoe/ielts-ai-backend:latest
docker pull kyawzayarsoe/ielts-ai-frontend:latest
docker pull kyawzayarsoe/ielts-ai-ollama-llama32:latest
docker pull kyawzayarsoe/ielts-ai-ollama-llama31:latest
docker pull kyawzayarsoe/ielts-ai-ollama-qwen25:latest
docker pull kyawzayarsoe/ielts-ai-ollama-gemma2:latest
```

---

## Kubernetes

```bash
# Edit k8s/ingress.yaml and k8s/secret.yaml first
kubectl apply -k k8s/
kubectl get pods -n ielts-ai
```

Default manifests deploy **`ollama-llama32`**. Extra model services (`ollama-llama31`, `ollama-qwen25`, `ollama-gemma2`) can be added to match `llm.models.endpoints` in the ConfigMap.

---

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/start.*` | Build + `docker compose up` (`--full` = all models) |
| `scripts/build-ollama.*` | Rebuild one or all Ollama images (`-Target llama32\|qwen25\|…\|all`) |
| `scripts/import-model-offline.*` | Stage GGUF → offline bake |

---

## License

MIT — see [LICENSE](LICENSE).
