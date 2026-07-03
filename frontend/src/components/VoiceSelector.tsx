"use client";

import { Accent, Gender, VoicePreferences } from "@/lib/api";
import { clsx } from "clsx";

interface VoiceSelectorProps {
  preferences: VoicePreferences;
  onChange: (prefs: VoicePreferences) => void;
}

const ACCENTS: { value: Accent; label: string; flag: string }[] = [
  { value: "uk", label: "UK", flag: "🇬🇧" },
  { value: "us", label: "US", flag: "🇺🇸" },
  { value: "au", label: "Australian", flag: "🇦🇺" },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

export function VoiceSelector({ preferences, onChange }: VoiceSelectorProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">Voice Settings</h3>

      <div className="mb-3">
        <label className="text-xs text-slate-500 uppercase tracking-wide">Accent</label>
        <div className="flex gap-2 mt-1">
          {ACCENTS.map((a) => (
            <button
              key={a.value}
              onClick={() => onChange({ ...preferences, accent: a.value })}
              className={clsx(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border",
                preferences.accent === a.value
                  ? "bg-ielts-blue text-white border-ielts-blue"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-ielts-blue"
              )}
            >
              {a.flag} {a.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-500 uppercase tracking-wide">Voice</label>
        <div className="flex gap-2 mt-1">
          {GENDERS.map((g) => (
            <button
              key={g.value}
              onClick={() => onChange({ ...preferences, gender: g.value })}
              className={clsx(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border",
                preferences.gender === g.value
                  ? "bg-ielts-blue text-white border-ielts-blue"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-ielts-blue"
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
