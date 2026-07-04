from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_config
from app.models.schemas import HealthResponse
from app.services.llm.factory import get_llm
from app.services.voice.stt.factory import get_stt
from app.routers import chat, voice, skills


@asynccontextmanager
async def lifespan(app: FastAPI):
    config = get_config()
    if config.get("stt", {}).get("provider", "whisper") == "whisper":
        try:
            get_stt()
            from app.services.voice.stt.whisper import warmup_whisper_model

            warmup_whisper_model()
        except Exception as exc:
            print(f"Whisper warmup skipped: {exc}")
    yield


app = FastAPI(
    title="IELTS AI Learning API",
    description="Offline-first IELTS tutor with voice, configurable accents, and pluggable LLM engines.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(voice.router)
app.include_router(skills.router)


@app.get("/health", response_model=HealthResponse)
async def health():
    config = get_config()
    llm = get_llm()
    ollama_ok = await llm.is_available()
    return HealthResponse(
        status="ok" if ollama_ok else "degraded",
        llm_provider=config.get("llm", {}).get("provider", "ollama"),
        llm_model=config.get("llm", {}).get("model", "llama3.2"),
        ollama_available=ollama_ok,
    )


@app.get("/")
async def root():
    return {"message": "IELTS AI Learning API", "docs": "/docs"}
