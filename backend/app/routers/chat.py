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


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    llm = get_llm()
    system_prompt = _build_system_prompt(request)
    messages = [m.model_dump() for m in request.messages]
    model = resolve_model(
        request.skill.value,
        mode=request.model_mode.value,
        manual_model=request.model,
    )

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
    model = resolve_model(
        request.skill.value,
        mode=request.model_mode.value,
        manual_model=request.model,
    )

    async def event_generator():
        try:
            if not await llm.is_available():
                yield {
                    "event": "error",
                    "data": json.dumps(
                        {
                            "error": "No LLM API key. Set GROQ_API_KEY (free at console.groq.com) or OPENAI_API_KEY in .env, then restart: docker compose up -d"
                        }
                    ),
                }
                return
            yield {
                "event": "meta",
                "data": json.dumps({"model": model, "model_mode": request.model_mode.value}),
            }
            async for chunk in llm.stream(messages, system_prompt, model=model):
                yield {"event": "message", "data": json.dumps({"content": chunk})}
            yield {"event": "done", "data": json.dumps({})}
        except Exception as e:
            yield {"event": "error", "data": json.dumps({"error": str(e)})}

    return EventSourceResponse(event_generator())
