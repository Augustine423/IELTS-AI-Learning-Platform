"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { textToSpeech, VoicePreferences } from "@/lib/api";

interface AudioPlayerProps {
  text: string;
  voicePreferences: VoicePreferences;
  autoPlay?: boolean;
}

export function AudioPlayer({ text, voicePreferences, autoPlay = false }: AudioPlayerProps) {
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
      onClick={play}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs text-ielts-blue hover:text-ielts-navy transition-colors mt-2"
      title="Listen to this response"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : playing ? (
        <VolumeX className="w-3.5 h-3.5" />
      ) : (
        <Volume2 className="w-3.5 h-3.5" />
      )}
      {playing ? "Stop" : "Listen"}
    </button>
  );
}
