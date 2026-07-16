from fastapi import APIRouter

from app.models.schemas import SkillInfo, Skill, ProviderConfig
from app.config import get_config, get_settings
from app.services.llm.factory import list_llm_providers
from app.services.llm.models import get_fallback_model
from app.services.voice.stt.factory import list_stt_providers
from app.services.voice.tts.factory import list_voices

router = APIRouter(prefix="/api", tags=["skills"])

SKILLS: list[SkillInfo] = [
    SkillInfo(
        id=Skill.LISTENING,
        name="Listening",
        description="Section-style scripts, TTS playback, and comprehension drills.",
        icon="headphones",
    ),
    SkillInfo(
        id=Skill.SPEAKING,
        name="Speaking",
        description="Situational dialogues and Parts 1–3 with live voice coaching.",
        icon="mic",
    ),
    SkillInfo(
        id=Skill.READING,
        name="Reading",
        description="Passages with T/F/NG, headings, and vocabulary in context.",
        icon="book-open",
    ),
    SkillInfo(
        id=Skill.WRITING,
        name="Writing",
        description="Task 1 & 2 feedback using official IELTS band criteria.",
        icon="pen",
    ),
]


@router.get("/skills", response_model=list[SkillInfo])
async def get_skills():
    return SKILLS


@router.get("/config", response_model=ProviderConfig)
async def get_provider_config():
    config = get_config()
    settings = get_settings()
    llm_cfg = config.get("llm", {})
    stt_cfg = config.get("stt", {})
    tts_cfg = config.get("tts", {})
    livekit_ok = bool(
        settings.livekit_url and settings.livekit_api_key and settings.livekit_api_secret
    )
    return ProviderConfig(
        llm_provider=llm_cfg.get("provider", "groq"),
        llm_model=get_fallback_model(),
        stt_provider=stt_cfg.get("provider", "whisper"),
        tts_provider=tts_cfg.get("provider", "edge"),
        available_accents=["uk", "us", "au"],
        available_genders=["female", "male"],
        livekit_enabled=livekit_ok,
    )


@router.get("/providers")
async def get_providers():
    return {
        "llm": list_llm_providers(),
        "stt": list_stt_providers(),
        "voices": list_voices(),
    }
