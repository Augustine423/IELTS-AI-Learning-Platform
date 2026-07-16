import type { Skill } from "./api";

export interface Scenario {
  id: string;
  title: string;
  blurb: string;
  prompt: string;
}

/** Situational starters — natural conversational practice per skill. */
export const SCENARIOS: Record<Skill, Scenario[]> = {
  speaking: [
    {
      id: "part1-hometown",
      title: "Part 1 · Hometown",
      blurb: "Warm-up chat about where you live",
      prompt:
        "Let's practice IELTS Speaking Part 1. Act as the examiner. Ask warm-up questions about my hometown and daily life, one at a time. After each answer, give brief band-style feedback then ask the next question.",
    },
    {
      id: "cafe-roleplay",
      title: "Situation · Café order",
      blurb: "Everyday conversation at a café",
      prompt:
        "Let's do a situational dialogue for IELTS Speaking fluency. You are a friendly barista in a busy London café. Start the conversation, keep turns short and natural, and gently correct my English after each reply with one better phrase I could use.",
    },
    {
      id: "job-interview",
      title: "Situation · Job interview",
      blurb: "Formal Q&A with follow-ups",
      prompt:
        "Role-play an IELTS-style formal conversation: you are interviewing me for a graduate job. Ask one question at a time about strengths, teamwork, and future plans. Give concise feedback on fluency and vocabulary after each answer.",
    },
    {
      id: "part2-cue",
      title: "Part 2 · Cue card",
      blurb: "1–2 minute long turn practice",
      prompt:
        "Give me an IELTS Speaking Part 2 cue card (describe a memorable journey). Then listen to my long turn. After I finish, score Fluency, Lexical Resource, Grammar, and Pronunciation briefly and suggest two stronger phrases.",
    },
    {
      id: "part3-discussion",
      title: "Part 3 · Discussion",
      blurb: "Abstract follow-up questions",
      prompt:
        "Let's practice IELTS Speaking Part 3 on the topic of travel and culture. Ask thoughtful discussion questions one at a time, challenge my ideas politely, and give short coaching notes after each answer.",
    },
    {
      id: "campus-tour",
      title: "Situation · Campus help",
      blurb: "Asking for directions / info",
      prompt:
        "Situational dialogue: I am a new international student on campus. You are a helpful receptionist. Start by greeting me and offering help. Keep the conversation interactive and correct unnatural phrasing gently.",
    },
  ],
  listening: [
    {
      id: "section1-booking",
      title: "Section 1 · Booking call",
      blurb: "Form-filling conversation",
      prompt:
        "Create an IELTS Listening Section 1 style phone booking dialogue (hotel or course). Read it as a clear script I can listen to via TTS, then ask 5 form-completion questions. Wait for my answers before revealing the key.",
    },
    {
      id: "section2-tour",
      title: "Section 2 · Local tour",
      blurb: "Monologue + map questions",
      prompt:
        "Give me an IELTS Listening Section 2 monologue: a guide describing a local museum visit. Format the speech clearly for text-to-speech, then ask 5 multiple-choice comprehension questions.",
    },
    {
      id: "section3-study",
      title: "Section 3 · Study chat",
      blurb: "Two students discussing a project",
      prompt:
        "Create an IELTS Listening Section 3 conversation between two students planning a presentation. Provide the dialogue, then 5 matching or short-answer questions. Feedback after I answer.",
    },
    {
      id: "section4-lecture",
      title: "Section 4 · Mini lecture",
      blurb: "Academic monologue practice",
      prompt:
        "Present a short IELTS Listening Section 4 academic talk on renewable energy (clear TTS-friendly paragraphs), then 5 note-completion style questions.",
    },
  ],
  reading: [
    {
      id: "tfng-environment",
      title: "T / F / NG · Environment",
      blurb: "Academic passage + judgement",
      prompt:
        "Give me a short IELTS Academic Reading passage about climate adaptation (about 250–300 words) with 5 True / False / Not Given questions. Wait for my answers, then explain each with evidence from the text.",
    },
    {
      id: "headings-history",
      title: "Matching headings",
      blurb: "Paragraph purpose practice",
      prompt:
        "Provide a 4-paragraph IELTS Academic Reading extract on ancient trade routes and a list of headings to match. After I answer, explain why each match is correct or wrong.",
    },
    {
      id: "vocab-science",
      title: "Vocab in context",
      blurb: "Paraphrase & inference",
      prompt:
        "Share a short science reading (genetics or space) with 5 vocabulary-in-context and inference questions. Teach one useful paraphrase strategy after feedback.",
    },
  ],
  writing: [
    {
      id: "task2-opinion",
      title: "Task 2 · Opinion essay",
      blurb: "Agree / disagree topic",
      prompt:
        "Give me an IELTS Writing Task 2 opinion essay question on technology in education. Do not write the essay for me yet — wait for my draft, then mark it with TA, CC, LR, GRA band-style comments and 3 rewrite examples.",
    },
    {
      id: "task2-discuss",
      title: "Task 2 · Discuss both views",
      blurb: "Balanced discussion essay",
      prompt:
        "Provide an IELTS Writing Task 2 'discuss both views and give your opinion' question on remote work. I'll submit my essay; then give criterion-based feedback and a sample improved introduction.",
    },
    {
      id: "task1-graph",
      title: "Task 1 · Chart description",
      blurb: "Describe trends clearly",
      prompt:
        "Describe a simple bar chart scenario in words (city public transport use 2010 vs 2020) as if it were IELTS Academic Task 1. Ask me to write a report; then score Task Achievement, Coherence, Lexis, and Grammar.",
    },
    {
      id: "letter-gt",
      title: "Task 1 · Formal letter",
      blurb: "General Training style",
      prompt:
        "Give me an IELTS General Training Writing Task 1: write a formal letter of complaint about a delayed course start. I'll write the letter; then give band-style feedback and a stronger opening paragraph.",
    },
  ],
};

export const SKILL_META: Record<
  Skill,
  { name: string; tagline: string; accent: string }
> = {
  listening: {
    name: "Listening",
    tagline: "Hear it. Catch it. Answer it.",
    accent: "listening",
  },
  speaking: {
    name: "Speaking",
    tagline: "Situational dialogue with live coaching",
    accent: "speaking",
  },
  reading: {
    name: "Reading",
    tagline: "Passages, paraphrase, precision",
    accent: "reading",
  },
  writing: {
    name: "Writing",
    tagline: "Band-style feedback that teaches",
    accent: "writing",
  },
};
