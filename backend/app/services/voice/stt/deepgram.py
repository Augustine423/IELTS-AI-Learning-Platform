from deepgram import DeepgramClient

from app.config import get_settings
from app.services.voice.stt.base import BaseSTT


class DeepgramSTT(BaseSTT):
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.deepgram_api_key
        self._client: DeepgramClient | None = None

    def _get_client(self) -> DeepgramClient:
        if not self._client:
            self._client = DeepgramClient(api_key=self.api_key)
        return self._client

    async def transcribe(self, audio_bytes: bytes, content_type: str = "audio/webm") -> tuple[str, float | None]:
        client = self._get_client()
        response = client.listen.v1.media.transcribe_file(
            request=audio_bytes,
            model="nova-2",
            language="en",
            smart_format=True,
        )
        if not hasattr(response, "results"):
            return "", None
        alt = response.results.channels[0].alternatives[0]
        return alt.transcript or "", getattr(alt, "confidence", None)
