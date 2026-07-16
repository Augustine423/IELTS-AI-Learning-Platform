"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, Square, Loader2 } from "lucide-react";
import { textToSpeech, VoicePreferences } from "@/lib/api";

interface AudioPlayerProps {
  text: string;
  voicePreferences: VoicePreferences;
  autoPlay?: boolean;
}

export function AudioPlayer({
  text,
  voicePreferences,
  autoPlay = false,
}: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (autoPlay && text) {
      play();
    }
    // intentionally only when text identity changes for autoplay starters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoPlay]);

  async function play() {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }

    setLoading(true);
    try {
      const dataUrl = await textToSpeech(text, voicePreferences);
      const audio = new Audio(dataUrl);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      await audio.play();
      setPlaying(true);
    } catch {
      // TTS unavailable — silent fail
    } finally {
      setLoading(false);
    }
  }

  if (!text) return null;

  return (
    <button
      type="button"
      onClick={play}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-sea hover:text-sea-deep transition-colors mt-2.5"
      title="Listen to this response"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : playing ? (
        <Square className="w-3 h-3 fill-current" />
      ) : (
        <Volume2 className="w-3.5 h-3.5" />
      )}
      {playing ? "Stop" : "Listen"}
    </button>
  );
}
