export interface AppConfig {
  pageTitle: string;
  pageDescription: string;
  companyName: string;

  supportsChatInput: boolean;
  supportsVideoInput: boolean;
  supportsScreenShare: boolean;
  isPreConnectBufferEnabled: boolean;

  logo: string;
  startButtonText: string;
  accent?: string;
  logoDark?: string;
  accentDark?: string;

  audioVisualizerType?: 'bar' | 'wave' | 'grid' | 'radial' | 'aura';
  audioVisualizerColor?: `#${string}`;
  audioVisualizerColorDark?: `#${string}`;
  audioVisualizerColorShift?: number;
  audioVisualizerBarCount?: number;
  audioVisualizerGridRowCount?: number;
  audioVisualizerGridColumnCount?: number;
  audioVisualizerRadialBarCount?: number;
  audioVisualizerRadialRadius?: number;
  audioVisualizerWaveLineWidth?: number;

  // agent dispatch configuration
  agentName?: string;

  // LiveKit Cloud Sandbox configuration
  sandboxId?: string;
}

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'IELTS AI Tutor',
  pageTitle: 'IELTS AI Practice',
  pageDescription:
    'Realtime voice AI tutor for IELTS Speaking, Listening, Reading, and Writing powered by LiveKit',

  supportsChatInput: true,
  supportsVideoInput: false,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,

  logo: '/lk-logo.svg',
  accent: '#0f6e9c',
  logoDark: '/lk-logo-dark.svg',
  accentDark: '#2bb0d9',
  startButtonText: 'Talk to assistant',

  audioVisualizerType: 'aura',
  audioVisualizerColor: '#0f6e9c',
  audioVisualizerColorDark: '#2bb0d9',
  audioVisualizerColorShift: 0.3,

  agentName: process.env.AGENT_NAME ?? 'ielts-voice-agent',

  // LiveKit Cloud Sandbox configuration
  sandboxId: undefined,
};
