import io

import edge_tts

from app.models.schemas import VoicePreferences, Accent, Gender
from app.services.voice.tts.base import BaseTTS

# Free Microsoft Edge TTS voices — UK, US, Australian, male & female
VOICE_MAP: dict[tuple[str, str], str] = {
    (Accent.UK, Gender.FEMALE): "en-GB-SoniaNeural",
    (Accent.UK, Gender.MALE): "en-GB-RyanNeural",
    (Accent.US, Gender.FEMALE): "en-US-JennyNeural",
    (Accent.US, Gender.MALE): "en-US-GuyNeural",
    (Accent.AU, Gender.FEMALE): "en-AU-NatashaNeural",
    (Accent.AU, Gender.MALE): "en-AU-WilliamNeural",
}


def get_voice_id(preferences: VoicePreferences) -> str:
    return VOICE_MAP.get(
        (preferences.accent, preferences.gender),
        "en-GB-SoniaNeural",
    )


class EdgeTTS(BaseTTS):
    async def synthesize(self, text: str, preferences: VoicePreferences) -> tuple[bytes, str, str]:
        voice_id = get_voice_id(preferences)
        communicate = edge_tts.Communicate(text, voice_id)
        buffer = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                buffer.write(chunk["data"])
        return buffer.getvalue(), "audio/mpeg", voice_id
