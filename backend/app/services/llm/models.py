"""Resolve chat LLM model name (Groq / OpenAI-compatible)."""

from __future__ import annotations

from app.config import get_config

DEFAULT_MODEL = "llama-3.3-70b-versatile"


def get_fallback_model() -> str:
    cfg = get_config().get("llm", {})
    return str(cfg.get("model") or DEFAULT_MODEL)


def get_skill_models() -> dict[str, str]:
    """Same cloud model for all skills (LiveKit-first stack)."""
    model = get_fallback_model()
    return {
        "listening": model,
        "speaking": model,
        "reading": model,
        "writing": model,
    }


def get_model_catalog() -> list[str]:
    cfg = get_config().get("llm", {})
    models = cfg.get("models") or {}
    catalog = models.get("catalog")
    if catalog:
        return [str(m).strip() for m in catalog if str(m).strip()]
    return [get_fallback_model()]


def resolve_model(
    skill: str,
    *,
    mode: str = "auto",
    manual_model: str | None = None,
) -> str:
    if (mode or "auto").lower() == "manual" and manual_model:
        return manual_model.strip()
    return get_skill_models().get(skill) or get_fallback_model()
