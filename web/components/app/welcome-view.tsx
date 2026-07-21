'use client';

import { useState } from 'react';
import type {
  SessionMode,
  VoiceAccent,
  VoiceGender,
  VoicePreference,
} from '@/components/app/session-mode';
import { Button } from '@/components/ui/button';
import {
  COURSE_GUIDELINES,
  COURSE_TARGET_BAND,
  COURSE_TRACKS,
  type CourseSkill,
  listLessons,
} from '@/lib/ielts-course';

const ACCENTS: { id: VoiceAccent; label: string }[] = [
  { id: 'uk', label: 'UK' },
  { id: 'us', label: 'US' },
  { id: 'au', label: 'Australian' },
];

const GENDERS: { id: VoiceGender; label: string }[] = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
];

function WelcomeImage() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-fg0 mb-4 size-16"
    >
      <path
        d="M15 24V40C15 40.7957 14.6839 41.5587 14.1213 42.1213C13.5587 42.6839 12.7956 43 12 43C11.2044 43 10.4413 42.6839 9.87868 42.1213C9.31607 41.5587 9 40.7957 9 40V24C9 23.2044 9.31607 22.4413 9.87868 21.8787C10.4413 21.3161 11.2044 21 12 21C12.7956 21 13.5587 21.3161 14.1213 21.8787C14.6839 22.4413 15 23.2044 15 24ZM22 5C21.2044 5 20.4413 5.31607 19.8787 5.87868C19.3161 6.44129 19 7.20435 19 8V56C19 56.7957 19.3161 57.5587 19.8787 58.1213C20.4413 58.6839 21.2044 59 22 59C22.7956 59 23.5587 58.6839 24.1213 58.1213C24.6839 57.5587 25 56.7957 25 56V8C25 7.20435 24.6839 6.44129 24.1213 5.87868C23.5587 5.31607 22.7956 5 22 5ZM32 13C31.2044 13 30.4413 13.3161 29.8787 13.8787C29.3161 14.4413 29 15.2044 29 16V48C29 48.7957 29.3161 49.5587 29.8787 50.1213C30.4413 50.6839 31.2044 51 32 51C32.7956 51 33.5587 50.6839 34.1213 50.1213C34.6839 49.5587 35 48.7957 35 48V16C35 15.2044 34.6839 14.4413 34.1213 13.8787C33.5587 13.3161 32.7956 13 32 13ZM42 21C41.2043 21 40.4413 21.3161 39.8787 21.8787C39.3161 22.4413 39 23.2044 39 24V40C39 40.7957 39.3161 41.5587 39.8787 42.1213C40.4413 42.6839 41.2043 43 42 43C42.7957 43 43.5587 42.6839 44.1213 42.1213C44.6839 41.5587 45 40.7957 45 40V24C45 23.2044 44.6839 22.4413 44.1213 21.8787C43.5587 21.3161 42.7957 21 42 21ZM52 17C51.2043 17 50.4413 17.3161 49.8787 17.8787C49.3161 18.4413 49 19.2044 49 20V44C49 44.7957 49.3161 45.5587 49.8787 46.1213C50.4413 46.6839 51.2043 47 52 47C52.7957 47 53.5587 46.6839 54.1213 46.1213C54.6839 45.5587 55 44.7957 55 44V20C55 19.2044 54.6839 18.4413 54.1213 17.8787C53.5587 17.3161 52.7957 17 52 17Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: (mode: SessionMode, voice: VoicePreference, lessonId?: string) => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const [accent, setAccent] = useState<VoiceAccent>('uk');
  const [gender, setGender] = useState<VoiceGender>('female');
  const [selectedSkill, setSelectedSkill] = useState<CourseSkill>('speaking');

  const voice: VoicePreference = { accent, gender };
  const lessons = listLessons(selectedSkill);
  const activeTrack = COURSE_TRACKS.find((track) => track.skill === selectedSkill);

  return (
    <div ref={ref} className="max-h-svh overflow-y-auto">
      <section className="bg-background flex flex-col items-center justify-center px-6 py-10 text-center">
        <WelcomeImage />

        <p className="text-foreground max-w-prose pt-1 text-lg leading-7 font-semibold">
          {COURSE_GUIDELINES.title}
        </p>
        <p className="text-muted-foreground mt-2 max-w-lg text-sm leading-6">
          Target around Band {COURSE_TARGET_BAND}. Choose a tutor voice, open a skill track, then
          start a guided lesson with the AI coach.
        </p>

        <div className="mt-8 w-full max-w-2xl space-y-6 text-left">
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
                  onClick={() => setGender(option.id)}
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
                  onClick={() => setAccent(option.id)}
                  className="rounded-full font-mono text-xs uppercase"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
              Band 8.0 skill tracks
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {COURSE_TRACKS.map((track) => (
                <button
                  key={track.skill}
                  type="button"
                  onClick={() => setSelectedSkill(track.skill)}
                  className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                    selectedSkill === track.skill
                      ? 'border-foreground bg-accent/50'
                      : 'border-border bg-background hover:bg-accent/40'
                  }`}
                >
                  <p className="text-foreground text-sm font-semibold">{track.title}</p>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">{track.summary}</p>
                </button>
              ))}
            </div>
            {activeTrack && (
              <p className="text-muted-foreground mt-3 text-xs leading-5">
                Band 8 focus: {activeTrack.band8Target}
              </p>
            )}
          </div>

          <div>
            <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">
              Lessons
            </p>
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => onStartCall(lesson.skill, voice, lesson.id)}
                  className="border-border bg-background hover:bg-accent/40 w-full rounded-2xl border px-4 py-3 text-left transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-foreground text-sm font-semibold">
                        {lesson.order}. {lesson.title}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs leading-5">{lesson.goal}</p>
                    </div>
                    <span className="text-muted-foreground shrink-0 font-mono text-[10px] uppercase">
                      {lesson.durationMinutes} min
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-2 text-[11px] tracking-wide uppercase">
                    Focus: {lesson.bandFocus}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="border-border rounded-2xl border px-4 py-3">
            <p className="text-foreground text-sm font-semibold">Course guidelines</p>
            <p className="text-muted-foreground mt-2 text-xs leading-5">
              {COURSE_GUIDELINES.weeklyPlan}
            </p>
            <p className="text-muted-foreground mt-2 text-xs leading-5">
              {COURSE_GUIDELINES.scoringNote}
            </p>
          </div>

          <Button
            size="lg"
            variant="outline"
            onClick={() => onStartCall(selectedSkill, voice)}
            className="w-full rounded-full font-mono text-xs font-bold tracking-wider uppercase"
          >
            Free {selectedSkill} practice
          </Button>

          <Button
            size="lg"
            onClick={() => onStartCall('general', voice)}
            className="w-full rounded-full font-mono text-xs font-bold tracking-wider uppercase"
          >
            {startButtonText}
          </Button>
        </div>
      </section>

      <div className="pb-8 text-center">
        <p className="text-muted-foreground max-w-prose mx-auto px-6 text-xs leading-5 md:text-sm">
          Powered by{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.livekit.io/agents"
            className="underline"
          >
            LiveKit Agents
          </a>
          . Allow microphone access when prompted.
        </p>
      </div>
    </div>
  );
};
