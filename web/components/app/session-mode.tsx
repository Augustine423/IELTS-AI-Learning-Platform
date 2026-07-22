'use client';

import { createContext, useContext, useState } from 'react';

export type SessionMode =
  | 'general'
  | 'speaking'
  | 'listening'
  | 'writing'
  | 'reading';

export type VoiceGender = 'female' | 'male';
export type VoiceAccent = 'us' | 'uk' | 'au';

export interface VoicePreference {
  gender: VoiceGender;
  accent: VoiceAccent;
}

export interface SessionPreferences {
  mode: SessionMode;
  voice: VoicePreference;
  lessonId?: string;
  /** Custom or sample paragraph/story for listening or reading practice */
  passage?: string;
  passageTitle?: string;
}

const DEFAULT_PREFERENCES: SessionPreferences = {
  mode: 'general',
  voice: { gender: 'female', accent: 'uk' },
};

const SessionModeContext = createContext<{
  preferences: SessionPreferences;
  setMode: (mode: SessionMode) => void;
  setVoice: (voice: VoicePreference) => void;
  setPreferences: (preferences: SessionPreferences) => void;
}>({
  preferences: DEFAULT_PREFERENCES,
  setMode: () => {},
  setVoice: () => {},
  setPreferences: () => {},
});

export function SessionModeProvider({
  children,
  initialPreferences,
}: {
  children: React.ReactNode;
  initialPreferences?: Partial<SessionPreferences>;
}) {
  const [preferences, setPreferences] = useState<SessionPreferences>({
    ...DEFAULT_PREFERENCES,
    ...initialPreferences,
  });

  return (
    <SessionModeContext.Provider
      value={{
        preferences,
        setMode: (mode) => setPreferences((prev) => ({ ...prev, mode })),
        setVoice: (voice) => setPreferences((prev) => ({ ...prev, voice })),
        setPreferences,
      }}
    >
      {children}
    </SessionModeContext.Provider>
  );
}

export function useSessionMode() {
  return useContext(SessionModeContext);
}
