import httpx

from app.config import get_config, get_settings
from app.models.schemas import VoicePreferences
from app.services.voice.tts.base import BaseTTS
from app.services.voice.tts.edge_tts import get_voice_id

ELEVENLABS_VOICES: dict[tuple[str, str], str] = {
    ("uk", "female"): "EXAVITQu4vr4xnSDxMaL",  # Sarah — British
    ("uk", "male"): "onwK4e9ZLuTAKqWW03F9",    # Daniel — British
    ("us", "female"): "21m00Tcm4TlvDq8ikWAM",  # Rachel — American
    ("us", "male"): "pNInz6obpgDQGcFmaJgB",    # Adam — American
    ("au", "female"): "jsCqWAovK2LkecY7zXl4",  # Freya — Australian
    ("au", "male"): "VR6AewLTigWG4xSOukaG",    # Arnold
}


class ElevenLabsTTS(BaseTTS):
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.elevenlabs_api_key
        config = get_config()
        self.default_voice = config.get("tts", {}).get("elevenlabs_voice_id", "")

    def _resolve_voice(self, preferences: VoicePreferences) -> str:
        if self.default_voice:
            return self.default_voice
        key = (preferences.accent.value, preferences.gender.value)
        return ELEVENLABS_VOICES.get(key, "EXAVITQu4vr4xnSDxMaL")

    async def synthesize(self, text: str, preferences: VoicePreferences) -> tuple[bytes, str, str]:
        voice_id = self._resolve_voice(preferences)
        url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
        }
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers=headers, timeout=60.0)
            resp.raise_for_status()
            return resp.content, "audio/mpeg", voice_id
