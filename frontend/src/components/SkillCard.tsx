"use client";

import { SkillInfo } from "@/lib/api";
import { Headphones, Mic, BookOpen, PenLine } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

const ICONS = {
  headphones: Headphones,
  mic: Mic,
  "book-open": BookOpen,
  pen: PenLine,
};

const COLORS: Record<string, string> = {
  listening: "from-blue-500 to-blue-700",
  speaking: "from-emerald-500 to-emerald-700",
  reading: "from-violet-500 to-violet-700",
  writing: "from-amber-500 to-amber-700",
};

interface SkillCardProps {
  skill: SkillInfo;
}

export function SkillCard({ skill }: SkillCardProps) {
  const Icon = ICONS[skill.icon as keyof typeof ICONS] || BookOpen;
  const gradient = COLORS[skill.id] || "from-slate-500 to-slate-700";

  return (
    <Link href={`/skills/${skill.id}`}>
      <div className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-ielts-blue transition-all duration-200 cursor-pointer h-full">
        <div
          className={clsx(
            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4",
            gradient
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 group-hover:text-ielts-blue transition-colors">
          {skill.name}
        </h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">{skill.description}</p>
      </div>
    </Link>
  );
}
