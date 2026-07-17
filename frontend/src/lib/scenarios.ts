import type { Skill } from "./api";

export interface Scenario {
  id: string;
  title: string;
  blurb: string;
  prompt: string;
}

/**
 * Situational starters — original role-play prompts inspired by common free
 * ESL travel/everyday English themes (airport, hotel, transport, dining, etc.).
 * Prompts teach useful phrases; they do not copy copyrighted scripts.
 */
export const SCENARIOS: Record<Skill, Scenario[]> = {
  speaking: [
    {
      id: "airport-checkin",
      title: "Situation · Airport check-in",
      blurb: "Passport, bags, seats, flight delays",
      prompt:
        "Situational IELTS Speaking dialogue at an international airport. You are a polite check-in agent. I am a traveller. Start by greeting me and asking for my passport and booking reference. Cover: checked vs cabin bags, seat preference, overweight bags, and a short delay announcement. Keep turns short and natural. After each of my replies, give one better phrase I could use (e.g. “I'd like a window seat, please”). Teach useful words: boarding pass, gate, layover, excess baggage.",
    },
    {
      id: "airport-lost-bag",
      title: "Situation · Lost luggage",
      blurb: "Report a missing bag at arrivals",
      prompt:
        "Role-play: my checked bag did not arrive. You are airport lost-luggage staff. Ask me to describe the bag (colour, size, wheels, tag), flight number, and contact details. Guide me through filing a PIR (Property Irregularity Report). Keep it realistic and calm. After each turn, coach one clearer travel phrase.",
    },
    {
      id: "hotel-reservation",
      title: "Situation · Hotel reservation",
      blurb: "Book a room, ask about amenities",
      prompt:
        "Situational dialogue: I want to reserve a hotel room for 3 nights. You are the front-desk receptionist. Cover dates, single/double room, breakfast, Wi‑Fi, check-in time, and price. Ask clarifying questions one at a time. After each reply, suggest one more natural hotel phrase (e.g. “Do you have a twin room available?”).",
    },
    {
      id: "hotel-checkin",
      title: "Situation · Hotel check-in",
      blurb: "Arrive, get key, request extras",
      prompt:
        "Role-play hotel check-in. You are reception; I just arrived with a booking. Confirm my name and nights, explain breakfast hours, give room number and Wi‑Fi password, and handle one request (late checkout or extra towels). Correct unnatural phrasing gently after each turn.",
    },
    {
      id: "bank-account",
      title: "Situation · At the bank",
      blurb: "Open account / withdraw / ask fees",
      prompt:
        "Situational dialogue at a bank. You are a helpful bank teller. I am an international student who needs to open a basic account or withdraw cash and ask about fees/ATM limits. Use clear formal customer-service English. After each of my answers, give one stronger banking phrase (e.g. “I'd like to open a current account, please”).",
    },
    {
      id: "hospital-clinic",
      title: "Situation · Hospital / clinic",
      blurb: "Describe symptoms, make appointment",
      prompt:
        "Role-play a doctor's clinic visit. You are a friendly GP/nurse. I describe symptoms (fever, sore throat, or stomach pain — I choose). Ask about duration, allergies, and medication. Suggest next steps (rest, prescription, tests). Keep language clear and calm. After each turn, teach one useful health phrase (e.g. “I've had a fever since yesterday”).",
    },
    {
      id: "cafe-order",
      title: "Situation · Coffee order",
      blurb: "Size, milk, takeaway, payment",
      prompt:
        "Café role-play for fluency. You are a barista in a busy café. Take my order: drink type, size, milk options, hot/iced, takeaway or stay, and payment. Offer one upsell naturally. Keep turns short. After each reply, give one better café phrase (e.g. “Could I get that oat milk, please?”).",
    },
    {
      id: "restaurant-order",
      title: "Situation · Restaurant meal",
      blurb: "Menu, allergies, bill, tip",
      prompt:
        "Restaurant dialogue. You are a waiter/waitress. Help me understand the menu, ask about allergies or vegetarian options, take starters/mains/drinks, then bring the bill. If I ask, explain a dish simply. After each turn, coach one polite dining phrase (e.g. “Could we have the bill, please?” / “I'm allergic to nuts”).",
    },
    {
      id: "bus-ride",
      title: "Situation · Taking the bus",
      blurb: "Stops, tickets, asking directions",
      prompt:
        "Public transport role-play. You are a bus driver or ticket clerk. I need to go to a city landmark (museum/station/university). Cover which bus number, fare, where to get off, and how to buy a ticket/pass. Use clear, simple English. After each reply, suggest one natural transport phrase (e.g. “Does this bus go to the city centre?”).",
    },
    {
      id: "taxi-ride",
      title: "Situation · Taking a taxi",
      blurb: "Destination, route, fare, payment",
      prompt:
        "Taxi dialogue. You are the driver. I tell you my destination (airport or hotel). Confirm the address, estimate time/fare, ask about bags, and discuss cash vs card. If the route seems wrong, I may politely question it — respond helpfully. After each turn, teach one useful taxi phrase (e.g. “Could you take me to Terminal 2, please?”).",
    },
    {
      id: "part1-hometown",
      title: "Exam · Part 1 warm-up",
      blurb: "Hometown & daily life questions",
      prompt:
        "IELTS Speaking Part 1 practice. Act as the examiner. Ask warm-up questions about my hometown and daily life, one at a time. After each answer, give brief band-style feedback then ask the next question.",
    },
    {
      id: "part2-cue",
      title: "Exam · Part 2 cue card",
      blurb: "1–2 minute long turn",
      prompt:
        "Give me an IELTS Speaking Part 2 cue card (describe a memorable journey). Then listen to my long turn. After I finish, score Fluency, Lexical Resource, Grammar, and Pronunciation briefly and suggest two stronger phrases.",
    },
    {
      id: "part3-discussion",
      title: "Exam · Part 3 discussion",
      blurb: "Travel & culture follow-ups",
      prompt:
        "IELTS Speaking Part 3 on travel and culture. Ask thoughtful discussion questions one at a time, challenge my ideas politely, and give short coaching notes after each answer.",
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
  { name: string; tagline: string; accent: string; description: string; icon: "headphones" | "mic" | "book-open" | "pen" }
> = {
  listening: {
    name: "Listening",
    tagline: "Hear it. Catch it. Answer it.",
    accent: "listening",
    description: "Section-style scripts, comprehension drills, and LiveKit voice practice.",
    icon: "headphones",
  },
  speaking: {
    name: "Speaking",
    tagline: "Real-life situations + exam practice",
    accent: "speaking",
    description:
      "Airport, hotel, bank, hospital, café, restaurant, bus & taxi role-plays, plus IELTS Parts 1–3.",
    icon: "mic",
  },
  reading: {
    name: "Reading",
    tagline: "Passages, paraphrase, precision",
    accent: "reading",
    description: "Academic & GT passages with coaching via chat or voice.",
    icon: "book-open",
  },
  writing: {
    name: "Writing",
    tagline: "Band-style feedback that teaches",
    accent: "writing",
    description: "Task 1 & 2 feedback with LiveKit or text chat.",
    icon: "pen",
  },
};

/** Always available in the UI — does not depend on the backend API. */
export const SKILL_LIST: Skill[] = [
  "listening",
  "speaking",
  "reading",
  "writing",
];
