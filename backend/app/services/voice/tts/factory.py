from app.config import get_config
from app.services.voice.tts.base import BaseTTS
from app.services.voice.tts.edge_tts import EdgeTTS, get_voice_id, VOICE_MAP
from app.services.voice.tts.elevenlabs import ElevenLabsTTS

_PROVIDERS: dict[str, type[BaseTTS]] = {
    "edge": EdgeTTS,
    "elevenlabs": ElevenLabsTTS,
}


def get_tts() -> BaseTTS:
    config = get_config()
    provider = config.get("tts", {}).get("provider", "edge")
    cls = _PROVIDERS.get(provider, EdgeTTS)
    return cls()


def list_voices() -> list[dict]:
    return [
        {"accent": accent.value, "gender": gender.value, "voice_id": voice_id}
        for (accent, gender), voice_id in VOICE_MAP.items()
    ]
