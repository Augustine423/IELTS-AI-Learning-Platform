'use client';

import { createContext, useContext, useState } from 'react';

export type SessionMode = 'general' | 'ielts';

const SessionModeContext = createContext<{
  mode: SessionMode;
  setMode: (mode: SessionMode) => void;
}>({
  mode: 'general',
  setMode: () => {},
});

export function SessionModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<SessionMode>('general');

  return (
    <SessionModeContext.Provider value={{ mode, setMode }}>
      {children}
    </SessionModeContext.Provider>
  );
}

export function useSessionMode() {
  return useContext(SessionModeContext);
}
