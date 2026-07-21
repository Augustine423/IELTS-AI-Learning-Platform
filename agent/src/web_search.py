"""IELTS-focused web search helpers for Band 8 course coaching."""

from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger("agent.web_search")

IELTS_SEARCH_HINTS = (
    "Prefer official or reputable education sources when possible, "
    "such as IELTS.org, British Council, IDP, Cambridge, or BBC Learning English."
)


def search_ielts_web(query: str, max_results: int = 3) -> list[dict[str, str]]:
    """Search the web and return compact English snippets for voice coaching."""
    cleaned = " ".join(query.split()).strip()
    if not cleaned:
        return []

    enriched = f"{cleaned} IELTS Band 8"

    try:
        from ddgs import DDGS
    except ImportError:  # pragma: no cover
        from duckduckgo_search import DDGS  # type: ignore

    try:
        with DDGS() as ddgs:
            raw = list(ddgs.text(enriched, max_results=max_results))
    except Exception:
        logger.exception("Web search failed for query=%s", cleaned)
        raise

    results: list[dict[str, str]] = []
    for item in raw:
        title = str(item.get("title") or "").strip()
        body = str(item.get("body") or item.get("description") or "").strip()
        url = str(item.get("href") or item.get("link") or item.get("url") or "").strip()
        if not title and not body:
            continue
        results.append(
            {
                "title": title[:160],
                "summary": body[:320],
                "url": url,
            }
        )

    return results


def format_search_for_voice(results: list[dict[str, str]]) -> dict[str, Any]:
    """Return a voice-friendly payload the LLM can summarize aloud."""
    if not results:
        return {
            "found": False,
            "guidance": (
                "No useful results found. Continue with general Band 8 advice "
                "from your teaching knowledge."
            ),
            "results": [],
        }

    spoken_notes = [
        f"Result {index}: {item['title']}. {item['summary']}"
        for index, item in enumerate(results, start=1)
    ]

    return {
        "found": True,
        "guidance": (
            "Summarize these findings in clear spoken English for IELTS practice. "
            "Do not read raw URLs. Turn facts into useful Band 8 examples, vocabulary, "
            "or discussion points. Mention that ideas came from recent online sources."
        ),
        "source_hint": IELTS_SEARCH_HINTS,
        "results": results,
        "spoken_notes": spoken_notes,
    }
