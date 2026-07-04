import json
from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm.factory import get_llm
from app.services.ielts.prompts import get_system_prompt
from app.services.search.web import search_ielts_context

router = APIRouter(prefix="/api/chat", tags=["chat"])


def _build_system_prompt(request: ChatRequest) -> str:
    web_context = ""
    if request.use_web_search and request.messages:
        last_user = next(
            (m.content for m in reversed(request.messages) if m.role == "user"),
            "",
        )
        if last_user:
            web_context = search_ielts_context(request.skill.value, last_user)
    return get_system_prompt(
        request.skill.value,
        request.voice_preferences.accent.value,
        web_context,
    )


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    llm = get_llm()
    system_prompt = _build_system_prompt(request)
    messages = [m.model_dump() for m in request.messages]

    try:
        content = await llm.generate(messages, system_prompt)
        return ChatResponse(content=content, skill=request.skill)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    llm = get_llm()
    system_prompt = _build_system_prompt(request)
    messages = [m.model_dump() for m in request.messages]

    async def event_generator():
        try:
            async for chunk in llm.stream(messages, system_prompt):
                yield {"event": "message", "data": json.dumps({"content": chunk})}
            yield {"event": "done", "data": "{}"}
        except Exception as e:
            yield {"event": "error", "data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_generator())
