import base64

from fastapi import APIRouter, File, UploadFile, HTTPException

from app.models.schemas import TTSRequest, TTSResponse, STTResponse
from app.services.voice.tts.factory import get_tts, list_voices
from app.services.voice.stt.factory import get_stt, is_free_stt_provider
from app.config import get_config, get_settings

router = APIRouter(prefix="/api/voice", tags=["voice"])


@router.post("/tts", response_model=TTSResponse)
async def text_to_speech(request: TTSRequest):
    tts = get_tts()
    try:
        audio_bytes, content_type, voice_id = await tts.synthesize(
            request.text, request.voice_preferences
        )
        return TTSResponse(
            audio_base64=base64.b64encode(audio_bytes).decode(),
            content_type=content_type,
            voice_id=voice_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stt", response_model=STTResponse)
async def speech_to_text(audio: UploadFile = File(...)):
    settings = get_settings()
    config = get_config()
    provider = config.get("stt", {}).get("provider", "whisper")

    if not is_free_stt_provider(provider):
        api_key = (
            settings.deepgram_api_key
            if provider == "deepgram"
            else settings.assemblyai_api_key
        )
        if not api_key:
            raise HTTPException(
                status_code=400,
                detail=f"No API key for STT provider '{provider}'. "
                "Add DEEPGRAM_API_KEY or ASSEMBLYAI_API_KEY to .env, "
                "or switch stt.provider to whisper in config.yaml.",
            )

    stt = get_stt()
    audio_bytes = await audio.read()
    content_type = audio.content_type or "audio/webm"

    try:
        transcript, confidence = await stt.transcribe(audio_bytes, content_type)
        return STTResponse(transcript=transcript, confidence=confidence)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/voices")
async def get_available_voices():
    config = get_config()
    return {
        "tts_provider": config.get("tts", {}).get("provider", "edge"),
        "voices": list_voices(),
    }
