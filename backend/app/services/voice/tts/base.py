from abc import ABC, abstractmethod

from app.models.schemas import VoicePreferences


class BaseTTS(ABC):
    @abstractmethod
    async def synthesize(self, text: str, preferences: VoicePreferences) -> tuple[bytes, str, str]:
        """Returns (audio_bytes, content_type, voice_id)."""
        pass
