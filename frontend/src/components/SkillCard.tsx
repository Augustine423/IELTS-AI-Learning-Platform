"use client";

import { SKILL_LIST, SKILL_META } from "@/lib/scenarios";
import type { Skill } from "@/lib/api";
import { Headphones, Mic, BookOpen, PenLine, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

const ICONS = {
  headphones: Headphones,
  mic: Mic,
  "book-open": BookOpen,
  pen: PenLine,
};

const ACCENT: Record<Skill, string> = {
  listening: "bg-skill-listening",
  speaking: "bg-skill-speaking",
  reading: "bg-skill-reading",
  writing: "bg-skill-writing",
};

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  const meta = SKILL_META[skill];
  const Icon = ICONS[meta.icon];
  const accent = ACCENT[skill];

  return (
    <Link href={`/skills/${skill}`} className="block h-full group">
      <article className="relative h-full overflow-hidden rounded-3xl glass-panel p-6 transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5">
        <div
          className={clsx(
            "absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40",
            accent
          )}
        />
        <div className="flex items-start justify-between gap-3">
          <div
            className={clsx(
              "flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md",
              accent
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <ArrowUpRight className="w-5 h-5 text-ink-muted opacity-0 -translate-y-1 transition-all group-hover:opacity-100 group-hover:translate-y-0" />
        </div>
        <h3 className="brand-mark mt-5 text-2xl text-ink">{meta.name}</h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-sea">
          {meta.tagline}
        </p>
        <p className="mt-3 text-sm text-ink-muted leading-relaxed">
          {meta.description}
        </p>
      </article>
    </Link>
  );
}

export function SkillGrid() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {SKILL_LIST.map((skill, i) => (
        <div
          key={skill}
          className="animate-fade-up"
          style={{ animationDelay: `${180 + i * 60}ms` }}
        >
          <SkillCard skill={skill} />
        </div>
      ))}
    </div>
  );
}
