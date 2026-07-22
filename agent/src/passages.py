"""Sample IELTS-style listening and reading passages for the voice tutor."""

from __future__ import annotations

SAMPLE_LISTENING_PASSAGES: list[dict[str, str | list[str]]] = [
    {
        "id": "listen-campus-tour",
        "title": "Campus library tour",
        "paragraph": (
            "Good morning everyone, and welcome to the university library induction. "
            "My name is Claire Watson, and I will show you the main facilities today. "
            "The library opens at eight thirty on weekdays and at ten o'clock on Saturdays. "
            "It is closed on Sundays. When you enter through the main doors, the information "
            "desk is on your right. You can collect your student library card there. The quiet "
            "study area is on the second floor, while group discussion rooms are booked online "
            "and located on the third floor. Please note that food and drinks, except bottled "
            "water, are not allowed inside the reading rooms. If you lose a book, you must "
            "report it within three working days to avoid a late replacement fee."
        ),
        "sample_questions": [
            "What time does the library open on Saturdays?",
            "Where is the information desk?",
            "On which floor are the group discussion rooms?",
            "What drink is allowed in the reading rooms?",
        ],
    },
    {
        "id": "listen-city-museum",
        "title": "City museum booking call",
        "paragraph": (
            "Thank you for calling Riverside City Museum. This is a recorded message about "
            "weekend bookings. The special exhibition on ancient trade routes opens this Friday "
            "and runs for six weeks. Adult tickets cost twelve pounds, and student tickets cost "
            "eight pounds with a valid ID. Children under five can enter free. The last entry is "
            "at four fifteen in the afternoon, and the galleries close at five. If you want a "
            "guided tour, please arrive ten minutes early at the west entrance, not the main hall. "
            "Photography without flash is permitted in most rooms, but it is not allowed in the "
            "textile gallery."
        ),
        "sample_questions": [
            "How much is a student ticket?",
            "When is the last entry?",
            "Which entrance should visitors use for a guided tour?",
            "Where is photography not allowed?",
        ],
    },
    {
        "id": "listen-climate-talk",
        "title": "Short climate lecture",
        "paragraph": (
            "In today's lecture, we will examine how coastal cities are adapting to rising sea "
            "levels. Researchers have found that natural barriers such as mangrove forests can "
            "reduce wave energy by up to seventy percent in some regions. However, mangrove "
            "restoration is not always possible in dense urban areas. As an alternative, several "
            "cities have introduced elevated walkways and flexible zoning rules that move critical "
            "services inland. Another key point is community warning systems. Early alerts that "
            "combine satellite data with local sensors have cut evacuation times significantly. "
            "Finally, experts argue that successful adaptation depends less on a single engineering "
            "project and more on long-term planning that includes housing, transport, and public health."
        ),
        "sample_questions": [
            "By how much can mangroves reduce wave energy in some regions?",
            "What alternative do dense urban areas use when mangroves are not possible?",
            "What combination improves early warning systems?",
            "According to the lecture, what does successful adaptation depend on most?",
        ],
    },
]


def split_into_lines(paragraph: str) -> list[str]:
    parts: list[str] = []
    current = ""
    for char in paragraph.strip():
        current += char
        if char in ".!?" and current.strip():
            parts.append(current.strip())
            current = ""
    if current.strip():
        parts.append(current.strip())
    return parts


def get_default_listening_passage() -> dict[str, str | list[str]]:
    return SAMPLE_LISTENING_PASSAGES[0]
