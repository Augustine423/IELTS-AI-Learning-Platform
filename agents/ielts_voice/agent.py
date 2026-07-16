"""IELTS LiveKit voice agent — all four skills via LiveKit Cloud.

Requires:
  LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET
  GROQ_API_KEY and/or OPENAI_API_KEY
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
)
from livekit.plugins import openai, silero

from edge_tts_plugin import EdgeTTS, voice_for

load_dotenv()
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

logger = logging.getLogger("ielts-agent")

DEFAULT_INSTRUCTIONS = (
    "You are an expert IELTS tutor. Keep spoken replies short (2–5 sentences), "
    "ask one follow-up question when useful, and coach the student clearly."
)

SKILL_GREETINGS = {
    "listening": "Hello! I'm your IELTS Listening coach. Shall we start with a short practice section?",
    "speaking": "Hello! I'm your IELTS Speaking examiner. Ready for a warm-up question?",
    "reading": "Hello! I'm your IELTS Reading tutor. Would you like Academic or General Training practice?",
    "writing": "Hello! I'm your IELTS Writing coach. Shall we work on Task 1 or Task 2?",
}


def _parse_metadata(raw: str | None) -> dict[str, Any]:
    if not raw:
        return {}
    try:
        data = json.loads(raw)
        return data if isinstance(data, dict) else {}
    except json.JSONDecodeError:
        return {}


def _build_llm():
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.groq.com/openai/v1").strip()

    if groq_key:
        return openai.LLM(
            model=os.getenv("GROQ_LLM_MODEL", "llama-3.3-70b-versatile"),
            api_key=groq_key,
            base_url="https://api.groq.com/openai/v1",
        )
    if openai_key:
        return openai.LLM(
            model=os.getenv("OPENAI_LLM_MODEL", "gpt-4o-mini"),
            api_key=openai_key,
            base_url=base_url if "openai.com" in base_url else None,
        )
    raise RuntimeError(
        "Set GROQ_API_KEY (recommended free tier) or OPENAI_API_KEY for the IELTS LiveKit agent."
    )


def _build_stt():
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()

    if groq_key:
        return openai.STT(
            model=os.getenv("GROQ_STT_MODEL", "whisper-large-v3"),
            api_key=groq_key,
            base_url="https://api.groq.com/openai/v1",
        )
    if openai_key:
        return openai.STT(model="whisper-1", api_key=openai_key)
    raise RuntimeError("Need GROQ_API_KEY or OPENAI_API_KEY for speech-to-text.")


def _build_tts(accent: str, gender: str):
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    # Prefer free Edge TTS unless explicitly forced to OpenAI TTS
    if openai_key and os.getenv("IELTS_TTS_PROVIDER", "edge").lower() == "openai":
        return openai.TTS(model="tts-1", voice="alloy", api_key=openai_key)
    return EdgeTTS(voice=voice_for(accent, gender))


async def entrypoint(ctx: JobContext):
    await ctx.connect()

    meta = _parse_metadata(getattr(ctx.job, "metadata", None) if ctx.job else None)
    skill = str(meta.get("skill") or "speaking")
    accent = str(meta.get("accent") or "uk")
    gender = str(meta.get("gender") or "female")
    instructions = str(meta.get("instructions") or DEFAULT_INSTRUCTIONS)

    logger.info("Starting IELTS agent skill=%s room=%s", skill, ctx.room.name)

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=_build_stt(),
        llm=_build_llm(),
        tts=_build_tts(accent, gender),
    )

    greeting = SKILL_GREETINGS.get(skill, SKILL_GREETINGS["speaking"])

    await session.start(
        room=ctx.room,
        agent=Agent(instructions=instructions),
    )
    await session.generate_reply(instructions=f"Greet the student briefly: {greeting}")


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="ielts-tutor",
        )
    )
