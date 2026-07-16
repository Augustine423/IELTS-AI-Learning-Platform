"""Resolve which Ollama model + endpoint to use for a chat request."""

from __future__ import annotations

from typing import Literal

from app.config import get_config

SelectionMode = Literal["auto", "manual"]

DEFAULT_CATALOG = [
    "llama3.2",
    "qwen2.5:7b",
    "llama3.1:8b",
    "gemma2:9b",
]

DEFAULT_BY_SKILL = {
    "listening": "llama3.2",
    "speaking": "llama3.1:8b",
    "reading": "gemma2:9b",
    "writing": "qwen2.5:7b",
}

# Separate containers — one model image each (see docker-compose.yml).
DEFAULT_ENDPOINTS = {
    "llama3.2": "http://ollama-llama32:11434",
    "llama3.1:8b": "http://ollama-llama31:11434",
    "qwen2.5:7b": "http://ollama-qwen25:11434",
    "gemma2:9b": "http://ollama-gemma2:11434",
}


def get_model_catalog() -> list[str]:
    cfg = get_config().get("llm", {})
    models = cfg.get("models") or {}
    catalog = models.get("catalog") or cfg.get("catalog") or DEFAULT_CATALOG
    return [str(m).strip() for m in catalog if str(m).strip()]


def get_skill_models() -> dict[str, str]:
    cfg = get_config().get("llm", {})
    models = cfg.get("models") or {}
    by_skill = models.get("by_skill") or DEFAULT_BY_SKILL
    return {str(k): str(v) for k, v in by_skill.items()}


def get_model_endpoints() -> dict[str, str]:
    cfg = get_config().get("llm", {})
    models = cfg.get("models") or {}
    endpoints = models.get("endpoints") or DEFAULT_ENDPOINTS
    return {str(k): str(v).rstrip("/") for k, v in endpoints.items()}


def get_fallback_model() -> str:
    cfg = get_config().get("llm", {})
    return str(cfg.get("model") or DEFAULT_CATALOG[0])


def get_default_base_url() -> str:
    from app.config import get_settings

    settings = get_settings()
    cfg = get_config().get("llm", {})
    return (settings.ollama_base_url or "").strip() or cfg.get(
        "base_url", "http://localhost:11434"
    )


def resolve_model(
    skill: str,
    *,
    mode: SelectionMode | str = "auto",
    manual_model: str | None = None,
) -> str:
    """Pick model: manual override if valid, else skill map, else fallback."""
    catalog = get_model_catalog()
    skill_map = get_skill_models()
    fallback = get_fallback_model()

    normalized = (mode or "auto").lower()
    if normalized == "manual" and manual_model:
        name = manual_model.strip()
        if name in catalog or any(
            name == c or name.startswith(f"{c}:") or c.startswith(f"{name}:")
            for c in catalog
        ):
            return name
        if name and not name.endswith(":cloud"):
            return name

    return skill_map.get(skill) or fallback


def resolve_endpoint(model: str) -> str:
    """Map a model name to its dedicated Ollama service URL."""
    endpoints = get_model_endpoints()
    if model in endpoints:
        return endpoints[model]
    # Fuzzy: llama3.2 matches llama3.2:latest key etc.
    for key, url in endpoints.items():
        if model == key or model.startswith(f"{key}:") or key.startswith(f"{model}:"):
            return url
    return get_default_base_url()
