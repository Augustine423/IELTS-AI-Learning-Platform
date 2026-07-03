"use client";

import { useEffect, useState } from "react";
import { SkillCard } from "@/components/SkillCard";
import { VoiceSelector } from "@/components/VoiceSelector";
import { fetchSkills, fetchHealth, SkillInfo } from "@/lib/api";
import { useVoicePreferences } from "@/lib/useVoicePreferences";
import { GraduationCap, Wifi, WifiOff } from "lucide-react";

export default function HomePage() {
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [health, setHealth] = useState<{
    ollama_available: boolean;
    llm_model: string;
    llm_provider: string;
  } | null>(null);
  const [voicePrefs, setVoicePrefs] = useVoicePreferences();

  useEffect(() => {
    fetchSkills().then(setSkills).catch(console.error);
    fetchHealth().then(setHealth).catch(() => setHealth(null));
  }, []);

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-ielts-navy to-ielts-blue text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-8 h-8" />
            <h1 className="text-3xl font-bold">IELTS AI Tutor</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Practice all 4 skills with AI — voice, text, UK/US/Australian accents
          </p>
          {health && (
            <div className="flex items-center gap-2 mt-4 text-sm">
              {health.ollama_available ? (
                <Wifi className="w-4 h-4 text-green-300" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-300" />
              )}
              <span className="text-blue-100">
                {health.ollama_available
                  ? `Connected — ${health.llm_provider} / ${health.llm_model}`
                  : "Ollama offline — start with: ollama pull llama3.2"}
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <VoiceSelector preferences={voicePrefs} onChange={setVoicePrefs} />
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <strong>Tip:</strong> Voice settings are saved automatically and apply across all skills.
            </div>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Choose a Skill</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
            {skills.length === 0 && (
              <p className="text-slate-500 text-center py-12">
                Loading skills... Make sure the backend is running on port 8000.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
