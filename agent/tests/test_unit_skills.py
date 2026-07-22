"""Offline unit tests for skill modes and passage helpers."""

from agent import (
    build_instructions,
    greeting_instructions,
    normalize_mode,
)
from passages import get_default_listening_passage, split_into_lines


def test_normalize_mode_aliases_ielts_to_speaking() -> None:
    assert normalize_mode("ielts") == "speaking"
    assert normalize_mode("listening") == "listening"
    assert normalize_mode("unknown") == "general"


def test_listening_instructions_include_passage() -> None:
    passage = "The museum opens at nine o'clock."
    instructions = build_instructions(
        "listening",
        passage=passage,
        passage_title="Museum notice",
    )
    assert "IELTS Listening mode" in instructions
    assert "Museum notice" in instructions
    assert passage in instructions


def test_reading_instructions_include_numbered_lines() -> None:
    passage = "I practise English every morning. Then I review vocabulary."
    instructions = build_instructions(
        "reading",
        passage=passage,
        passage_title="Daily practice",
    )
    assert "pronunciation coach" in instructions.lower() or "Reading aloud" in instructions
    assert "1." in instructions
    assert "2." in instructions


def test_greeting_for_listening_mentions_passage_title() -> None:
    text = greeting_instructions("listening", passage_title="Campus library tour")
    assert "Campus library tour" in text
    assert "read" in text.lower()


def test_greeting_for_reading_asks_for_line_one() -> None:
    text = greeting_instructions("reading", passage_title="Travel story")
    assert "line" in text.lower()
    assert "Travel story" in text


def test_split_into_lines() -> None:
    lines = split_into_lines("Hello there. How are you? I am fine!")
    assert lines == ["Hello there.", "How are you?", "I am fine!"]


def test_default_listening_passage_has_questions() -> None:
    passage = get_default_listening_passage()
    assert isinstance(passage["paragraph"], str)
    assert len(passage["paragraph"]) > 40
    assert isinstance(passage["sample_questions"], list)
    assert len(passage["sample_questions"]) >= 2
