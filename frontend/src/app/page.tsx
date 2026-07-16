"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SkillCard } from "@/components/SkillCard";
import { VoiceSelector } from "@/components/VoiceSelector";
import { fetchSkills, fetchHealth, SkillInfo } from "@/lib/api";
import { useVoicePreferences } from "@/lib/useVoicePreferences";
import { MessageCircle, Sparkles, Waves } from "lucide-react";

export default function HomePage() {
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [health, setHealth] = useState<{
    llm_available: boolean;
    livekit_configured?: boolean;
    llm_model: string;
    llm_provider: string;
  } | null>(null);
  const [voicePrefs, setVoicePrefs] = useVoicePreferences();

  useEffect(() => {
    fetchSkills().then(setSkills).catch(console.error);
    fetchHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  return (
    <div className="page-shell">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink-soft to-sea-deep" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(42,143,156,0.45), transparent 40%), radial-gradient(circle at 85% 20%, rgba(201,162,39,0.28), transparent 35%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-16 md:pt-20 md:pb-24">
          <p className="animate-fade-up text-gold-soft text-sm font-semibold tracking-[0.2em] uppercase mb-4">
            LiveKit · Conversational · Exam-ready
          </p>
          <h1 className="brand-mark animate-fade-up text-5xl md:text-7xl text-white leading-[1.05] max-w-3xl">
            IELTS AI
          </h1>
          <p
            className="animate-fade-up mt-5 text-lg md:text-xl text-white/75 max-w-xl text-balance"
            style={{ animationDelay: "80ms" }}
          >
            Situational dialogues and skill drills with a live tutor — speak,
            listen, read, and write with UK, US, or Australian voices.
          </p>

          <div
            className="animate-fade-up mt-8 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "140ms" }}
          >
            <a
              href="#skills"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-ink font-semibold text-sm hover:bg-gold-soft transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Choose a skill
            </a>
            <Link
              href="/skills/speaking"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Start speaking dialogue
            </Link>
          </div>

          {health && (
            <div
              className="animate-fade-up mt-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80"
              style={{ animationDelay: "200ms" }}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  health.livekit_configured || health.llm_available
                    ? "bg-emerald-400"
                    : "bg-amber-400"
                }`}
              />
              {health.livekit_configured
                ? `LiveKit ready · chat ${health.llm_provider}/${health.llm_model}`
                : health.llm_available
                  ? `Chat ready · ${health.llm_model}`
                  : "Add LIVEKIT_* and GROQ_API_KEY to .env"}
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[rgb(238,245,247)] to-transparent" />
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16 -mt-4">
        <section className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
          <aside className="animate-fade-up space-y-4" style={{ animationDelay: "100ms" }}>
            <VoiceSelector preferences={voicePrefs} onChange={setVoicePrefs} />
            <div className="glass-panel rounded-2xl p-4 text-sm text-ink-muted leading-relaxed">
              <div className="flex items-center gap-2 text-sea font-semibold mb-2">
                <Waves className="w-4 h-4" />
                How it works
              </div>
              Pick a skill, choose a <strong className="text-ink">situation</strong>, then
              use <strong className="text-ink">LiveKit voice</strong> or chat. Accent
              applies to the tutor voice (UK / US / AU).
              replies.
            </div>
          </aside>

          <div id="skills" className="animate-fade-up" style={{ animationDelay: "160ms" }}>
            <div className="flex items-end justify-between mb-5 gap-4">
              <div>
                <h2 className="brand-mark text-3xl text-ink">Practice studio</h2>
                <p className="text-ink-muted mt-1 text-sm">
                  Four skills · situational prompts · streaming feedback
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {skills.map((skill, i) => (
                <div
                  key={skill.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${180 + i * 60}ms` }}
                >
                  <SkillCard skill={skill} />
                </div>
              ))}
            </div>
            {skills.length === 0 && (
              <p className="text-ink-muted text-center py-16 glass-panel rounded-2xl">
                Loading skills… Is the backend running on port 8000?
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
