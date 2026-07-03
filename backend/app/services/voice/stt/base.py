from abc import ABC, abstractmethod


class BaseSTT(ABC):
    @abstractmethod
    async def transcribe(self, audio_bytes: bytes, content_type: str = "audio/webm") -> tuple[str, float | None]:
        pass
