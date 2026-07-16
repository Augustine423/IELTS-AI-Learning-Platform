from app.config import get_config
from app.services.llm.base import BaseLLM
from app.services.llm.openai_compatible import OpenAICompatibleLLM

_PROVIDERS: dict[str, type[BaseLLM]] = {
    "openai_compatible": OpenAICompatibleLLM,
    "groq": OpenAICompatibleLLM,
    "openai": OpenAICompatibleLLM,
}


def get_llm() -> BaseLLM:
    config = get_config()
    provider = config.get("llm", {}).get("provider", "groq")
    cls = _PROVIDERS.get(provider, OpenAICompatibleLLM)
    return cls()


def list_llm_providers() -> list[str]:
    return list(_PROVIDERS.keys())
