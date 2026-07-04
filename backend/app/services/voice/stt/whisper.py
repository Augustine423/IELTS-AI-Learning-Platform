import asyncio
import logging
import os
import subprocess
import tempfile

from faster_whisper import WhisperModel

from app.config import get_config
from app.services.voice.stt.base import BaseSTT

logger = logging.getLogger(__name__)

_model: WhisperModel | None = None
_model_name: str | None = None


def _cache_dir() -> str:
    cache = os.environ.get("WHISPER_CACHE_DIR", "/app/.cache/whisper")
    os.makedirs(cache, exist_ok=True)
    return cache


def _temp_dir() -> str:
    tmp = os.environ.get("TMPDIR", "/app/tmp")
    os.makedirs(tmp, exist_ok=True)
    return tmp


def _get_model() -> WhisperModel:
    global _model, _model_name
    config = get_config()
    model_name = config.get("stt", {}).get("model", "base")
    if _model is None or _model_name != model_name:
        logger.info("Loading Whisper model: %s", model_name)
        _model = WhisperModel(
            model_name,
            device="cpu",
            compute_type="int8",
            download_root=_cache_dir(),
        )
        _model_name = model_name
        logger.info("Whisper model ready")
    return _model


def _extension_for_content_type(content_type: str) -> str:
    ct = content_type.lower()
    if "webm" in ct:
        return ".webm"
    if "wav" in ct:
        return ".wav"
    if "mp4" in ct or "m4a" in ct:
        return ".m4a"
    if "ogg" in ct:
        return ".ogg"
    return ".webm"


def _convert_to_wav(source_path: str) -> str:
    """Convert browser audio to 16 kHz mono WAV for reliable Whisper transcription."""
    fd, wav_path = tempfile.mkstemp(suffix=".wav", dir=_temp_dir())
    os.close(fd)
    result = subprocess.run(
        [
            "ffmpeg",
            "-nostdin",
            "-y",
            "-i",
            source_path,
            "-map",
            "0:a:0?",
            "-ar",
            "16000",
            "-ac",
            "1",
            "-c:a",
            "pcm_s16le",
            wav_path,
        ],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        if os.path.exists(wav_path):
            os.unlink(wav_path)
        raise RuntimeError(
            f"Audio conversion failed: {result.stderr.strip() or 'unknown ffmpeg error'}"
        )
    return wav_path


def warmup_whisper_model() -> None:
    """Load Whisper at startup so the first STT request does not time out or OOM-crash."""
    _get_model()


class WhisperSTT(BaseSTT):
    async def transcribe(
        self, audio_bytes: bytes, content_type: str = "audio/webm"
    ) -> tuple[str, float | None]:
        if len(audio_bytes) < 1000:
            raise ValueError("Recording too short. Hold the mic button and speak for at least 1 second.")
        return await asyncio.to_thread(
            self._transcribe_sync, audio_bytes, content_type
        )

    def _transcribe_sync(
        self, audio_bytes: bytes, content_type: str
    ) -> tuple[str, float | None]:
        ext = _extension_for_content_type(content_type)
        tmp_dir = _temp_dir()
        source_path = None
        wav_path = None

        with tempfile.NamedTemporaryFile(
            suffix=ext, delete=False, dir=tmp_dir
        ) as f:
            f.write(audio_bytes)
            source_path = f.name

        try:
            wav_path = _convert_to_wav(source_path)
            model = _get_model()
            language = get_config().get("stt", {}).get("language", "en")
            segments, info = model.transcribe(
                wav_path,
                language=language,
                vad_filter=False,
                beam_size=1,
            )
            transcript = " ".join(seg.text.strip() for seg in segments).strip()
            if not transcript:
                raise ValueError(
                    "Could not detect speech. Speak clearly and try again."
                )
            confidence = getattr(info, "language_probability", None)
            return transcript, confidence
        finally:
            for path in (source_path, wav_path):
                if path and os.path.exists(path):
                    os.unlink(path)
