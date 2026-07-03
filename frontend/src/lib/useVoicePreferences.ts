"use client";

import { useEffect, useState } from "react";
import { Accent, Gender, VoicePreferences } from "@/lib/api";

const STORAGE_KEY = "ielts-voice-preferences";

const DEFAULT: VoicePreferences = { accent: "uk", gender: "female" };

export function useVoicePreferences(): [VoicePreferences, (prefs: VoicePreferences) => void] {
  const [prefs, setPrefs] = useState<VoicePreferences>(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPrefs(JSON.parse(stored));
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  function update(next: VoicePreferences) {
    setPrefs(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return [loaded ? prefs : DEFAULT, update];
}
