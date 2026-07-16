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


class ModelMode(str, Enum):
    AUTO = "auto"
    MANUAL = "manual"


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
    use_web_search: bool = False
    # auto = pick by skill; manual = use `model` from catalog
    model_mode: ModelMode = ModelMode.AUTO
    model: Optional[str] = None


class ChatResponse(BaseModel):
    content: str
    skill: Skill
    model: str = ""
    model_mode: ModelMode = ModelMode.AUTO


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
    model_catalog: list[str] = Field(default_factory=list)
    models_by_skill: dict[str, str] = Field(default_factory=dict)
    model_endpoints: dict[str, str] = Field(default_factory=dict)
    default_model_mode: str = "auto"


class HealthResponse(BaseModel):
    status: str
    llm_provider: str
    llm_model: str
    ollama_available: bool
    models_installed: list[str] = Field(default_factory=list)
    models_by_skill: dict[str, str] = Field(default_factory=dict)
    livekit_configured: bool = False


class LiveKitTokenRequest(BaseModel):
    skill: Skill
    scenario_id: Optional[str] = None
    scenario_prompt: Optional[str] = None
    voice_preferences: VoicePreferences = Field(default_factory=VoicePreferences)
    participant_name: str = "student"


class LiveKitTokenResponse(BaseModel):
    token: str
    url: str
    room_name: str
    skill: Skill
    livekit_configured: bool = True
