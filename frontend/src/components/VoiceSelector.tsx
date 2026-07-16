"use client";

import { Accent, Gender, VoicePreferences } from "@/lib/api";
import { clsx } from "clsx";

interface VoiceSelectorProps {
  preferences: VoicePreferences;
  onChange: (prefs: VoicePreferences) => void;
  compact?: boolean;
}

const ACCENTS: { value: Accent; label: string }[] = [
  { value: "uk", label: "UK" },
  { value: "us", label: "US" },
  { value: "au", label: "AU" },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

export function VoiceSelector({
  preferences,
  onChange,
  compact = false,
}: VoiceSelectorProps) {
  return (
    <div
      className={clsx(
        "glass-panel rounded-2xl",
        compact ? "p-3" : "p-4"
      )}
    >
      {!compact && (
        <h3 className="text-sm font-semibold text-ink mb-3">Tutor voice</h3>
      )}

      <div className={compact ? "flex flex-wrap items-center gap-3" : "space-y-3"}>
        <div className={compact ? "flex items-center gap-2" : ""}>
          {!compact && (
            <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              Accent
            </label>
          )}
          <div className={clsx("flex gap-1.5", !compact && "mt-1.5")}>
            {ACCENTS.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => onChange({ ...preferences, accent: a.value })}
                className={clsx(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-all border",
                  preferences.accent === a.value
                    ? "bg-sea text-white border-sea shadow-sm"
                    : "bg-white/60 text-ink-muted border-ink/10 hover:border-sea/40"
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div className={compact ? "flex items-center gap-2" : ""}>
          {!compact && (
            <label className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
              Voice
            </label>
          )}
          <div className={clsx("flex gap-1.5", !compact && "mt-1.5")}>
            {GENDERS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => onChange({ ...preferences, gender: g.value })}
                className={clsx(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-all border",
                  preferences.gender === g.value
                    ? "bg-ink text-white border-ink"
                    : "bg-white/60 text-ink-muted border-ink/10 hover:border-ink/30"
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
