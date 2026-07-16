"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  ConnectionState,
} from "livekit-client";
import {
  Skill,
  VoicePreferences,
  createLiveKitToken,
  fetchLiveKitStatus,
} from "@/lib/api";
import { Scenario } from "@/lib/scenarios";
import { Mic, MicOff, PhoneOff, Radio, Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface LiveKitVoiceRoomProps {
  skill: Skill;
  voicePreferences: VoicePreferences;
  scenario?: Scenario | null;
  disabled?: boolean;
}

export function LiveKitVoiceRoom({
  skill,
  voicePreferences,
  scenario = null,
  disabled = false,
}: LiveKitVoiceRoomProps) {
  const roomRef = useRef<Room | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [status, setStatus] = useState("Checking LiveKit…");
  const [error, setError] = useState<string | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchLiveKitStatus()
      .then((s) => {
        if (!cancelled) {
          setConfigured(s.configured);
          setStatus(
            s.configured
              ? "Ready — start a LiveKit voice session for this skill"
              : "LiveKit not configured on the backend"
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setConfigured(false);
          setStatus("Could not reach LiveKit status endpoint");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const disconnect = useCallback(async () => {
    const room = roomRef.current;
    roomRef.current = null;
    if (room) {
      await room.disconnect();
    }
    setConnected(false);
    setConnecting(false);
    setStatus("Disconnected");
  }, []);

  useEffect(() => {
    return () => {
      void disconnect();
    };
  }, [disconnect]);

  const connect = useCallback(async () => {
    if (disabled || connecting || connected) return;
    setError(null);
    setConnecting(true);
    setStatus("Creating room token…");

    try {
      const tok = await createLiveKitToken({
        skill,
        voicePreferences,
        scenarioId: scenario?.id,
        scenarioPrompt: scenario?.prompt,
      });

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      roomRef.current = room;

      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          if (!audioElRef.current) {
            audioElRef.current = track.attach() as HTMLAudioElement;
            audioElRef.current.autoplay = true;
            document.body.appendChild(audioElRef.current);
          } else {
            track.attach(audioElRef.current);
          }
        }
      });

      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        if (state === ConnectionState.Connected) {
          setConnected(true);
          setStatus(`Live · ${tok.room_name}`);
        } else if (state === ConnectionState.Disconnected) {
          setConnected(false);
          setStatus("Disconnected");
        }
      });

      setStatus("Connecting to LiveKit Cloud…");
      await room.connect(tok.url, tok.token);
      await room.localParticipant.setMicrophoneEnabled(true);
      setMicEnabled(true);
      setStatus("Connected — speak with your IELTS tutor");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("Connection failed");
      await disconnect();
    } finally {
      setConnecting(false);
    }
  }, [
    disabled,
    connecting,
    connected,
    skill,
    voicePreferences,
    scenario,
    disconnect,
  ]);

  async function toggleMic() {
    const room = roomRef.current;
    if (!room) return;
    const next = !micEnabled;
    await room.localParticipant.setMicrophoneEnabled(next);
    setMicEnabled(next);
  }

  if (configured === false) {
    return (
      <div className="text-sm text-ink-muted leading-relaxed">
        LiveKit Cloud is not configured. Add{" "}
        <code className="text-xs">LIVEKIT_URL</code>,{" "}
        <code className="text-xs">LIVEKIT_API_KEY</code>, and{" "}
        <code className="text-xs">LIVEKIT_API_SECRET</code> to{" "}
        <code className="text-xs">.env</code>, then run the agent worker.
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
      <div className="flex items-center gap-2">
        {!connected ? (
          <button
            type="button"
            onClick={() => void connect()}
            disabled={disabled || connecting || configured !== true}
            className={clsx(
              "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors",
              connecting
                ? "bg-ink-muted"
                : "bg-skill-speaking hover:opacity-90 disabled:opacity-40"
            )}
          >
            {connecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Radio className="w-4 h-4" />
            )}
            {connecting ? "Connecting…" : "Start LiveKit"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void toggleMic()}
              className={clsx(
                "inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-md transition-colors",
                micEnabled
                  ? "bg-sea text-white"
                  : "bg-white text-ink border border-ink/15"
              )}
            >
              {micEnabled ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MicOff className="w-4 h-4" />
              )}
              {micEnabled ? "Mic on" : "Mic off"}
            </button>
            <button
              type="button"
              onClick={() => void disconnect()}
              className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold bg-red-600 text-white shadow-md hover:bg-red-700"
            >
              <PhoneOff className="w-4 h-4" />
              End
            </button>
          </>
        )}
      </div>
      <div className="flex-1 text-center sm:text-left min-w-0">
        <p className="text-sm font-semibold text-ink">
          LiveKit · {skill} tutor
        </p>
        <p className="text-xs text-ink-muted mt-1 leading-relaxed truncate">
          {status}
        </p>
        {error && (
          <p className="text-xs text-red-600 mt-1 whitespace-pre-wrap break-words">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
