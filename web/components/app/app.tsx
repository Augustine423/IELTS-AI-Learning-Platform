'use client';

import { useMemo } from 'react';
import { TokenSource } from 'livekit-client';
import { useSession } from '@livekit/components-react';
import { WarningIcon } from '@phosphor-icons/react/dist/ssr';
import type { AppConfig } from '@/app-config';
import { AgentSessionProvider } from '@/components/agents-ui/agent-session-provider';
import { StartAudioButton } from '@/components/agents-ui/start-audio-button';
import { ModePublisher } from '@/components/app/mode-publisher';
import {
  SessionModeProvider,
  useSessionMode,
  type SessionPreferences,
} from '@/components/app/session-mode';
import { ViewController } from '@/components/app/view-controller';
import { Toaster } from '@/components/ui/sonner';
import { useAgentErrors } from '@/hooks/useAgentErrors';
import { useDebugMode } from '@/hooks/useDebug';
import { getSandboxTokenSource } from '@/lib/utils';

const IN_DEVELOPMENT = process.env.NODE_ENV !== 'production';

function AppSetup() {
  useDebugMode({ enabled: IN_DEVELOPMENT });
  useAgentErrors();

  return null;
}

interface AppProps {
  appConfig: AppConfig;
  initialPreferences?: Partial<SessionPreferences>;
  welcomeVariant?: 'hub' | 'speaking' | 'listening' | 'reading';
}

function AppContent({ appConfig, welcomeVariant }: AppProps) {
  const { preferences } = useSessionMode();

  return (
    <>
      <AppSetup />
      <ModePublisher preferences={preferences} />
      <main className="grid h-svh grid-cols-1 place-content-center pt-14">
        <ViewController appConfig={appConfig} welcomeVariant={welcomeVariant} />
      </main>
      <StartAudioButton label="Start Audio" />
      <Toaster
        icons={{
          warning: <WarningIcon weight="bold" />,
        }}
        position="top-center"
        className="toaster group"
        style={
          {
            '--normal-bg': 'var(--popover)',
            '--normal-text': 'var(--popover-foreground)',
            '--normal-border': 'var(--border)',
          } as React.CSSProperties
        }
      />
    </>
  );
}

export function App({ appConfig, initialPreferences, welcomeVariant = 'hub' }: AppProps) {
  const tokenSource = useMemo(() => {
    return typeof process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT === 'string'
      ? getSandboxTokenSource(appConfig)
      : TokenSource.endpoint('/api/token');
  }, [appConfig]);

  const session = useSession(
    tokenSource,
    appConfig.agentName ? { agentName: appConfig.agentName } : undefined
  );

  return (
    <AgentSessionProvider session={session}>
      <SessionModeProvider initialPreferences={initialPreferences}>
        <AppContent appConfig={appConfig} welcomeVariant={welcomeVariant} />
      </SessionModeProvider>
    </AgentSessionProvider>
  );
}
