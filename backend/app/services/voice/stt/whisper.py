import asyncio
import os
import tempfile

from faster_whisper import WhisperModel

from app.config import get_config
from app.services.voice.stt.base import BaseSTT

_model: WhisperModel | None = None
_model_name: str | None = None


def _get_model() -> WhisperModel:
    global _model, _model_name
    config = get_config()
    model_name = config.get("stt", {}).get("model", "base")
    if _model is None or _model_name != model_name:
        _model = WhisperModel(model_name, device="cpu", compute_type="int8")
        _model_name = model_name
    return _model


class WhisperSTT(BaseSTT):
    async def transcribe(
        self, audio_bytes: bytes, content_type: str = "audio/webm"
    ) -> tuple[str, float | None]:
        return await asyncio.to_thread(self._transcribe_sync, audio_bytes, content_type)

    def _transcribe_sync(
        self, audio_bytes: bytes, content_type: str
    ) -> tuple[str, float | None]:
        if "webm" in content_type:
            ext = ".webm"
        elif "wav" in content_type:
            ext = ".wav"
        elif "mp4" in content_type or "m4a" in content_type:
            ext = ".m4a"
        else:
            ext = ".webm"

        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as f:
            f.write(audio_bytes)
            tmp_path = f.name

        try:
            model = _get_model()
            language = get_config().get("stt", {}).get("language", "en")
            segments, info = model.transcribe(tmp_path, language=language)
            transcript = " ".join(seg.text.strip() for seg in segments).strip()
            confidence = getattr(info, "language_probability", None)
            return transcript, confidence
        finally:
            os.unlink(tmp_path)
