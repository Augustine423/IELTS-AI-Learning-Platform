from typing import AsyncIterator

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from app.config import get_config, get_settings
from app.services.llm.base import BaseLLM


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


class OpenAICompatibleLLM(BaseLLM):
    """Groq (default) or any OpenAI-compatible API — no Ollama."""

    def __init__(self):
        config = get_config()
        settings = get_settings()
        llm_cfg = config.get("llm", {})
        self.model = llm_cfg.get("model", "llama-3.3-70b-versatile")
        self.temperature = llm_cfg.get("temperature", 0.7)

        groq_key = (settings.groq_api_key or "").strip()
        openai_key = (settings.openai_api_key or "").strip()
        base = (settings.openai_base_url or "").strip()

        if groq_key:
            self.api_key = groq_key
            self.base_url = "https://api.groq.com/openai/v1"
        elif openai_key:
            self.api_key = openai_key
            self.base_url = base or "https://api.openai.com/v1"
        else:
            self.api_key = ""
            self.base_url = base or "https://api.groq.com/openai/v1"

    async def is_available(self) -> bool:
        return bool(self.api_key)

    async def generate(
        self,
        messages: list[dict],
        system_prompt: str = "",
        model: str | None = None,
    ) -> str:
        if not self.api_key:
            raise RuntimeError("Set GROQ_API_KEY or OPENAI_API_KEY for chat.")
        client = ChatOpenAI(
            model=model or self.model,
            api_key=self.api_key,
            base_url=self.base_url,
            temperature=self.temperature,
        )
        lc_messages = _to_langchain_messages(messages, system_prompt)
        response = await client.ainvoke(lc_messages)
        return response.content

    async def stream(
        self,
        messages: list[dict],
        system_prompt: str = "",
        model: str | None = None,
    ) -> AsyncIterator[str]:
        if not self.api_key:
            raise RuntimeError("Set GROQ_API_KEY or OPENAI_API_KEY for chat.")
        client = ChatOpenAI(
            model=model or self.model,
            api_key=self.api_key,
            base_url=self.base_url,
            temperature=self.temperature,
        )
        lc_messages = _to_langchain_messages(messages, system_prompt)
        async for chunk in client.astream(lc_messages):
            if chunk.content:
                yield chunk.content
