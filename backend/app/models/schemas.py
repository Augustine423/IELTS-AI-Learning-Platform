from pydantic import BaseModel, Field
from typing import Literal, Optional
from enum import Enum


class Accent(str, Enum):
    UK = "uk"
    US = "us"
    AU = "au"


class Gender(str, Enum):
    FEMALE = "female"
    MALE = "male"


class Skill(str, Enum):
    LISTENING = "listening"
    SPEAKING = "speaking"
    READING = "reading"
    WRITING = "writing"


class VoicePreferences(BaseModel):
    accent: Accent = Accent.UK
    gender: Gender = Gender.FEMALE


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    skill: Skill
    messages: list[ChatMessage]
    voice_preferences: VoicePreferences = Field(default_factory=VoicePreferences)
    stream: bool = True


class ChatResponse(BaseModel):
    content: str
    skill: Skill


class TTSRequest(BaseModel):
    text: str
    voice_preferences: VoicePreferences = Field(default_factory=VoicePreferences)


class TTSResponse(BaseModel):
    audio_base64: str
    content_type: str = "audio/mpeg"
    voice_id: str


class STTResponse(BaseModel):
    transcript: str
    confidence: Optional[float] = None


class SkillInfo(BaseModel):
    id: Skill
    name: str
    description: str
    icon: str


class ProviderConfig(BaseModel):
    llm_provider: str
    llm_model: str
    stt_provider: str
    tts_provider: str
    available_accents: list[str]
    available_genders: list[str]


class HealthResponse(BaseModel):
    status: str
    llm_provider: str
    llm_model: str
    ollama_available: bool
