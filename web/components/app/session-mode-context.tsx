'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export type SessionMode = 'general' | 'ielts';

interface SessionModeContextValue {
  sessionMode: SessionMode;
  setSessionMode: (mode: SessionMode) => void;
}

const SessionModeContext = createContext<SessionModeContextValue | null>(null);

export function SessionModeProvider({ children }: { children: ReactNode }) {
  const [sessionMode, setSessionMode] = useState<SessionMode>('general');

  return (
    <SessionModeContext.Provider value={{ sessionMode, setSessionMode }}>
      {children}
    </SessionModeContext.Provider>
  );
}

export function useSessionMode() {
  const context = useContext(SessionModeContext);
  if (!context) {
    throw new Error('useSessionMode must be used within SessionModeProvider');
  }
  return context;
}
