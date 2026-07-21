"""Band 8.0 IELTS course curriculum used by the voice tutor."""

from __future__ import annotations

COURSE_TARGET_BAND = 8.0

COURSE_GUIDELINES = {
    "title": "IELTS Band 8.0 Accelerator",
    "weekly_plan": (
        "Study 5 to 6 days a week: one focused lesson of about 20 to 30 minutes "
        "plus one short review. Aim for two full-skill mock sessions each week."
    ),
    "scoring_note": (
        "Band 8 means mostly accurate, flexible language with only occasional slips. "
        "Each lesson trains one Band 8 criterion, then give a band hint and one upgrade action."
    ),
}

LESSONS: dict[str, dict] = {
    # Speaking
    "sp-01": {
        "skill": "speaking",
        "title": "Fluency without fillers",
        "band_focus": "Fluency and coherence",
        "goal": "Reduce fillers and keep a steady pace with clear idea links.",
        "coach_brief": (
            "Run short Part 1 drills. Interrupt only after answers. Count fillers, "
            "coach one linker upgrade, then re-ask the same question for a cleaner take."
        ),
    },
    "sp-02": {
        "skill": "speaking",
        "title": "Part 1 precise answers",
        "band_focus": "Task response and vocabulary",
        "goal": "Give direct answers with reasons and one concrete example.",
        "coach_brief": (
            "Ask Part 1 familiar-topic questions one by one. Require answer, reason, "
            "example. Give Band 8 feedback on specificity and lexical range."
        ),
    },
    "sp-03": {
        "skill": "speaking",
        "title": "Part 2 structured storytelling",
        "band_focus": "Coherence and development",
        "goal": "Speak for 1 to 2 minutes with a clear beginning, development, and close.",
        "coach_brief": (
            "Give a cue card, one minute of planning tips, then long turn practice. "
            "Feedback on structure, timing, and vocabulary upgrades."
        ),
    },
    "sp-04": {
        "skill": "speaking",
        "title": "Part 3 abstract discussion",
        "band_focus": "Ideas and complex language",
        "goal": "Discuss causes, effects, and opinions with balanced arguments.",
        "coach_brief": (
            "Ask deeper Part 3 questions. Push for balanced answers and precise "
            "academic vocabulary suitable for Band 8."
        ),
    },
    "sp-05": {
        "skill": "speaking",
        "title": "Lexical upgrade for Band 8",
        "band_focus": "Lexical resource",
        "goal": "Replace common words with precise, natural alternatives.",
        "coach_brief": (
            "Elicit answers, then rewrite key sentences with stronger vocabulary. "
            "Have the learner repeat upgraded versions aloud."
        ),
    },
    "sp-06": {
        "skill": "speaking",
        "title": "Pronunciation and stress",
        "band_focus": "Pronunciation",
        "goal": "Improve word stress, sentence stress, and clarity.",
        "coach_brief": (
            "Model short lines with the selected accent. Drill stress and intonation, "
            "then re-run a short Part 1 set for clarity."
        ),
    },
    "sp-07": {
        "skill": "speaking",
        "title": "Full speaking mock",
        "band_focus": "Overall Band 8 performance",
        "goal": "Complete a realistic Part 1 to 3 mock with band-style feedback.",
        "coach_brief": (
            "Run a compact mock exam flow for Parts 1 to 3. End with estimated band "
            "hint and one concrete practice goal."
        ),
    },
    # Listening
    "ls-01": {
        "skill": "listening",
        "title": "Predict before you listen",
        "band_focus": "Strategy",
        "goal": "Predict answer type and topic vocabulary before audio starts.",
        "coach_brief": (
            "Read questions aloud, coach prediction, then deliver a short spoken "
            "dialogue and check answers with trap analysis."
        ),
    },
    "ls-02": {
        "skill": "listening",
        "title": "Section 1 form traps",
        "band_focus": "Detail accuracy",
        "goal": "Capture names, numbers, dates, and spelling under distraction.",
        "coach_brief": (
            "Simulate Section 1 booking or form dialogues. Include one correction. "
            "Teach students to wait for confirmation."
        ),
    },
    "ls-03": {
        "skill": "listening",
        "title": "Multiple choice elimination",
        "band_focus": "Paraphrase recognition",
        "goal": "Eliminate options that use the same words but wrong meaning.",
        "coach_brief": (
            "Give short talks with three options. Force elimination reasoning after each answer."
        ),
    },
    "ls-04": {
        "skill": "listening",
        "title": "Map and direction language",
        "band_focus": "Spatial listening",
        "goal": "Follow location language and landmark references accurately.",
        "coach_brief": (
            "Describe a simple map route verbally. Ask location questions and "
            "reteach missed direction phrases."
        ),
    },
    "ls-05": {
        "skill": "listening",
        "title": "Section 4 lecture notes",
        "band_focus": "Academic listening",
        "goal": "Track main ideas and supporting details in a short lecture.",
        "coach_brief": (
            "Deliver a short academic mini-lecture. Ask note and completion questions. "
            "Coach signpost awareness."
        ),
    },
    "ls-06": {
        "skill": "listening",
        "title": "Band 8 listening mock set",
        "band_focus": "Overall accuracy",
        "goal": "Complete a mixed question set with review of every miss.",
        "coach_brief": (
            "Run a mixed listening drill set, mark answers, and create an error log "
            "with next-step advice."
        ),
    },
    # Reading
    "rd-01": {
        "skill": "reading",
        "title": "Skimming for the main idea",
        "band_focus": "Speed and gist",
        "goal": "Get passage purpose in under two minutes.",
        "coach_brief": (
            "Read a short passage aloud in chunks. Ask for main idea and paragraph "
            "roles before detail questions."
        ),
    },
    "rd-02": {
        "skill": "reading",
        "title": "Scanning for detail",
        "band_focus": "Locating information",
        "goal": "Find names, dates, and keywords without re-reading everything.",
        "coach_brief": (
            "Give detail questions first, then the passage. Coach scanning paths "
            "and answer justification."
        ),
    },
    "rd-03": {
        "skill": "reading",
        "title": "True False Not Given logic",
        "band_focus": "Logical precision",
        "goal": "Distinguish contradiction from missing information.",
        "coach_brief": (
            "Teach the decision rule, then run True False Not Given items. Force "
            "text-based proof for every choice."
        ),
    },
    "rd-04": {
        "skill": "reading",
        "title": "Matching headings",
        "band_focus": "Paragraph purpose",
        "goal": "Match headings by idea, not shared keywords.",
        "coach_brief": (
            "Practice paragraph summary then heading choice. Highlight traps based "
            "on repeated wording."
        ),
    },
    "rd-05": {
        "skill": "reading",
        "title": "Vocabulary in context",
        "band_focus": "Lexical inference",
        "goal": "Infer meaning from context without translating every word.",
        "coach_brief": (
            "Ask meaning-from-context questions. Build a short Band 8 synonym set "
            "from the passage."
        ),
    },
    "rd-06": {
        "skill": "reading",
        "title": "Time management for Band 8",
        "band_focus": "Exam timing",
        "goal": "Allocate time by passage difficulty and recover from stuck questions.",
        "coach_brief": (
            "Simulate timed decisions on a short set. Coach when to skip, guess, and return."
        ),
    },
    # Writing
    "wr-01": {
        "skill": "writing",
        "title": "Task 1 overview that scores",
        "band_focus": "Task achievement",
        "goal": "Write a clear overview of key trends without data dumping.",
        "coach_brief": (
            "Describe a chart verbally. Coach overview first, then ask the learner "
            "to speak an improved overview."
        ),
    },
    "wr-02": {
        "skill": "writing",
        "title": "Task 1 accurate comparisons",
        "band_focus": "Data language",
        "goal": "Compare categories with precise comparative language.",
        "coach_brief": (
            "Drill comparison sentences from chart data. Correct accuracy and lexical range."
        ),
    },
    "wr-03": {
        "skill": "writing",
        "title": "Task 2 thesis and plan",
        "band_focus": "Task response",
        "goal": "Build a clear position and four-paragraph plan in minutes.",
        "coach_brief": (
            "Give a Task 2 prompt. Coach thesis and outline aloud before any paragraph drafting."
        ),
    },
    "wr-04": {
        "skill": "writing",
        "title": "Cohesion without repetition",
        "band_focus": "Coherence and cohesion",
        "goal": "Link ideas smoothly without overusing however and moreover.",
        "coach_brief": (
            "Have the learner speak a body paragraph, then upgrade cohesion with natural linking."
        ),
    },
    "wr-05": {
        "skill": "writing",
        "title": "Band 8 lexical range",
        "band_focus": "Lexical resource",
        "goal": "Use topic vocabulary precisely and avoid awkward rare words.",
        "coach_brief": (
            "Elicit sentences, then upgrade vocabulary for precision. Ask for spoken revised versions."
        ),
    },
    "wr-06": {
        "skill": "writing",
        "title": "Grammar under pressure",
        "band_focus": "Grammatical range and accuracy",
        "goal": "Use complex sentences with controlled accuracy.",
        "coach_brief": (
            "Timed sentence-building and paragraph repair. Focus on high-frequency "
            "Band 7 to 8 grammar slips."
        ),
    },
    "wr-07": {
        "skill": "writing",
        "title": "Timed Task 2 coaching",
        "band_focus": "Overall Writing performance",
        "goal": "Produce a full Task 2 plan and spoken draft under time guidance.",
        "coach_brief": (
            "Run a timed Task 2 coaching loop. End with band hint across all four "
            "writing criteria and one rewrite goal."
        ),
    },
}


def get_lesson(lesson_id: str | None) -> dict | None:
    if not lesson_id:
        return None
    return LESSONS.get(lesson_id)


def lesson_instructions(lesson: dict) -> str:
    return (
        f"Active Band {COURSE_TARGET_BAND} lesson: {lesson['title']}. "
        f"Skill: {lesson['skill']}. Focus: {lesson['band_focus']}. "
        f"Goal: {lesson['goal']}. "
        f"Teaching plan: {lesson['coach_brief']} "
        f"Always keep the target score around Band {COURSE_TARGET_BAND}. "
        "If the lesson needs current examples or facts, use search_web_for_ielts, "
        "then summarize the online findings in spoken English. "
        "At the end, give a brief band hint and exactly one next practice action."
    )
