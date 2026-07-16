"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ChatInterface } from "@/components/ChatInterface";
import { VoiceSelector } from "@/components/VoiceSelector";
import { ApiKeyBanner } from "@/components/ApiKeyBanner";
import { Skill } from "@/lib/api";
import { SKILL_META } from "@/lib/scenarios";
import { useVoicePreferences } from "@/lib/useVoicePreferences";

export default function SkillPage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const { skill } = use(params);
  const validSkill = (
    ["listening", "speaking", "reading", "writing"] as Skill[]
  ).includes(skill as Skill)
    ? (skill as Skill)
    : "reading";

  const [voicePrefs, setVoicePrefs] = useVoicePreferences();
  const meta = SKILL_META[validSkill];

  return (
    <div className="page-shell min-h-screen flex flex-col">
      <header className="border-b border-ink/8 bg-white/60 backdrop-blur-md px-4 md:px-6 py-3 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              className="p-2 rounded-xl hover:bg-ink/5 transition-colors text-ink-muted shrink-0"
              aria-label="Back home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sea truncate">
                IELTS AI
              </p>
              <h1 className="brand-mark text-xl text-ink truncate leading-tight">
                {meta.name}
              </h1>
            </div>
          </div>
          <div className="hidden md:block">
            <VoiceSelector
              preferences={voicePrefs}
              onChange={setVoicePrefs}
              compact
            />
          </div>
        </div>
      </header>

      <div className="md:hidden px-4 py-3 border-b border-ink/8 bg-white/40">
        <VoiceSelector preferences={voicePrefs} onChange={setVoicePrefs} compact />
      </div>

      <ApiKeyBanner />

      <main className="flex-1 max-w-5xl mx-auto w-full">
        <ChatInterface skill={validSkill} voicePreferences={voicePrefs} />
      </main>
    </div>
  );
}
