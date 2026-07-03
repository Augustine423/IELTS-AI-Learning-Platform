"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { speechToText } from "@/lib/api";

interface AudioRecorderProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function AudioRecorder({ onTranscript, disabled }: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setProcessing(true);
        try {
          const transcript = await speechToText(blob);
          if (transcript) onTranscript(transcript);
        } catch (e) {
          console.error("STT error:", e);
        } finally {
          setProcessing(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
    } catch {
      alert("Microphone access denied. Please allow microphone access for speaking practice.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <button
      onClick={recording ? stopRecording : startRecording}
      disabled={disabled || processing}
      className={`p-3 rounded-full transition-all ${
        recording
          ? "bg-red-500 text-white animate-pulse"
          : "bg-ielts-blue text-white hover:bg-ielts-navy"
      } disabled:opacity-50`}
      title={recording ? "Stop recording" : "Record voice"}
    >
      {processing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : recording ? (
        <MicOff className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  );
}
