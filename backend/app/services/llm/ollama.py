import httpx
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from typing import AsyncIterator

from app.services.llm.base import BaseLLM
from app.services.llm.models import (
    get_fallback_model,
    get_model_endpoints,
    resolve_endpoint,
)
from app.config import get_config


def _to_langchain_messages(messages: list[dict], system_prompt: str = ""):
    lc_messages = []
    if system_prompt:
        lc_messages.append(SystemMessage(content=system_prompt))
    for msg in messages:
        if msg["role"] == "system":
            lc_messages.append(SystemMessage(content=msg["content"]))
        elif msg["role"] == "user":
            lc_messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            lc_messages.append(AIMessage(content=msg["content"]))
    return lc_messages


def _name_matches(installed: str, target: str) -> bool:
    if installed == target or installed.startswith(f"{target}:"):
        return True
    if ":" not in target and installed.split(":", 1)[0] == target:
        return True
    return False


class OllamaLLM(BaseLLM):
    """Routes each model to its own Ollama container (separate Docker images)."""

    def __init__(self):
        config = get_config()
        llm_cfg = config.get("llm", {})
        self.default_model = get_fallback_model()
        self.temperature = llm_cfg.get("temperature", 0.7)
        self.model = self.default_model

    def _base_url_for(self, model: str) -> str:
        return resolve_endpoint(model)

    def _get_client(self, model: str) -> ChatOllama:
        return ChatOllama(
            model=model,
            base_url=self._base_url_for(model),
            temperature=self.temperature,
        )

    async def _fetch_tags(self, base_url: str) -> dict | None:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(f"{base_url}/api/tags", timeout=5.0)
                if resp.status_code != 200:
                    return None
                return resp.json()
        except Exception:
            return None

    def _installed_names(self, tags: dict) -> list[str]:
        return [m.get("name", "") for m in tags.get("models", [])]

    def _is_model_installed(self, tags: dict, model: str) -> bool:
        return any(_name_matches(n, model) for n in self._installed_names(tags))

    async def is_available(self) -> bool:
        """True if at least one catalog endpoint responds with its model."""
        status = await self.endpoint_status()
        return any(status.values())

    async def endpoint_status(self) -> dict[str, bool]:
        result: dict[str, bool] = {}
        for model, url in get_model_endpoints().items():
            tags = await self._fetch_tags(url)
            result[model] = bool(tags and self._is_model_installed(tags, model))
        return result

    async def list_installed_models(self) -> list[str]:
        status = await self.endpoint_status()
        return [m for m, ok in status.items() if ok]

    async def ensure_model(self, model: str) -> None:
        url = self._base_url_for(model)
        tags = await self._fetch_tags(url)
        if not tags:
            raise ConnectionError(
                f"Cannot reach Ollama for '{model}' at {url}. "
                f"Start that image (e.g. docker compose --profile full up) "
                f"or fall back to llama3.2."
            )
        if not self._is_model_installed(tags, model):
            raise ConnectionError(
                f"Model '{model}' missing at {url}. Rebuild: "
                f"docker compose build ollama-*"
            )

    async def generate(
        self,
        messages: list[dict],
        system_prompt: str = "",
        model: str | None = None,
    ) -> str:
        chosen = model or self.default_model
        await self.ensure_model(chosen)
        client = self._get_client(chosen)
        lc_messages = _to_langchain_messages(messages, system_prompt)
        response = await client.ainvoke(lc_messages)
        return response.content

    async def stream(
        self,
        messages: list[dict],
        system_prompt: str = "",
        model: str | None = None,
    ) -> AsyncIterator[str]:
        chosen = model or self.default_model
        await self.ensure_model(chosen)
        client = self._get_client(chosen)
        lc_messages = _to_langchain_messages(messages, system_prompt)
        async for chunk in client.astream(lc_messages):
            if chunk.content:
                yield chunk.content
