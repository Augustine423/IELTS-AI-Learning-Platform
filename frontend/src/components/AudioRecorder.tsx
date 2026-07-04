"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { speechToText } from "@/lib/api";

interface AudioRecorderProps {
  onTranscript: (text: string) => void;
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

export function AudioRecorder({ onTranscript, disabled }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startedAtRef.current = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stopStream();
        const durationMs = Date.now() - startedAtRef.current;
        const blobType = mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: blobType });

        if (durationMs < 800 || blob.size < 1000) {
          setError("Recording too short. Hold the mic and speak for at least 1 second.");
          setProcessing(false);
          return;
        }

        setProcessing(true);
        try {
          const transcript = await speechToText(blob);
          if (transcript.trim()) {
            onTranscript(transcript);
          } else {
            setError("No speech detected. Try speaking louder and closer to the mic.");
          }
        } catch (e) {
          const message =
            e instanceof Error ? e.message : "Voice transcription failed.";
          setError(message);
          console.error("STT error:", e);
        } finally {
          setProcessing(false);
        }
      };

      mediaRecorder.start(250);
      setRecording(true);
    } catch {
      setError("Microphone access denied. Allow mic access in your browser settings.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={recording ? stopRecording : startRecording}
        disabled={disabled || processing}
        className={`p-3 rounded-full transition-all ${
          recording
            ? "bg-red-500 text-white animate-pulse"
            : "bg-ielts-blue text-white hover:bg-ielts-navy"
        } disabled:opacity-50`}
        title={recording ? "Stop recording" : "Record voice"}
        type="button"
      >
        {processing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : recording ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 max-w-[140px] text-center leading-tight">
          {error}
        </p>
      )}
    </div>
  );
}
