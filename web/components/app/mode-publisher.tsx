'use client';

import { useEffect, useRef } from 'react';
import { useSessionContext } from '@livekit/components-react';
import type { SessionMode } from '@/components/app/session-mode';

interface ModePublisherProps {
  mode: SessionMode;
}

export function ModePublisher({ mode }: ModePublisherProps) {
  const { isConnected, room } = useSessionContext();
  const publishedModeRef = useRef<SessionMode | null>(null);

  useEffect(() => {
    if (!isConnected || !room?.localParticipant) {
      return;
    }

    if (publishedModeRef.current === mode) {
      return;
    }

    const payload = new TextEncoder().encode(JSON.stringify({ mode }));

    room.localParticipant
      .publishData(payload, { reliable: true })
      .then(() => {
        publishedModeRef.current = mode;
      })
      .catch((error: unknown) => {
        console.error('Failed to publish session mode:', error);
      });
  }, [isConnected, room, mode]);

  return null;
}
