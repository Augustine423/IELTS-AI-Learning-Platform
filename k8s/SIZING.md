# Recommended server / node sizes for IELTS AI
# (CPU inference — no GPU required; GPU optional for faster Ollama)

## Docker Compose (single server)

| Profile | vCPU | RAM | Disk | Runs |
|---------|------|-----|------|------|
| **Minimum** (`compose up`) | 4 | **16 GB** | 40 GB SSD | frontend + backend + llama3.2 |
| **Comfortable** | 8 | **32 GB** | 80 GB SSD | same, smoother Whisper + chat |
| **Full** (`--profile full`) | 8–16 | **48–64 GB** | 120 GB SSD | all 4 Ollama model containers |

Notes:
- Image pull size alone: ~4 GB (min) or ~22 GB (full) before runtime RAM.
- Each Ollama container keeps its model in RAM while running (~4–12 GB each).
- Backend ~slim image / ~1–2 GB RAM (Whisper). Frontend is alpine + Node only (browse via host port 80).

Example VPS: **8 vCPU / 32 GB RAM / 80 GB** for default; **16 vCPU / 64 GB** for full.

---

## Kubernetes nodes

| Deploy | Worker nodes | Per-node spec | What to apply |
|--------|--------------|---------------|---------------|
| **Minimum** | 1–2 | **4 vCPU / 16 GB** (prefer 8/32) | `kubectl apply -k k8s/` |
| **Full auto skills** | 1 large or 2–3 | **8+ vCPU / 48–64 GB** total cluster RAM free for models | `kubectl apply -k k8s/` then `kubectl apply -f k8s/ollama-full.yaml` |

Pod RAM requests (approx):
| Pod | Request | Limit |
|-----|---------|-------|
| frontend (×2) | 256Mi | 512Mi |
| backend (×2) | 1Gi | 2Gi |
| ollama-llama32 | 4Gi | 8Gi |
| ollama-llama31 | 8Gi | 12Gi |
| ollama-qwen25 | 8Gi | 12Gi |
| ollama-gemma2 | 10Gi | 14Gi |

Full stack scheduled RAM ≈ **frontend+backend ~5Gi** + **models ~30Gi** → plan **~48 GB+** allocatable on the cluster.

GPU: optional (NVIDIA). Not required; helps large models if you add device plugins later.
