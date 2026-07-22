'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type {
  SessionMode,
  VoiceAccent,
  VoiceGender,
  VoicePreference,
} from '@/components/app/session-mode';
import { Button } from '@/components/ui/button';
import {
  SAMPLE_LISTENING_PASSAGES,
  SAMPLE_READING_PASSAGES,
  SKILL_META,
  splitParagraphIntoLines,
  type SkillId,
} from '@/lib/skill-content';
import { COURSE_GUIDELINES, COURSE_TARGET_BAND, listLessons } from '@/lib/ielts-course';

const ACCENTS: { id: VoiceAccent; label: string }[] = [
  { id: 'uk', label: 'UK' },
  { id: 'us', label: 'US' },
  { id: 'au', label: 'Australian' },
];

const GENDERS: { id: VoiceGender; label: string }[] = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
];

export type WelcomeVariant = 'hub' | 'speaking' | 'listening' | 'reading';

interface WelcomeViewProps {
  startButtonText: string;
  welcomeVariant?: WelcomeVariant;
  onStartCall: (
    mode: SessionMode,
    voice: VoicePreference,
    lessonId?: string,
    passage?: string,
    passageTitle?: string
  ) => void;
}

function VoicePicker({
  accent,
  gender,
  onAccent,
  onGender,
}: {
  accent: VoiceAccent;
  gender: VoiceGender;
  onAccent: (accent: VoiceAccent) => void;
  onGender: (gender: VoiceGender) => void;
}) {
  return (
    <div>
      <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
        Tutor voice
      </p>
      <div className="flex flex-wrap gap-2">
        {GENDERS.map((option) => (
          <Button
            key={option.id}
            type="button"
            size="sm"
            variant={gender === option.id ? 'default' : 'outline'}
            onClick={() => onGender(option.id)}
            className="rounded-full font-mono text-xs uppercase"
          >
            {option.label}
          </Button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {ACCENTS.map((option) => (
          <Button
            key={option.id}
            type="button"
            size="sm"
            variant={accent === option.id ? 'default' : 'outline'}
            onClick={() => onAccent(option.id)}
            className="rounded-full font-mono text-xs uppercase"
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export const WelcomeView = ({
  startButtonText,
  welcomeVariant = 'hub',
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const [accent, setAccent] = useState<VoiceAccent>('uk');
  const [gender, setGender] = useState<VoiceGender>('female');
  const [selectedListeningId, setSelectedListeningId] = useState(SAMPLE_LISTENING_PASSAGES[0].id);
  const [customListening, setCustomListening] = useState('');
  const [customListeningTitle, setCustomListeningTitle] = useState('My listening story');
  const [selectedReadingId, setSelectedReadingId] = useState(SAMPLE_READING_PASSAGES[0].id);
  const [customReading, setCustomReading] = useState('');
  const [customReadingTitle, setCustomReadingTitle] = useState('My reading passage');

  const voice: VoicePreference = { accent, gender };
  const speakingLessons = listLessons('speaking');

  const activeListening = useMemo(() => {
    if (customListening.trim()) {
      return {
        title: customListeningTitle.trim() || 'Custom listening story',
        paragraph: customListening.trim(),
      };
    }
    const sample = SAMPLE_LISTENING_PASSAGES.find((item) => item.id === selectedListeningId);
    return {
      title: sample?.title ?? 'Listening passage',
      paragraph: sample?.paragraph ?? '',
    };
  }, [customListening, customListeningTitle, selectedListeningId]);

  const activeReading = useMemo(() => {
    if (customReading.trim()) {
      return {
        title: customReadingTitle.trim() || 'Custom reading passage',
        lines: splitParagraphIntoLines(customReading.trim()),
        paragraph: customReading.trim(),
      };
    }
    const sample = SAMPLE_READING_PASSAGES.find((item) => item.id === selectedReadingId);
    return {
      title: sample?.title ?? 'Reading passage',
      lines: sample?.lines ?? [],
      paragraph: sample?.lines.join(' ') ?? '',
    };
  }, [customReading, customReadingTitle, selectedReadingId]);

  if (welcomeVariant === 'hub') {
    const skills = Object.keys(SKILL_META) as SkillId[];
    return (
      <div ref={ref} className="max-h-svh overflow-y-auto">
        <section className="bg-background flex flex-col items-center px-6 py-10 text-center">
          <p className="text-foreground max-w-prose pt-1 text-2xl leading-8 font-semibold tracking-tight">
            {COURSE_GUIDELINES.title}
          </p>
          <p className="text-muted-foreground mt-3 max-w-xl text-sm leading-6">
            Choose a skill page. Speaking, Listening, and Reading use the LiveKit voice agent. Writing
            uses a free local Ollama LLM in Docker.
          </p>
          <div className="mt-8 grid w-full max-w-3xl gap-3 text-left sm:grid-cols-2">
            {skills.map((skill) => {
              const meta = SKILL_META[skill];
              return (
                <Link
                  key={skill}
                  href={meta.href}
                  className="border-border hover:bg-accent/40 rounded-2xl border px-5 py-4 transition-colors"
                >
                  <p className="text-foreground text-base font-semibold">{meta.title}</p>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">{meta.summary}</p>
                  <p className="text-muted-foreground mt-3 font-mono text-[10px] tracking-wider uppercase">
                    {meta.engine}
                  </p>
                </Link>
              );
            })}
          </div>
          <Button
            size="lg"
            variant="outline"
            onClick={() => onStartCall('general', voice)}
            className="mt-8 rounded-full font-mono text-xs font-bold tracking-wider uppercase"
          >
            {startButtonText}
          </Button>
        </section>
      </div>
    );
  }

  if (welcomeVariant === 'listening') {
    return (
      <div ref={ref} className="max-h-svh overflow-y-auto">
        <section className="bg-background mx-auto flex w-full max-w-3xl flex-col px-6 py-10">
          <p className="text-foreground text-2xl font-semibold tracking-tight">Listening practice</p>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Pick a sample IELTS-style paragraph or paste your own story. The AI will read it aloud,
            then ask questions about it.
          </p>

          <div className="mt-8 space-y-6">
            <VoicePicker
              accent={accent}
              gender={gender}
              onAccent={setAccent}
              onGender={setGender}
            />

            <div>
              <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                Sample passages
              </p>
              <div className="space-y-2">
                {SAMPLE_LISTENING_PASSAGES.map((passage) => (
                  <button
                    key={passage.id}
                    type="button"
                    onClick={() => {
                      setSelectedListeningId(passage.id);
                      setCustomListening('');
                    }}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                      selectedListeningId === passage.id && !customListening.trim()
                        ? 'border-foreground bg-accent/50'
                        : 'border-border hover:bg-accent/40'
                    }`}
                  >
                    <p className="text-foreground text-sm font-semibold">{passage.title}</p>
                    <p className="text-muted-foreground mt-1 text-xs">{passage.section}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                Or add your own paragraph / story
              </p>
              <input
                value={customListeningTitle}
                onChange={(e) => setCustomListeningTitle(e.target.value)}
                placeholder="Title"
                className="border-border bg-background mb-2 w-full rounded-xl border px-3 py-2 text-sm"
              />
              <textarea
                value={customListening}
                onChange={(e) => setCustomListening(e.target.value)}
                placeholder="Paste an IELTS-style dialogue, announcement, or short lecture..."
                rows={6}
                className="border-border bg-background w-full rounded-xl border px-3 py-2 text-sm leading-6"
              />
            </div>

            <div className="border-border rounded-2xl border px-4 py-3">
              <p className="text-foreground text-sm font-semibold">Selected: {activeListening.title}</p>
              <p className="text-muted-foreground mt-2 max-h-40 overflow-y-auto text-xs leading-5">
                {activeListening.paragraph}
              </p>
            </div>

            <Button
              size="lg"
              disabled={!activeListening.paragraph}
              onClick={() =>
                onStartCall(
                  'listening',
                  voice,
                  undefined,
                  activeListening.paragraph,
                  activeListening.title
                )
              }
              className="w-full rounded-full font-mono text-xs font-bold tracking-wider uppercase"
            >
              Start listening session
            </Button>
          </div>
        </section>
      </div>
    );
  }

  if (welcomeVariant === 'reading') {
    return (
      <div ref={ref} className="max-h-svh overflow-y-auto">
        <section className="bg-background mx-auto flex w-full max-w-3xl flex-col px-6 py-10">
          <p className="text-foreground text-2xl font-semibold tracking-tight">Reading aloud</p>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Choose a passage, start the session, then read each line aloud. The AI listens and gives
            pronunciation suggestions line by line.
          </p>

          <div className="mt-8 space-y-6">
            <VoicePicker
              accent={accent}
              gender={gender}
              onAccent={setAccent}
              onGender={setGender}
            />

            <div>
              <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                Sample passages
              </p>
              <div className="space-y-2">
                {SAMPLE_READING_PASSAGES.map((passage) => (
                  <button
                    key={passage.id}
                    type="button"
                    onClick={() => {
                      setSelectedReadingId(passage.id);
                      setCustomReading('');
                    }}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                      selectedReadingId === passage.id && !customReading.trim()
                        ? 'border-foreground bg-accent/50'
                        : 'border-border hover:bg-accent/40'
                    }`}
                  >
                    <p className="text-foreground text-sm font-semibold">{passage.title}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {passage.lines.length} lines
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
                Or paste your own text
              </p>
              <input
                value={customReadingTitle}
                onChange={(e) => setCustomReadingTitle(e.target.value)}
                placeholder="Title"
                className="border-border bg-background mb-2 w-full rounded-xl border px-3 py-2 text-sm"
              />
              <textarea
                value={customReading}
                onChange={(e) => setCustomReading(e.target.value)}
                placeholder="Paste sentences to practise pronunciation..."
                rows={5}
                className="border-border bg-background w-full rounded-xl border px-3 py-2 text-sm leading-6"
              />
            </div>

            <div className="border-border rounded-2xl border px-4 py-3">
              <p className="text-foreground text-sm font-semibold">Lines to read: {activeReading.title}</p>
              <ol className="text-muted-foreground mt-2 max-h-48 list-decimal space-y-2 overflow-y-auto pl-5 text-xs leading-5">
                {activeReading.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </div>

            <Button
              size="lg"
              disabled={!activeReading.paragraph}
              onClick={() =>
                onStartCall(
                  'reading',
                  voice,
                  undefined,
                  activeReading.paragraph,
                  activeReading.title
                )
              }
              className="w-full rounded-full font-mono text-xs font-bold tracking-wider uppercase"
            >
              Start pronunciation coaching
            </Button>
          </div>
        </section>
      </div>
    );
  }

  // speaking
  return (
    <div ref={ref} className="max-h-svh overflow-y-auto">
      <section className="bg-background mx-auto flex w-full max-w-3xl flex-col px-6 py-10">
        <p className="text-foreground text-2xl font-semibold tracking-tight">Speaking practice</p>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Keep using the current LiveKit voice agent for IELTS Speaking Parts 1–3. Target around Band{' '}
          {COURSE_TARGET_BAND}.
        </p>

        <div className="mt-8 space-y-6">
          <VoicePicker accent={accent} gender={gender} onAccent={setAccent} onGender={setGender} />

          <div>
            <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
              Guided lessons
            </p>
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {speakingLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => onStartCall('speaking', voice, lesson.id)}
                  className="border-border hover:bg-accent/40 w-full rounded-2xl border px-4 py-3 text-left transition-colors"
                >
                  <p className="text-foreground text-sm font-semibold">
                    {lesson.order}. {lesson.title}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">{lesson.goal}</p>
                </button>
              ))}
            </div>
          </div>

          <Button
            size="lg"
            onClick={() => onStartCall('speaking', voice)}
            className="w-full rounded-full font-mono text-xs font-bold tracking-wider uppercase"
          >
            Free speaking practice
          </Button>
        </div>
      </section>
    </div>
  );
};
