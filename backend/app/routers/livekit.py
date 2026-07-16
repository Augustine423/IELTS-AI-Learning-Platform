"""LiveKit Cloud room tokens for IELTS voice practice (all four skills)."""

from __future__ import annotations

import json
import uuid
from datetime import timedelta

from fastapi import APIRouter, HTTPException
from livekit.api import AccessToken, VideoGrants, RoomConfiguration, RoomAgentDispatch

from app.config import get_settings
from app.models.schemas import LiveKitTokenRequest, LiveKitTokenResponse
from app.services.ielts.prompts import get_system_prompt

router = APIRouter(prefix="/api/livekit", tags=["livekit"])

AGENT_NAME = "ielts-tutor"


def _livekit_ready() -> bool:
    s = get_settings()
    return bool(s.livekit_url and s.livekit_api_key and s.livekit_api_secret)


@router.get("/status")
async def livekit_status():
    s = get_settings()
    return {
        "configured": _livekit_ready(),
        "url": s.livekit_url if _livekit_ready() else "",
        "agent_name": AGENT_NAME,
    }


@router.post("/token", response_model=LiveKitTokenResponse)
async def create_token(request: LiveKitTokenRequest):
    if not _livekit_ready():
        raise HTTPException(
            status_code=503,
            detail="LiveKit is not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET.",
        )

    settings = get_settings()
    skill = request.skill.value
    room_name = f"ielts-{skill}-{uuid.uuid4().hex[:10]}"
    identity = f"student-{uuid.uuid4().hex[:8]}"

    instructions = get_system_prompt(skill, request.voice_preferences.accent.value)
    if request.scenario_prompt:
        instructions += (
            f"\n\nStart this practice scenario immediately:\n{request.scenario_prompt}"
        )

    agent_metadata = json.dumps(
        {
            "skill": skill,
            "accent": request.voice_preferences.accent.value,
            "gender": request.voice_preferences.gender.value,
            "scenario_id": request.scenario_id or "",
            "instructions": instructions,
        }
    )

    token = (
        AccessToken(settings.livekit_api_key, settings.livekit_api_secret)
        .with_identity(identity)
        .with_name(request.participant_name or "student")
        .with_ttl(timedelta(hours=2))
        .with_grants(
            VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=True,
            )
        )
        .with_room_config(
            RoomConfiguration(
                agents=[
                    RoomAgentDispatch(
                        agent_name=AGENT_NAME,
                        metadata=agent_metadata,
                    )
                ]
            )
        )
    )

    return LiveKitTokenResponse(
        token=token.to_jwt(),
        url=settings.livekit_url,
        room_name=room_name,
        skill=request.skill,
        livekit_configured=True,
    )
