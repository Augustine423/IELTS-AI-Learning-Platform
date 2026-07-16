import json
from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from app.models.schemas import ChatRequest, ChatResponse
from app.services.llm.factory import get_llm
from app.services.llm.models import resolve_model
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


async def _resolve_request_model(request: ChatRequest, llm) -> str:
    preferred = resolve_model(
        request.skill.value,
        mode=request.model_mode.value,
        manual_model=request.model,
    )
    if hasattr(llm, "endpoint_status"):
        status = await llm.endpoint_status()
        if status.get(preferred):
            return preferred
        if status.get("llama3.2"):
            return "llama3.2"
        for name, ok in status.items():
            if ok:
                return name
    return preferred


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    llm = get_llm()
    system_prompt = _build_system_prompt(request)
    messages = [m.model_dump() for m in request.messages]
    model = await _resolve_request_model(request, llm)

    try:
        content = await llm.generate(messages, system_prompt, model=model)
        return ChatResponse(
            content=content,
            skill=request.skill,
            model=model,
            model_mode=request.model_mode,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    llm = get_llm()
    system_prompt = _build_system_prompt(request)
    messages = [m.model_dump() for m in request.messages]
    model = await _resolve_request_model(request, llm)

    async def event_generator():
        try:
            yield {
                "event": "meta",
                "data": json.dumps(
                    {
                        "model": model,
                        "model_mode": request.model_mode.value,
                        "skill": request.skill.value,
                    }
                ),
            }
            async for chunk in llm.stream(messages, system_prompt, model=model):
                yield {"event": "message", "data": json.dumps({"content": chunk})}
            yield {"event": "done", "data": json.dumps({"model": model})}
        except Exception as e:
            yield {"event": "error", "data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_generator())
