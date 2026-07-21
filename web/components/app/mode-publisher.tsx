'use client';

import { useEffect, useRef } from 'react';
import { useSessionContext } from '@livekit/components-react';
import type { SessionPreferences } from '@/components/app/session-mode';

interface ModePublisherProps {
  preferences: SessionPreferences;
}

export function ModePublisher({ preferences }: ModePublisherProps) {
  const { isConnected, room } = useSessionContext();
  const publishedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isConnected || !room?.localParticipant) {
      return;
    }

    const key = `${preferences.mode}:${preferences.voice.gender}:${preferences.voice.accent}:${preferences.lessonId ?? ''}`;
    if (publishedKeyRef.current === key) {
      return;
    }

    const payload = new TextEncoder().encode(
      JSON.stringify({
        mode: preferences.mode,
        voice: preferences.voice,
        lessonId: preferences.lessonId ?? null,
      })
    );

    room.localParticipant
      .publishData(payload, { reliable: true })
      .then(() => {
        publishedKeyRef.current = key;
      })
      .catch((error: unknown) => {
        console.error('Failed to publish session preferences:', error);
      });
  }, [isConnected, room, preferences]);

  return null;
}
