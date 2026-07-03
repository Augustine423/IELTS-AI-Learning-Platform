import json
import time
from pathlib import Path
from typing import AsyncIterator

import httpx
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from app.config import get_config, get_settings
from app.services.llm.base import BaseLLM


# region agent log
def _debug_log(location: str, message: str, data: dict, hypothesis_id: str) -> None:
    payload = {
        "sessionId": "e8ee54",
        "timestamp": int(time.time() * 1000),
        "location": location,
        "message": message,
        "data": data,
        "hypothesisId": hypothesis_id,
        "runId": data.get("runId", "pre-fix"),
    }
    for log_path in (
        Path(__file__).resolve().parents[4] / "debug-e8ee54.log",
        Path("/app/debug-e8ee54.log"),
        Path("debug-e8ee54.log"),
    ):
        try:
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(payload) + "\n")
            break
        except OSError:
            continue
# endregion


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


class OllamaLLM(BaseLLM):
    def __init__(self):
        config = get_config()
        settings = get_settings()
        llm_cfg = config.get("llm", {})
        self.model = llm_cfg.get("model", "llama3.2")
        self.base_url = settings.ollama_base_url or llm_cfg.get("base_url", "http://localhost:11434")
        self.temperature = llm_cfg.get("temperature", 0.7)

    def _get_client(self) -> ChatOllama:
        return ChatOllama(
            model=self.model,
            base_url=self.base_url,
            temperature=self.temperature,
        )

    async def is_available(self) -> bool:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(f"{self.base_url}/api/tags", timeout=5.0)
                return resp.status_code == 200
        except Exception:
            return False

    async def generate(self, messages: list[dict], system_prompt: str = "") -> str:
        client = self._get_client()
        lc_messages = _to_langchain_messages(messages, system_prompt)
        response = await client.ainvoke(lc_messages)
        return response.content

    async def stream(self, messages: list[dict], system_prompt: str = "") -> AsyncIterator[str]:
        if not await self.is_available():
            raise ConnectionError(
                f"Cannot reach Ollama at {self.base_url}. "
                f"Ensure Ollama is running and model '{self.model}' is pulled."
            )
        client = self._get_client()
        lc_messages = _to_langchain_messages(messages, system_prompt)
        async for chunk in client.astream(lc_messages):
            if chunk.content:
                yield chunk.content
