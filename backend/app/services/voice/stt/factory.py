from app.config import get_config
from app.services.voice.stt.base import BaseSTT
from app.services.voice.stt.deepgram import DeepgramSTT
from app.services.voice.stt.assemblyai import AssemblyAISTT
from app.services.voice.stt.whisper import WhisperSTT

_PROVIDERS: dict[str, type[BaseSTT]] = {
    "whisper": WhisperSTT,
    "deepgram": DeepgramSTT,
    "assemblyai": AssemblyAISTT,
}

_FREE_PROVIDERS = frozenset({"whisper"})


def get_stt() -> BaseSTT:
    config = get_config()
    provider = config.get("stt", {}).get("provider", "whisper")
    cls = _PROVIDERS.get(provider, WhisperSTT)
    return cls()


def list_stt_providers() -> list[str]:
    return list(_PROVIDERS.keys())


def is_free_stt_provider(provider: str) -> bool:
    return provider in _FREE_PROVIDERS
