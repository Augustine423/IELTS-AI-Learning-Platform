export type SkillId = 'speaking' | 'listening' | 'reading' | 'writing';

export interface ListeningPassage {
  id: string;
  title: string;
  section: string;
  paragraph: string;
  sampleQuestions: string[];
}

export interface ReadingPassage {
  id: string;
  title: string;
  lines: string[];
}

export const SKILL_META: Record<
  SkillId,
  { title: string; href: string; summary: string; engine: string }
> = {
  speaking: {
    title: 'Speaking',
    href: '/speaking',
    summary: 'LiveKit voice tutor for IELTS Parts 1–3 with band-style feedback.',
    engine: 'LiveKit Agent',
  },
  listening: {
    title: 'Listening',
    href: '/listening',
    summary: 'AI reads an IELTS-style paragraph, then asks exam questions.',
    engine: 'LiveKit Agent',
  },
  reading: {
    title: 'Reading aloud',
    href: '/reading',
    summary: 'You read line by line; AI listens and coaches pronunciation.',
    engine: 'LiveKit Agent',
  },
  writing: {
    title: 'Writing',
    href: '/writing',
    summary: 'Type a sentence and get free local LLM upgrade suggestions.',
    engine: 'Ollama (free Docker LLM)',
  },
};

export const SAMPLE_LISTENING_PASSAGES: ListeningPassage[] = [
  {
    id: 'listen-campus-tour',
    title: 'Campus library tour',
    section: 'Section 1 style',
    paragraph:
      "Good morning everyone, and welcome to the university library induction. My name is Claire Watson, and I will show you the main facilities today. The library opens at eight thirty on weekdays and at ten o'clock on Saturdays. It is closed on Sundays. When you enter through the main doors, the information desk is on your right. You can collect your student library card there. The quiet study area is on the second floor, while group discussion rooms are booked online and located on the third floor. Please note that food and drinks, except bottled water, are not allowed inside the reading rooms. If you lose a book, you must report it within three working days to avoid a late replacement fee.",
    sampleQuestions: [
      'What time does the library open on Saturdays?',
      'Where is the information desk?',
      'On which floor are the group discussion rooms?',
      'What drink is allowed in the reading rooms?',
    ],
  },
  {
    id: 'listen-city-museum',
    title: 'City museum booking call',
    section: 'Section 1 style',
    paragraph:
      'Thank you for calling Riverside City Museum. This is a recorded message about weekend bookings. The special exhibition on ancient trade routes opens this Friday and runs for six weeks. Adult tickets cost twelve pounds, and student tickets cost eight pounds with a valid ID. Children under five can enter free. The last entry is at four fifteen in the afternoon, and the galleries close at five. If you want a guided tour, please arrive ten minutes early at the west entrance, not the main hall. Photography without flash is permitted in most rooms, but it is not allowed in the textile gallery.',
    sampleQuestions: [
      'How much is a student ticket?',
      'When is the last entry?',
      'Which entrance should visitors use for a guided tour?',
      'Where is photography not allowed?',
    ],
  },
  {
    id: 'listen-climate-talk',
    title: 'Short climate lecture',
    section: 'Section 4 style',
    paragraph:
      "In today's lecture, we will examine how coastal cities are adapting to rising sea levels. Researchers have found that natural barriers such as mangrove forests can reduce wave energy by up to seventy percent in some regions. However, mangrove restoration is not always possible in dense urban areas. As an alternative, several cities have introduced elevated walkways and flexible zoning rules that move critical services inland. Another key point is community warning systems. Early alerts that combine satellite data with local sensors have cut evacuation times significantly. Finally, experts argue that successful adaptation depends less on a single engineering project and more on long-term planning that includes housing, transport, and public health.",
    sampleQuestions: [
      'By how much can mangroves reduce wave energy in some regions?',
      'What alternative do dense urban areas use when mangroves are not possible?',
      'What combination improves early warning systems?',
      'According to the lecture, what does successful adaptation depend on most?',
    ],
  },
];

export const SAMPLE_READING_PASSAGES: ReadingPassage[] = [
  {
    id: 'read-daily-routine',
    title: 'A clear daily routine',
    lines: [
      'I usually wake up early and drink a glass of water.',
      'After that, I review new English vocabulary for fifteen minutes.',
      'Then I practise speaking aloud so my pronunciation becomes clearer.',
      'In the evening, I write one short paragraph and check my grammar.',
      'This simple routine helps me improve steadily toward Band eight.',
    ],
  },
  {
    id: 'read-travel-story',
    title: 'A memorable journey',
    lines: [
      'Last year I travelled to a small coastal town with my family.',
      'The journey took four hours, but the scenery was beautiful.',
      'We walked along the harbour and talked to local fishermen.',
      'I learned several useful phrases I had never heard before.',
      'That trip showed me how travel can improve real communication skills.',
    ],
  },
  {
    id: 'read-study-advice',
    title: 'Study advice for IELTS',
    lines: [
      'Successful IELTS candidates practise under light time pressure.',
      'They focus on one skill each day instead of mixing everything.',
      'When they make mistakes, they correct them immediately.',
      'Clear pronunciation and natural linking matter as much as vocabulary.',
      'Consistent review is more effective than long irregular study sessions.',
    ],
  },
];

export function splitParagraphIntoLines(paragraph: string): string[] {
  return paragraph
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
}
