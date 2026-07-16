// Same-origin proxy in Docker/k8s/VM deploys; optional direct URL for local overrides.
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api/backend";

export type Accent = "uk" | "us" | "au";
export type Gender = "female" | "male";
export type Skill = "listening" | "speaking" | "reading" | "writing";
export type ModelMode = "auto" | "manual";

export interface VoicePreferences {
  accent: Accent;
  gender: Gender;
}

export interface ModelPreferences {
  mode: ModelMode;
  model: string | null;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ProviderConfig {
  llm_provider: string;
  llm_model: string;
  stt_provider: string;
  tts_provider: string;
  available_accents: string[];
  available_genders: string[];
  livekit_enabled?: boolean;
}

export interface ChatOptions {
  useWebSearch?: boolean;
  modelMode?: ModelMode;
  model?: string | null;
}

export async function fetchConfig(): Promise<ProviderConfig> {
  const res = await fetch(`${API_URL}/api/config`);
  if (!res.ok) throw new Error("Failed to fetch config");
  return res.json();
}

export async function fetchHealth(): Promise<{
  status: string;
  llm_available: boolean;
  llm_provider: string;
  llm_model: string;
  models_by_skill: Record<string, string>;
  livekit_configured?: boolean;
}> {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error("Backend unavailable");
  return res.json();
}

export async function fetchLiveKitStatus(): Promise<{
  configured: boolean;
  url: string;
  agent_name: string;
}> {
  const res = await fetch(`${API_URL}/api/livekit/status`);
  if (!res.ok) throw new Error("Failed to fetch LiveKit status");
  return res.json();
}

export async function createLiveKitToken(input: {
  skill: Skill;
  voicePreferences: VoicePreferences;
  scenarioId?: string | null;
  scenarioPrompt?: string | null;
  participantName?: string;
}): Promise<{
  token: string;
  url: string;
  room_name: string;
  skill: Skill;
}> {
  const res = await fetch(`${API_URL}/api/livekit/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill: input.skill,
      scenario_id: input.scenarioId || null,
      scenario_prompt: input.scenarioPrompt || null,
      voice_preferences: input.voicePreferences,
      participant_name: input.participantName || "student",
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || "Failed to create LiveKit token");
  }
  return res.json();
}

export async function sendChat(
  skill: Skill,
  messages: ChatMessage[],
  voicePreferences: VoicePreferences,
  options: ChatOptions | boolean = {}
): Promise<{ content: string; model: string }> {
  // Back-compat: sendChat(..., true) meant useWebSearch
  const opts: ChatOptions =
    typeof options === "boolean" ? { useWebSearch: options } : options;

  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill,
      messages,
      voice_preferences: voicePreferences,
      stream: false,
      use_web_search: opts.useWebSearch ?? false,
      model_mode: opts.modelMode ?? "auto",
      model: opts.modelMode === "manual" ? opts.model : null,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Chat request failed");
  }
  const data = await res.json();
  return { content: data.content, model: data.model || "" };
}

export function streamChat(
  skill: Skill,
  messages: ChatMessage[],
  voicePreferences: VoicePreferences,
  onChunk: (text: string) => void,
  onDone: (meta?: { model?: string }) => void,
  onError: (err: string) => void,
  options: ChatOptions = {}
): () => void {
  const controller = new AbortController();
  let lastModel: string | undefined;

  fetch(`${API_URL}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      skill,
      messages,
      voice_preferences: voicePreferences,
      stream: true,
      use_web_search: options.useWebSearch ?? false,
      model_mode: options.modelMode ?? "auto",
      model: options.modelMode === "manual" ? options.model : null,
    }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Stream failed");
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.model) lastModel = data.model;
              if (data.content) onChunk(data.content);
              if (data.error) onError(data.error);
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      }
      onDone({ model: lastModel });
    })
    .catch((e) => {
      if (e.name !== "AbortError") onError(e.message);
    });

  return () => controller.abort();
}

export async function textToSpeech(
  text: string,
  voicePreferences: VoicePreferences
): Promise<string> {
  const res = await fetch(`${API_URL}/api/voice/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice_preferences: voicePreferences }),
  });
  if (!res.ok) throw new Error("TTS failed");
  const data = await res.json();
  return `data:${data.content_type};base64,${data.audio_base64}`;
}

export async function speechToText(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");
  const res = await fetch(`${API_URL}/api/voice/stt`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "STT failed");
  }
  const data = await res.json();
  return data.transcript;
}

/** Play TTS and return handles to stop or await completion. */
export function speakText(
  text: string,
  voicePreferences: VoicePreferences
): { stop: () => void; done: Promise<void> } {
  let audio: HTMLAudioElement | null = null;
  let stopped = false;

  const done = (async () => {
    const dataUrl = await textToSpeech(text, voicePreferences);
    if (stopped) return;

    await new Promise<void>((resolve, reject) => {
      audio = new Audio(dataUrl);
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Playback failed"));
      audio.play().catch(reject);
    });
  })();

  return {
    stop: () => {
      stopped = true;
      audio?.pause();
      audio = null;
    },
    done: done.catch(() => undefined),
  };
}

export const SKILL_STARTERS: Record<Skill, string> = {
  listening:
    "I'd like to practice IELTS Listening. Please give me a Section 2 style monologue with 5 comprehension questions.",
  speaking:
    "Let's practice IELTS Speaking Part 1. Please ask me warm-up questions about my hometown and daily life, one question at a time.",
  reading:
    "I'd like an IELTS Academic Reading passage about environmental science with True/False/Not Given questions.",
  writing:
    "I want to practice IELTS Writing Task 2. Please give me an opinion essay topic and I'll write my response.",
};
