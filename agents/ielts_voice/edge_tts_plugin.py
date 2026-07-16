"""Edge TTS for LiveKit Agents — free Microsoft voices, decoded via ffmpeg."""

from __future__ import annotations

import asyncio
import io
import logging
import subprocess

from livekit.agents import tts, utils
from livekit.agents.types import DEFAULT_API_CONNECT_OPTIONS, APIConnectOptions

logger = logging.getLogger("ielts-edge-tts")

VOICE_MAP = {
    ("uk", "female"): "en-GB-SoniaNeural",
    ("uk", "male"): "en-GB-RyanNeural",
    ("us", "female"): "en-US-JennyNeural",
    ("us", "male"): "en-US-GuyNeural",
    ("au", "female"): "en-AU-NatashaNeural",
    ("au", "male"): "en-AU-WilliamNeural",
}


def voice_for(accent: str = "uk", gender: str = "female") -> str:
    return VOICE_MAP.get((accent.lower(), gender.lower()), "en-GB-SoniaNeural")


def _mp3_to_pcm(mp3: bytes, sample_rate: int) -> bytes:
    proc = subprocess.run(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            "pipe:0",
            "-f",
            "s16le",
            "-acodec",
            "pcm_s16le",
            "-ac",
            "1",
            "-ar",
            str(sample_rate),
            "pipe:1",
        ],
        input=mp3,
        capture_output=True,
        check=True,
    )
    return proc.stdout


class EdgeTTS(tts.TTS):
    def __init__(self, voice: str = "en-GB-SoniaNeural", sample_rate: int = 24000):
        super().__init__(
            capabilities=tts.TTSCapabilities(streaming=False),
            sample_rate=sample_rate,
            num_channels=1,
        )
        self._voice = voice

    def synthesize(
        self,
        text: str,
        *,
        conn_options: APIConnectOptions = DEFAULT_API_CONNECT_OPTIONS,
    ) -> "EdgeChunkedStream":
        return EdgeChunkedStream(
            tts=self,
            input_text=text,
            conn_options=conn_options,
        )


class EdgeChunkedStream(tts.ChunkedStream):
    def __init__(
        self,
        *,
        tts: EdgeTTS,
        input_text: str,
        conn_options: APIConnectOptions,
    ):
        super().__init__(tts=tts, input_text=input_text, conn_options=conn_options)
        self._edge = tts

    async def _run(self, output_emitter: tts.AudioEmitter) -> None:
        import edge_tts

        communicate = edge_tts.Communicate(self.input_text, self._edge._voice)
        mp3 = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                mp3.write(chunk["data"])

        mp3_bytes = mp3.getvalue()
        if not mp3_bytes:
            return

        pcm = await asyncio.to_thread(_mp3_to_pcm, mp3_bytes, self._edge.sample_rate)
        output_emitter.initialize(
            request_id=utils.shortuuid(),
            sample_rate=self._edge.sample_rate,
            num_channels=1,
            mime_type="audio/pcm",
        )
        # Push in ~20ms frames (24000 * 0.02 * 2 bytes)
        frame_bytes = int(self._edge.sample_rate * 0.02) * 2
        for i in range(0, len(pcm), frame_bytes):
            output_emitter.push(pcm[i : i + frame_bytes])
        output_emitter.flush()
