from fastapi import APIRouter

from app.models.schemas import SkillInfo, Skill, ProviderConfig
from app.config import get_config
from app.services.llm.factory import get_llm, list_llm_providers
from app.services.voice.tts.factory import list_voices

router = APIRouter(prefix="/api", tags=["skills"])

SKILLS: list[SkillInfo] = [
    SkillInfo(
        id=Skill.LISTENING,
        name="Listening",
        description="Practice IELTS listening with AI-read passages and comprehension questions.",
        icon="headphones",
    ),
    SkillInfo(
        id=Skill.SPEAKING,
        name="Speaking",
        description="Voice conversation practice with real-time examiner-style feedback.",
        icon="mic",
    ),
    SkillInfo(
        id=Skill.READING,
        name="Reading",
        description="Reading passages with authentic IELTS question types and explanations.",
        icon="book-open",
    ),
    SkillInfo(
        id=Skill.WRITING,
        name="Writing",
        description="Essay and report feedback with official IELTS band criteria.",
        icon="pen",
    ),
]


@router.get("/skills", response_model=list[SkillInfo])
async def get_skills():
    return SKILLS


@router.get("/config", response_model=ProviderConfig)
async def get_provider_config():
    config = get_config()
    llm_cfg = config.get("llm", {})
    stt_cfg = config.get("stt", {})
    tts_cfg = config.get("tts", {})
    return ProviderConfig(
        llm_provider=llm_cfg.get("provider", "ollama"),
        llm_model=llm_cfg.get("model", "llama3.2"),
        stt_provider=stt_cfg.get("provider", "deepgram"),
        tts_provider=tts_cfg.get("provider", "edge"),
        available_accents=["uk", "us", "au"],
        available_genders=["female", "male"],
    )


@router.get("/providers")
async def get_providers():
    return {
        "llm": list_llm_providers(),
        "voices": list_voices(),
    }
