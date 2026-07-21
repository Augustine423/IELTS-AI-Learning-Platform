export type CourseSkill = 'speaking' | 'listening' | 'reading' | 'writing';

export interface CourseLesson {
  id: string;
  skill: CourseSkill;
  order: number;
  title: string;
  durationMinutes: number;
  bandFocus: string;
  goal: string;
  outcomes: string[];
  coachBrief: string;
}

export interface SkillTrack {
  skill: CourseSkill;
  title: string;
  summary: string;
  band8Target: string;
  lessons: CourseLesson[];
}

export const COURSE_TARGET_BAND = 8.0;

export const COURSE_GUIDELINES = {
  title: 'IELTS Band 8.0 Accelerator',
  tagline: 'Voice-guided lessons for Speaking, Listening, Reading, and Writing',
  weeklyPlan:
    'Study 5–6 days a week: one focused lesson (20–30 min) plus one short review. Aim for two full-skill mock sessions each week.',
  scoringNote:
    'Band 8 means mostly accurate, flexible language with only occasional slips. Each lesson trains one Band 8 criterion, then the tutor gives a band hint and one upgrade action.',
  principles: [
    'Target Band 8 criteria explicitly: fluency, coherence, lexical resource, grammar range/accuracy, and task strategy.',
    'Practice under light time pressure, then review mistakes immediately with the AI tutor.',
    'Prefer precise vocabulary and natural linking over memorized templates.',
    'Record or repeat weak answers until they sound clear, complete, and controlled.',
  ],
} as const;

export const COURSE_TRACKS: SkillTrack[] = [
  {
    skill: 'speaking',
    title: 'Speaking',
    summary: 'Build Part 1–3 control for fluent, precise Band 8 answers.',
    band8Target:
      'Speak with only rare hesitation, flexible vocabulary, accurate complex grammar, and clear pronunciation.',
    lessons: [
      {
        id: 'sp-01',
        skill: 'speaking',
        order: 1,
        title: 'Fluency without fillers',
        durationMinutes: 20,
        bandFocus: 'Fluency and coherence',
        goal: 'Reduce fillers and keep a steady pace with clear idea links.',
        outcomes: [
          'Replace um, uh, and like with short planning pauses',
          'Use natural linkers: however, for instance, that said',
          'Deliver 3 extended answers without restarting',
        ],
        coachBrief:
          'Run short Part 1 drills. Interrupt only after answers. Count fillers, coach one linker upgrade, then re-ask the same question for a cleaner take.',
      },
      {
        id: 'sp-02',
        skill: 'speaking',
        order: 2,
        title: 'Part 1 precise answers',
        durationMinutes: 20,
        bandFocus: 'Task response and vocabulary',
        goal: 'Give direct answers with reasons and one concrete example.',
        outcomes: [
          'Answer in 3–5 sentences',
          'Include reason + example',
          'Avoid one-word replies and memorized scripts',
        ],
        coachBrief:
          'Ask Part 1 familiar-topic questions one by one. Require answer, reason, example. Give Band 8 feedback on specificity and lexical range.',
      },
      {
        id: 'sp-03',
        skill: 'speaking',
        order: 3,
        title: 'Part 2 structured storytelling',
        durationMinutes: 25,
        bandFocus: 'Coherence and development',
        goal: 'Speak for 1–2 minutes with a clear beginning, development, and close.',
        outcomes: [
          'Use a 4-point cue-card plan',
          'Sustain speech for about two minutes',
          'Finish with a reflection sentence',
        ],
        coachBrief:
          'Give a cue card, one minute of planning tips, then long turn practice. Feedback on structure, timing, and vocabulary upgrades.',
      },
      {
        id: 'sp-04',
        skill: 'speaking',
        order: 4,
        title: 'Part 3 abstract discussion',
        durationMinutes: 25,
        bandFocus: 'Ideas and complex language',
        goal: 'Discuss causes, effects, and opinions with balanced arguments.',
        outcomes: [
          'Compare two viewpoints',
          'Use conditional and contrast structures',
          'Support claims with real-world examples',
        ],
        coachBrief:
          'Ask deeper Part 3 questions. Push for balanced answers and precise academic vocabulary suitable for Band 8.',
      },
      {
        id: 'sp-05',
        skill: 'speaking',
        order: 5,
        title: 'Lexical upgrade for Band 8',
        durationMinutes: 20,
        bandFocus: 'Lexical resource',
        goal: 'Replace common words with precise, natural alternatives.',
        outcomes: [
          'Upgrade 8 weak phrases',
          'Use collocations correctly in answers',
          'Avoid forced rare words',
        ],
        coachBrief:
          'Elicit answers, then rewrite key sentences with stronger vocabulary. Have the learner repeat upgraded versions aloud.',
      },
      {
        id: 'sp-06',
        skill: 'speaking',
        order: 6,
        title: 'Pronunciation and stress',
        durationMinutes: 20,
        bandFocus: 'Pronunciation',
        goal: 'Improve word stress, sentence stress, and clarity.',
        outcomes: [
          'Mark stress on key content words',
          'Practice chunking long sentences',
          'Sound clearer at natural speed',
        ],
        coachBrief:
          'Model short lines with the selected accent. Drill stress and intonation, then re-run a short Part 1 set for clarity.',
      },
      {
        id: 'sp-07',
        skill: 'speaking',
        order: 7,
        title: 'Full speaking mock',
        durationMinutes: 30,
        bandFocus: 'Overall Band 8 performance',
        goal: 'Complete a realistic Part 1–3 mock with band-style feedback.',
        outcomes: [
          'Finish a full mock under timing',
          'Receive criterion-based feedback',
          'Leave with one priority upgrade',
        ],
        coachBrief:
          'Run a compact mock exam flow for Parts 1–3. End with estimated band hint and one concrete practice goal.',
      },
    ],
  },
  {
    skill: 'listening',
    title: 'Listening',
    summary: 'Train prediction, paraphrase recognition, and exam-section tactics.',
    band8Target:
      'Catch paraphrase quickly, avoid common traps, and stay accurate across all four sections.',
    lessons: [
      {
        id: 'ls-01',
        skill: 'listening',
        order: 1,
        title: 'Predict before you listen',
        durationMinutes: 20,
        bandFocus: 'Strategy',
        goal: 'Predict answer type and topic vocabulary before audio starts.',
        outcomes: [
          'Identify number, name, or idea answers',
          'Predict likely paraphrases',
          'Set listening focus before the clip',
        ],
        coachBrief:
          'Read questions aloud, coach prediction, then deliver a short spoken dialogue and check answers with trap analysis.',
      },
      {
        id: 'ls-02',
        skill: 'listening',
        order: 2,
        title: 'Section 1 form traps',
        durationMinutes: 20,
        bandFocus: 'Detail accuracy',
        goal: 'Capture names, numbers, dates, and spelling under distraction.',
        outcomes: [
          'Handle corrections in speech',
          'Spell names carefully',
          'Avoid writing the first distractor heard',
        ],
        coachBrief:
          'Simulate Section 1 booking or form dialogues. Include one correction. Teach students to wait for confirmation.',
      },
      {
        id: 'ls-03',
        skill: 'listening',
        order: 3,
        title: 'Multiple choice elimination',
        durationMinutes: 20,
        bandFocus: 'Paraphrase recognition',
        goal: 'Eliminate options that use the same words but wrong meaning.',
        outcomes: [
          'Spot same-word traps',
          'Match meaning not wording',
          'Justify the chosen option',
        ],
        coachBrief:
          'Give short talks with three options. Force elimination reasoning after each answer.',
      },
      {
        id: 'ls-04',
        skill: 'listening',
        order: 4,
        title: 'Map and direction language',
        durationMinutes: 20,
        bandFocus: 'Spatial listening',
        goal: 'Follow location language and landmark references accurately.',
        outcomes: [
          'Track left right opposite next to',
          'Update position after each clue',
          'Confirm final location',
        ],
        coachBrief:
          'Describe a simple map route verbally. Ask location questions and reteach missed direction phrases.',
      },
      {
        id: 'ls-05',
        skill: 'listening',
        order: 5,
        title: 'Section 4 lecture notes',
        durationMinutes: 25,
        bandFocus: 'Academic listening',
        goal: 'Track main ideas and supporting details in a short lecture.',
        outcomes: [
          'Note main point and two supports',
          'Catch signpost language',
          'Answer completion questions accurately',
        ],
        coachBrief:
          'Deliver a short academic mini-lecture. Ask note and completion questions. Coach signpost awareness.',
      },
      {
        id: 'ls-06',
        skill: 'listening',
        order: 6,
        title: 'Band 8 listening mock set',
        durationMinutes: 30,
        bandFocus: 'Overall accuracy',
        goal: 'Complete a mixed question set with review of every miss.',
        outcomes: [
          'Attempt mixed question types',
          'Classify each error type',
          'Set one weekly listening focus',
        ],
        coachBrief:
          'Run a mixed listening drill set, mark answers, and create an error log with next-step advice.',
      },
    ],
  },
  {
    skill: 'reading',
    title: 'Reading',
    summary: 'Master skimming, scanning, and high-band question logic.',
    band8Target:
      'Locate answers fast, handle True/False/Not Given precisely, and finish with time to spare.',
    lessons: [
      {
        id: 'rd-01',
        skill: 'reading',
        order: 1,
        title: 'Skimming for the main idea',
        durationMinutes: 20,
        bandFocus: 'Speed and gist',
        goal: 'Get passage purpose in under two minutes.',
        outcomes: [
          'State the main idea quickly',
          'Ignore unnecessary detail first',
          'Map paragraph functions',
        ],
        coachBrief:
          'Read a short passage aloud in chunks. Ask for main idea and paragraph roles before detail questions.',
      },
      {
        id: 'rd-02',
        skill: 'reading',
        order: 2,
        title: 'Scanning for detail',
        durationMinutes: 20,
        bandFocus: 'Locating information',
        goal: 'Find names, dates, and keywords without re-reading everything.',
        outcomes: [
          'Scan with keyword anchors',
          'Read only nearby sentences',
          'Confirm answer with paraphrase',
        ],
        coachBrief:
          'Give detail questions first, then the passage. Coach scanning paths and answer justification.',
      },
      {
        id: 'rd-03',
        skill: 'reading',
        order: 3,
        title: 'True False Not Given logic',
        durationMinutes: 25,
        bandFocus: 'Logical precision',
        goal: 'Distinguish contradiction from missing information.',
        outcomes: [
          'Define True False Not Given clearly',
          'Avoid overthinking',
          'Prove each answer from the text',
        ],
        coachBrief:
          'Teach the decision rule, then run TFNG items. Force text-based proof for every choice.',
      },
      {
        id: 'rd-04',
        skill: 'reading',
        order: 4,
        title: 'Matching headings',
        durationMinutes: 20,
        bandFocus: 'Paragraph purpose',
        goal: 'Match headings by idea, not shared keywords.',
        outcomes: [
          'Summarize each paragraph in one line',
          'Reject keyword-only matches',
          'Choose the best heading confidently',
        ],
        coachBrief:
          'Practice paragraph summary then heading choice. Highlight traps based on repeated wording.',
      },
      {
        id: 'rd-05',
        skill: 'reading',
        order: 5,
        title: 'Vocabulary in context',
        durationMinutes: 20,
        bandFocus: 'Lexical inference',
        goal: 'Infer meaning from context without translating every word.',
        outcomes: [
          'Use surrounding clues',
          'Guess then verify',
          'Build a mini synonym bank',
        ],
        coachBrief:
          'Ask meaning-from-context questions. Build a short Band 8 synonym set from the passage.',
      },
      {
        id: 'rd-06',
        skill: 'reading',
        order: 6,
        title: 'Time management for Band 8',
        durationMinutes: 25,
        bandFocus: 'Exam timing',
        goal: 'Allocate time by passage difficulty and recover from stuck questions.',
        outcomes: [
          'Use a 20-20-20 style split',
          'Skip and return strategically',
          'Protect easy marks first',
        ],
        coachBrief:
          'Simulate timed decisions on a short set. Coach when to skip, guess, and return.',
      },
    ],
  },
  {
    skill: 'writing',
    title: 'Writing',
    summary: 'Plan and upgrade Task 1 and Task 2 toward Band 8 quality.',
    band8Target:
      'Write clear overviews and arguments with flexible vocabulary, strong cohesion, and rare grammar errors.',
    lessons: [
      {
        id: 'wr-01',
        skill: 'writing',
        order: 1,
        title: 'Task 1 overview that scores',
        durationMinutes: 20,
        bandFocus: 'Task achievement',
        goal: 'Write a clear overview of key trends without data dumping.',
        outcomes: [
          'Identify two main features',
          'Avoid listing every number',
          'Produce a Band 8 overview sentence pair',
        ],
        coachBrief:
          'Describe a chart verbally. Coach overview first, then ask the learner to speak an improved overview.',
      },
      {
        id: 'wr-02',
        skill: 'writing',
        order: 2,
        title: 'Task 1 accurate comparisons',
        durationMinutes: 20,
        bandFocus: 'Data language',
        goal: 'Compare categories with precise comparative language.',
        outcomes: [
          'Use comparative and superlative forms',
          'Group data logically',
          'Avoid unsupported claims',
        ],
        coachBrief:
          'Drill comparison sentences from chart data. Correct accuracy and lexical range.',
      },
      {
        id: 'wr-03',
        skill: 'writing',
        order: 3,
        title: 'Task 2 thesis and plan',
        durationMinutes: 20,
        bandFocus: 'Task response',
        goal: 'Build a clear position and four-paragraph plan in minutes.',
        outcomes: [
          'Write a direct thesis',
          'Plan two body ideas',
          'Keep examples relevant',
        ],
        coachBrief:
          'Give a Task 2 prompt. Coach thesis and outline aloud before any paragraph drafting.',
      },
      {
        id: 'wr-04',
        skill: 'writing',
        order: 4,
        title: 'Cohesion without repetition',
        durationMinutes: 20,
        bandFocus: 'Coherence and cohesion',
        goal: 'Link ideas smoothly without overusing however and moreover.',
        outcomes: [
          'Vary cohesive devices',
          'Use referencing and substitution',
          'Keep paragraph focus tight',
        ],
        coachBrief:
          'Have the learner speak a body paragraph, then upgrade cohesion with natural linking.',
      },
      {
        id: 'wr-05',
        skill: 'writing',
        order: 5,
        title: 'Band 8 lexical range',
        durationMinutes: 20,
        bandFocus: 'Lexical resource',
        goal: 'Use topic vocabulary precisely and avoid awkward rare words.',
        outcomes: [
          'Build a topic word set',
          'Use collocations correctly',
          'Replace vague words like good and bad',
        ],
        coachBrief:
          'Elicit sentences, then upgrade vocabulary for precision. Ask for spoken revised versions.',
      },
      {
        id: 'wr-06',
        skill: 'writing',
        order: 6,
        title: 'Grammar under pressure',
        durationMinutes: 20,
        bandFocus: 'Grammatical range and accuracy',
        goal: 'Use complex sentences with controlled accuracy.',
        outcomes: [
          'Mix simple and complex forms',
          'Fix article and subject-verb errors',
          'Self-check one paragraph quickly',
        ],
        coachBrief:
          'Timed sentence-building and paragraph repair. Focus on high-frequency Band 7–8 grammar slips.',
      },
      {
        id: 'wr-07',
        skill: 'writing',
        order: 7,
        title: 'Timed Task 2 coaching',
        durationMinutes: 30,
        bandFocus: 'Overall Writing performance',
        goal: 'Produce a full Task 2 plan and spoken draft under time guidance.',
        outcomes: [
          'Plan in five minutes',
          'Speak through intro and one body paragraph',
          'Get criterion-based band feedback',
        ],
        coachBrief:
          'Run a timed Task 2 coaching loop. End with band hint across all four writing criteria and one rewrite goal.',
      },
    ],
  },
];

export function getTrack(skill: CourseSkill): SkillTrack | undefined {
  return COURSE_TRACKS.find((track) => track.skill === skill);
}

export function getLesson(lessonId: string): CourseLesson | undefined {
  for (const track of COURSE_TRACKS) {
    const lesson = track.lessons.find((item) => item.id === lessonId);
    if (lesson) {
      return lesson;
    }
  }
  return undefined;
}

export function listLessons(skill: CourseSkill): CourseLesson[] {
  return getTrack(skill)?.lessons ?? [];
}
