from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings, get_config
from app.models.schemas import HealthResponse
from app.services.llm.factory import get_llm
from app.routers import chat, voice, skills

app = FastAPI(
    title="IELTS AI Learning API",
    description="Offline-first IELTS tutor with voice, configurable accents, and pluggable LLM engines.",
    version="1.0.0",
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
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
