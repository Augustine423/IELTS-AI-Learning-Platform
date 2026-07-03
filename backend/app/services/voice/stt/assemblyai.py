import assemblyai as aai

from app.config import get_settings
from app.services.voice.stt.base import BaseSTT


class AssemblyAISTT(BaseSTT):
    def __init__(self):
        settings = get_settings()
        aai.settings.api_key = settings.assemblyai_api_key
        self._transcriber = aai.Transcriber()

    async def transcribe(self, audio_bytes: bytes, content_type: str = "audio/webm") -> tuple[str, float | None]:
        import tempfile
        import os

        ext = ".webm" if "webm" in content_type else ".wav"
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as f:
            f.write(audio_bytes)
            tmp_path = f.name

        try:
            transcript = self._transcriber.transcribe(tmp_path)
            if transcript.status == aai.TranscriptStatus.error:
                raise RuntimeError(transcript.error)
            confidence = transcript.confidence if hasattr(transcript, "confidence") else None
            return transcript.text or "", confidence
        finally:
            os.unlink(tmp_path)
