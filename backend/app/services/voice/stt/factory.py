from app.config import get_config
from app.services.voice.stt.base import BaseSTT
from app.services.voice.stt.deepgram import DeepgramSTT
from app.services.voice.stt.assemblyai import AssemblyAISTT

_PROVIDERS: dict[str, type[BaseSTT]] = {
    "deepgram": DeepgramSTT,
    "assemblyai": AssemblyAISTT,
}


def get_stt() -> BaseSTT:
    config = get_config()
    provider = config.get("stt", {}).get("provider", "deepgram")
    cls = _PROVIDERS.get(provider, DeepgramSTT)
    return cls()
