from app.config import get_config
from app.services.llm.base import BaseLLM
from app.services.llm.ollama import OllamaLLM
from app.services.llm.openai_compatible import OpenAICompatibleLLM

_PROVIDERS: dict[str, type[BaseLLM]] = {
    "ollama": OllamaLLM,
    "openai_compatible": OpenAICompatibleLLM,
    "groq": OpenAICompatibleLLM,
}


def get_llm() -> BaseLLM:
    config = get_config()
    provider = config.get("llm", {}).get("provider", "ollama")
    cls = _PROVIDERS.get(provider, OllamaLLM)
    return cls()


def list_llm_providers() -> list[str]:
    return list(_PROVIDERS.keys())
