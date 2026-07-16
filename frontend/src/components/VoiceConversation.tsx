"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import {
  Skill,
  ChatMessage,
  VoicePreferences,
  speechToText,
  sendChat,
  speakText,
} from "@/lib/api";
import { SCENARIOS, Scenario } from "@/lib/scenarios";
import { clsx } from "clsx";

type VoicePhase = "idle" | "listening" | "processing" | "speaking";

interface VoiceConversationProps {
  skill: Skill;
  voicePreferences: VoicePreferences;
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
  disabled?: boolean;
  useWebSearch?: boolean;
  modelPrefs?: { mode: "auto" | "manual"; model: string | null };
  onModelUsed?: (model: string) => void;
  onScenarioStart?: (scenario: Scenario) => void;
}

function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  for (const type of types) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(type)
    ) {
      return type;
    }
  }
  return "";
}

const SILENCE_MS = 1800;
const MIN_SPEECH_MS = 700;
const MAX_RECORD_MS = 45000;
const SILENCE_THRESHOLD = 12;

export function VoiceConversation({
  skill,
  voicePreferences,
  messages,
  onMessagesChange,
  disabled,
  useWebSearch = true,
  modelPrefs = { mode: "auto", model: null },
  onModelUsed,
  onScenarioStart,
}: VoiceConversationProps) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);

  const activeRef = useRef(false);
  const messagesRef = useRef(messages);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const recordStartRef = useRef(0);
  const heardSpeechRef = useRef(false);
  const mimeTypeRef = useRef("");
  const stopAudioRef = useRef<(() => void) | null>(null);
  const webSearchRef = useRef(useWebSearch);
  const modelPrefsRef = useRef(modelPrefs);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    webSearchRef.current = useWebSearch;
  }, [useWebSearch]);

  useEffect(() => {
    modelPrefsRef.current = modelPrefs;
  }, [modelPrefs]);

  const cleanupRecording = useCallback(() => {
    if (silenceTimerRef.current) {
      window.clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    analyserRef.current = null;
    setLevel(0);
  }, []);

  const stopSession = useCallback(() => {
    activeRef.current = false;
    setActive(false);
    setPhase("idle");
    cleanupRecording();
    stopAudioRef.current?.();
    stopAudioRef.current = null;
  }, [cleanupRecording]);

  useEffect(() => () => stopSession(), [stopSession]);

  const assistantReply = useCallback(
    async (history: ChatMessage[]) => {
      const prefs = modelPrefsRef.current;
      const { content: reply, model } = await sendChat(
        skill,
        history,
        voicePreferences,
        {
          useWebSearch: webSearchRef.current,
          modelMode: prefs.mode,
          model: prefs.model,
        }
      );
      if (model) onModelUsed?.(model);
      if (!activeRef.current) return null;

      const withReply: ChatMessage[] = [
        ...history,
        { role: "assistant", content: reply },
      ];
      onMessagesChange(withReply);
      messagesRef.current = withReply;

      setPhase("speaking");
      const { stop, done } = speakText(reply, voicePreferences);
      stopAudioRef.current = stop;
      await done;
      stopAudioRef.current = null;
      return withReply;
    },
    [skill, voicePreferences, onMessagesChange, onModelUsed]
  );

  const startListening = useCallback(async () => {
    if (!activeRef.current) return;

    cleanupRecording();
    setPhase("listening");
    setError(null);
    chunksRef.current = [];
    heardSpeechRef.current = false;
    recordStartRef.current = Date.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      let silentFor = 0;
      const data = new Uint8Array(analyser.frequencyBinCount);

      const stopAndProcess = async () => {
        if (silenceTimerRef.current) {
          window.clearInterval(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }

        const rec = recorderRef.current;
        if (!rec || rec.state !== "recording") return;

        await new Promise<void>((resolve) => {
          rec.onstop = () => resolve();
          rec.stop();
        });

        cleanupRecording();

        const duration = Date.now() - recordStartRef.current;
        const blob = new Blob(chunksRef.current, {
          type: mimeTypeRef.current || "audio/webm",
        });

        if (!activeRef.current) return;

        if (
          !heardSpeechRef.current ||
          duration < MIN_SPEECH_MS ||
          blob.size < 1000
        ) {
          setError("Didn't catch that — speak again.");
          startListening();
          return;
        }

        setPhase("processing");
        try {
          const transcript = await speechToText(blob);
          if (!activeRef.current) return;

          if (!transcript.trim()) {
            setError("No speech detected.");
            startListening();
            return;
          }

          const userMsg: ChatMessage = {
            role: "user",
            content: transcript.trim(),
          };
          const updated = [...messagesRef.current, userMsg];
          onMessagesChange(updated);
          messagesRef.current = updated;

          await assistantReply(updated);
          if (activeRef.current) startListening();
        } catch (e) {
          const msg =
            e instanceof Error ? e.message : "Transcription failed.";
          setError(msg);
          if (activeRef.current) startListening();
        }
      };

      recorder.start(200);

      silenceTimerRef.current = window.setInterval(() => {
        if (!activeRef.current || !analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(data);
        const avg =
          data.reduce((sum, v) => sum + v, 0) / Math.max(data.length, 1);
        setLevel(Math.min(1, avg / 80));

        if (avg > SILENCE_THRESHOLD) {
          heardSpeechRef.current = true;
          silentFor = 0;
        } else if (heardSpeechRef.current) {
          silentFor += 200;
          if (silentFor >= SILENCE_MS) {
            stopAndProcess();
          }
        }

        if (Date.now() - recordStartRef.current > MAX_RECORD_MS) {
          stopAndProcess();
        }
      }, 200);
    } catch {
      setError("Microphone access denied.");
      stopSession();
    }
  }, [assistantReply, cleanupRecording, onMessagesChange, stopSession]);

  const startSession = useCallback(async () => {
    activeRef.current = true;
    setActive(true);
    setError(null);

    let current = messagesRef.current;
    if (current.length === 0) {
      const scenario = SCENARIOS[skill][0];
      onScenarioStart?.(scenario);
      const starter: ChatMessage = {
        role: "user",
        content: scenario.prompt,
      };
      current = [starter];
      onMessagesChange(current);
      messagesRef.current = current;
    }

    setPhase("processing");
    try {
      await assistantReply(current);
      if (activeRef.current) await startListening();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Could not start session.";
      setError(msg);
      stopSession();
    }
  }, [
    assistantReply,
    onMessagesChange,
    onScenarioStart,
    skill,
    startListening,
    stopSession,
  ]);

  function handleToggle() {
    if (active) {
      stopSession();
      return;
    }
    startSession();
  }

  const phaseLabel: Record<VoicePhase, string> = {
    idle: "Tap to begin",
    listening: "Listening…",
    processing: "Thinking…",
    speaking: "Tutor speaking…",
  };

  return (
    <div className="flex flex-col items-center gap-3 min-w-[140px]">
      <div className="relative flex items-center justify-center">
        {active && phase === "listening" && (
          <span
            className="absolute inset-0 rounded-full bg-red-400/30 animate-pulse-ring"
            style={{ transform: `scale(${1 + level * 0.4})` }}
          />
        )}
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled && !active}
          className={clsx(
            "relative z-10 flex h-16 w-16 items-center justify-center rounded-full transition-all shadow-lift",
            active
              ? phase === "listening"
                ? "bg-red-500 text-white"
                : phase === "speaking"
                  ? "bg-gold text-ink"
                  : "bg-sea text-white"
              : "bg-ink text-white hover:bg-ink-soft",
            "disabled:opacity-50"
          )}
          title={active ? "Stop live dialogue" : "Start live dialogue"}
        >
          {phase === "processing" ? (
            <Loader2 className="w-7 h-7 animate-spin" />
          ) : active ? (
            <MicOff className="w-7 h-7" />
          ) : (
            <Mic className="w-7 h-7" />
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold text-ink">
          {active ? phaseLabel[phase] : phaseLabel.idle}
        </p>
        {active && (
          <p className="text-[10px] text-ink-muted mt-0.5">Tap again to stop</p>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 text-center max-w-[180px] leading-tight">
          {error}
        </p>
      )}
    </div>
  );
}
