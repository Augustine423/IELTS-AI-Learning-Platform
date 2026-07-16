# IELTS AI Learning Platform

Offline-first IELTS tutor for **Listening**, **Speaking**, **Reading**, and **Writing** — situational dialogues, live voice practice, and UK / US / Australian accents.

```
Browser → Frontend (:80) → Backend API (:8000)
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
   ollama-llama32          ollama-llama31           ollama-qwen25 …
   (llama3.2)              (llama3.1:8b)            (qwen2.5:7b)
   always on               profile: full            profile: full
```

Separate **Ubuntu + Ollama** images (not the official `ollama/ollama` image) — one model per image so builds stay smaller.

> **Quick start:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) → `.\scripts\start.ps1` → http://localhost  
> Compose **only pulls** images from Docker Hub (built by GitHub Actions). Default = `llama3.2`. All models: `.\scripts\start.ps1 --full`

---

## Requirements

| Need | Notes |
|------|--------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Required |
| RAM / disk | See **warning** below — Ollama images are large |
| Internet | To **pull** images from Docker Hub (first run) |

No host Ollama install required.

> **Warning — image size & server RAM**  
> Backend (~slim FastAPI) and frontend (~alpine Node) are small. **Ollama model images are still multi-GB each** because each embeds a full local LLM — that is expected. CPU-only Ollama builds strip GPU runners (`INCLUDE_GPU=0`) to avoid shipping CUDA/ROCm.  
>  
> | Deploy | vCPU | RAM | Disk | Notes |
> |--------|------|-----|------|--------|
> | **Docker minimum** (`compose up`) | 4 | **16 GB** | 40 GB | llama3.2 only |
> | **Docker comfortable** | 8 | **32 GB** | 80 GB | Recommended default VPS |
> | **Docker full** (`--full`) | 8–16 | **48–64 GB** | 120 GB | All 4 model containers |
> | **K8s minimum** | 4–8 / node | **16–32 GB** free | — | `kubectl apply -k k8s/` |
> | **K8s full** | 8+ | **~48–64 GB+** cluster | — | Also `kubectl apply -f k8s/ollama-full.yaml` |
>  
> Each running Ollama pod/container holds its model in RAM (~4–12 GB). Do **not** run `--full` / `ollama-full.yaml` on a 8–16 GB machine.  
> Full sizing notes: [k8s/SIZING.md](k8s/SIZING.md).

---

## Quick start (Docker — pull from Hub)

Images are built & pushed by GitHub Actions. Local Compose does **not** build.

### Default (small — `llama3.2` only)

**Windows**
```powershell
.\scripts\start.ps1
```

**Linux / macOS**
```bash
chmod +x scripts/*.sh
./scripts/start.sh
```

Same as:
```bash
docker compose pull
docker compose up
```

### Full stack (all four models)

```powershell
.\scripts\start.ps1 --full
```

```bash
./scripts/start.sh --full
# or:
docker compose --profile full pull
docker compose --profile full up
```

| Service | URL |
|---------|-----|
| App | http://localhost |
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

## Offline / custom image builds (optional)

Normal use is **pull from Hub**. Dockerfiles remain for CI and local rebuilds only.

If you must bake offline (GGUF), use `scripts/build-ollama.*` / `import-model-offline.*` — that is separate from the default Compose pull flow.

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

Open http://localhost for Docker / container deploys, or http://localhost:3000 when running `npm run dev`

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
├── docker-compose.yml       # Pull-only from Docker Hub (+ profile full)
└── .env.example
```

---

## Docker images & Compose

`docker-compose.yml` is **pull-only** (`pull_policy: always`) — no local `build:`.

| Image on Docker Hub | Role |
|---------------------|------|
| `kyawzayarsoe/ielts-ai-ollama-llama32` | `llama3.2` |
| `kyawzayarsoe/ielts-ai-ollama-llama31` | `llama3.1:8b` |
| `kyawzayarsoe/ielts-ai-ollama-qwen25` | `qwen2.5:7b` |
| `kyawzayarsoe/ielts-ai-ollama-gemma2` | `gemma2:9b` |
| `kyawzayarsoe/ielts-ai-backend` | FastAPI + Whisper |
| `kyawzayarsoe/ielts-ai-frontend` | Next.js |

```bash
docker compose pull && docker compose up
docker compose --profile full pull && docker compose --profile full up
```

CI builds from `docker/ollama/Dockerfile` and pushes these tags. Compose only pulls them.

**Image size notes (slim builds):**
- Frontend: alpine + Node binary only (no npm/yarn); container listens on **8080**, host/k8s browse on **:80**
- Backend: venv multi-stage + cleaned caches; Whisper `tiny` pre-baked
- Ollama: CPU-only runners by default (`INCLUDE_GPU=0`); bake stage discarded; weights + binary only in final image
- Model images are still multi-GB because of LLM weights — that part cannot be shrunk without a smaller model

**SBOM:** each image embeds SPDX at `/sbom/sbom.spdx.json`. CI also attaches BuildKit SBOM attestations (`--sbom=true`).

```bash
# Inspect embedded SBOM inside a running/local image
docker run --rm --entrypoint cat kyawzayarsoe/ielts-ai-frontend:latest /sbom/sbom.spdx.json | head
```

**Auto routing:** listening→llama3.2, speaking→llama3.1:8b, reading→gemma2:9b, writing→qwen2.5:7b.  
**Manual:** UI model picker. Missing containers fall back to `llama3.2`.

### Troubleshooting

| Issue | Fix |
|-------|-----|
| First start slow | Large image download from Hub (once) |
| Health degraded | `docker compose pull ollama-llama32 && docker compose up -d` |
| Auto model not used | Run with `--full` so speaking/reading/writing images are pulled |
| Pull fails / 404 | Confirm GitHub Actions pushed images; check Docker Hub tags |
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

# Minimum (frontend + backend + llama3.2)
kubectl apply -k k8s/

# Full auto skill models (needs ~48GB+ cluster RAM)
kubectl apply -f k8s/ollama-full.yaml

kubectl get pods -n ielts-ai
```

Hub images only (`imagePullPolicy: Always`).  

> **Warning:** Full auto-skill deploy needs ~48–64 GB+ cluster RAM. See the [Requirements warning](#requirements) and [k8s/SIZING.md](k8s/SIZING.md).

---

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/start.*` | `docker compose pull` + `up` (`--full` = all models) |
| `scripts/build-ollama.*` | Optional local rebuild (CI/dev only; not used by default start) |
| `scripts/import-model-offline.*` | Optional offline GGUF bake for custom images |

---

## License

MIT — see [LICENSE](LICENSE).
