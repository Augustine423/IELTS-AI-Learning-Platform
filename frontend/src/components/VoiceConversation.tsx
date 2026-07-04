"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Loader2, Radio } from "lucide-react";
import {
  Skill,
  ChatMessage,
  VoicePreferences,
  speechToText,
  sendChat,
  speakText,
  SKILL_STARTERS,
} from "@/lib/api";

type VoicePhase = "idle" | "listening" | "processing" | "speaking";

interface VoiceConversationProps {
  skill: Skill;
  voicePreferences: VoicePreferences;
  messages: ChatMessage[];
  onMessagesChange: (messages: ChatMessage[]) => void;
  disabled?: boolean;
}

function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  for (const type of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
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
}: VoiceConversationProps) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

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
      const reply = await sendChat(skill, history, voicePreferences, true);
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
    [skill, voicePreferences, onMessagesChange]
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
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
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

        if (!heardSpeechRef.current || duration < MIN_SPEECH_MS || blob.size < 1000) {
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

          const userMsg: ChatMessage = { role: "user", content: transcript.trim() };
          const updated = [...messagesRef.current, userMsg];
          onMessagesChange(updated);
          messagesRef.current = updated;

          await assistantReply(updated);
          if (activeRef.current) startListening();
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Transcription failed.";
          setError(msg);
          if (activeRef.current) startListening();
        }
      };

      recorder.start(200);

      silenceTimerRef.current = window.setInterval(() => {
        if (!activeRef.current || !analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(data);
        const level =
          data.reduce((sum, v) => sum + v, 0) / Math.max(data.length, 1);

        if (level > SILENCE_THRESHOLD) {
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
      const starter: ChatMessage = {
        role: "user",
        content: SKILL_STARTERS[skill],
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
      const msg = e instanceof Error ? e.message : "Could not start session.";
      setError(msg);
      stopSession();
    }
  }, [assistantReply, onMessagesChange, skill, startListening, stopSession]);

  function handleToggle() {
    if (active) {
      stopSession();
      return;
    }
    startSession();
  }

  const phaseLabel: Record<VoicePhase, string> = {
    idle: "Tap to start voice practice",
    listening: "Listening… speak now",
    processing: "Thinking…",
    speaking: "Tutor speaking…",
  };

  return (
    <div className="flex flex-col items-center gap-2 min-w-[120px]">
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled && !active}
        className={`relative p-4 rounded-full transition-all shadow-md ${
          active
            ? phase === "listening"
              ? "bg-red-500 text-white animate-pulse ring-4 ring-red-200"
              : "bg-ielts-gold text-ielts-navy ring-4 ring-amber-200"
            : "bg-ielts-blue text-white hover:bg-ielts-navy"
        } disabled:opacity-50`}
        title={active ? "Stop voice practice" : "Start voice conversation"}
      >
        {phase === "processing" ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : active ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
        {active && phase === "listening" && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
        )}
      </button>

      <div className="flex items-center gap-1 text-xs text-slate-600 text-center">
        {active && <Radio className="w-3 h-3 text-red-500 shrink-0" />}
        <span>{active ? phaseLabel[phase] : phaseLabel.idle}</span>
      </div>

      {active && (
        <p className="text-[10px] text-slate-400 text-center leading-tight">
          Tap mic again to stop
        </p>
      )}

      {error && (
        <p className="text-xs text-red-600 text-center max-w-[160px] leading-tight">
          {error}
        </p>
      )}
    </div>
  );
}
