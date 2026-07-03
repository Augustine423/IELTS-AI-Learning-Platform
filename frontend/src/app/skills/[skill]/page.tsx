"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ChatInterface } from "@/components/ChatInterface";
import { VoiceSelector } from "@/components/VoiceSelector";
import { Skill } from "@/lib/api";
import { useVoicePreferences } from "@/lib/useVoicePreferences";

const SKILL_NAMES: Record<string, string> = {
  listening: "Listening",
  speaking: "Speaking",
  reading: "Reading",
  writing: "Writing",
};

export default function SkillPage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const { skill } = use(params);
  const validSkill = (["listening", "speaking", "reading", "writing"] as Skill[]).includes(
    skill as Skill
  )
    ? (skill as Skill)
    : "reading";

  const [voicePrefs, setVoicePrefs] = useVoicePreferences();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-ielts-navy">
              IELTS {SKILL_NAMES[validSkill]}
            </h1>
          </div>
          <div className="hidden md:block w-64">
            <VoiceSelector preferences={voicePrefs} onChange={setVoicePrefs} />
          </div>
        </div>
      </header>

      <div className="md:hidden px-4 py-3 border-b border-slate-200 bg-slate-50">
        <VoiceSelector preferences={voicePrefs} onChange={setVoicePrefs} />
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full">
        <ChatInterface skill={validSkill} voicePreferences={voicePrefs} />
      </main>
    </div>
  );
}
