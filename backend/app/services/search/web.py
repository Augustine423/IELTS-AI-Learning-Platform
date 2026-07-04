"""Free web search for IELTS study context (DuckDuckGo — no API key)."""

import logging

logger = logging.getLogger(__name__)

SKILL_QUERIES: dict[str, str] = {
    "listening": "IELTS listening tips section strategies band 7",
    "speaking": "IELTS speaking part 1 2 3 examiner tips fluency",
    "reading": "IELTS reading true false not given strategies",
    "writing": "IELTS writing task 2 essay band descriptors feedback",
}


def search_ielts_context(skill: str, user_message: str, max_results: int = 3) -> str:
    """Return formatted web snippets to enrich the tutor prompt."""
    try:
        from duckduckgo_search import DDGS
    except ImportError:
        logger.warning("duckduckgo-search not installed")
        return ""

    skill_hint = SKILL_QUERIES.get(skill, "IELTS exam preparation")
    query = f"{skill_hint} {user_message[:120]}".strip()

    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
    except Exception as e:
        logger.warning("Web search failed: %s", e)
        return ""

    if not results:
        return ""

    lines = ["Recent IELTS study references (use for accuracy, adapt to the student):"]
    for i, hit in enumerate(results, 1):
        title = hit.get("title", "").strip()
        body = hit.get("body", "").strip()
        if title or body:
            lines.append(f"{i}. {title}: {body[:280]}")

    return "\n".join(lines)
