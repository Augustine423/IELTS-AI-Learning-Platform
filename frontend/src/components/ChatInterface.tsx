"use client";

import { useState, useRef, useEffect } from "react";
import {
  Skill,
  ChatMessage,
  VoicePreferences,
  streamChat,
} from "@/lib/api";
import { SCENARIOS, SKILL_META, Scenario } from "@/lib/scenarios";
import { LiveKitVoiceRoom } from "./LiveKitVoiceRoom";
import { AudioPlayer } from "./AudioPlayer";
import {
  Send,
  Globe,
  MessageSquare,
  Radio,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";

interface ChatInterfaceProps {
  skill: Skill;
  voicePreferences: VoicePreferences;
}

type PracticeMode = "livekit" | "chat";

export function ChatInterface({ skill, voicePreferences }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [useWebSearch, setUseWebSearch] = useState(skill === "speaking");
  const [mode, setMode] = useState<PracticeMode>("livekit");
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<(() => void) | null>(null);
  const meta = SKILL_META[skill];
  const scenarios = SCENARIOS[skill];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    return () => abortRef.current?.();
  }, []);

  function sendMessage(text: string, scenario?: Scenario | null) {
    if (!text.trim() || loading) return;

    if (scenario) setActiveScenario(scenario);

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);
    setStreamingText("");

    let accumulated = "";

    abortRef.current = streamChat(
      skill,
      updated,
      voicePreferences,
      (chunk) => {
        accumulated += chunk;
        setStreamingText(accumulated);
      },
      () => {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: accumulated },
        ]);
        setStreamingText("");
        setLoading(false);
      },
      (err) => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Something went wrong: ${err}\n\nTip: set GROQ_API_KEY in .env and ensure the backend is running.`,
          },
        ]);
        setStreamingText("");
        setLoading(false);
      },
      { useWebSearch }
    );
  }

  function startScenario(scenario: Scenario) {
    setActiveScenario(scenario);
    if (mode === "livekit") return;
    sendMessage(scenario.prompt, scenario);
  }

  function resetSession() {
    abortRef.current?.();
    setMessages([]);
    setStreamingText("");
    setLoading(false);
    setActiveScenario(null);
    setInput("");
  }

  const empty = messages.length === 0 && !streamingText;

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-8rem)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-2">
        <div className="inline-flex rounded-full border border-ink/10 bg-white/70 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMode("livekit")}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
              mode === "livekit"
                ? "bg-skill-speaking text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            )}
          >
            <Radio className="w-3.5 h-3.5" />
            LiveKit voice
          </button>
          <button
            type="button"
            onClick={() => setMode("chat")}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
              mode === "chat"
                ? "bg-sea text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeScenario && (
            <span className="hidden sm:inline text-xs text-ink-muted truncate max-w-[200px]">
              Scene · {activeScenario.title}
            </span>
          )}
          {(!empty || activeScenario) && (
            <button
              type="button"
              onClick={resetSession}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New session
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {empty && (
          <div className="animate-fade-up py-4">
            <div className="mb-6 max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea">
                {meta.name} studio
              </p>
              <h2 className="brand-mark text-3xl text-ink mt-1">{meta.tagline}</h2>
              <p className="text-sm text-ink-muted mt-2 leading-relaxed">
                Pick a situation
                {mode === "livekit"
                  ? ", then start LiveKit voice below."
                  : " to begin a text chat with the tutor."}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => startScenario(s)}
                  disabled={loading}
                  className={clsx(
                    "scenario-chip text-left rounded-2xl border bg-white/80 p-4 transition-colors",
                    activeScenario?.id === s.id
                      ? "border-sea ring-2 ring-sea/20"
                      : "border-ink/8 hover:border-sea/40"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-ink">{s.title}</p>
                      <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                        {s.blurb}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={clsx(
              "flex animate-fade-up",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={clsx(
                "max-w-[85%] px-4 py-3",
                msg.role === "user" ? "msg-user" : "msg-ai"
              )}
            >
              {msg.role === "assistant" && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-sea mb-1.5">
                  Tutor
                </p>
              )}
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>
              {msg.role === "assistant" && (
                <AudioPlayer
                  text={msg.content}
                  voicePreferences={voicePreferences}
                />
              )}
            </div>
          </div>
        ))}

        {streamingText && (
          <div className="flex justify-start">
            <div className="msg-ai max-w-[85%] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-sea mb-1.5">
                Tutor
              </p>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {streamingText}
                <span className="inline-block w-1.5 h-4 bg-sea animate-pulse ml-0.5 align-middle" />
              </p>
            </div>
          </div>
        )}

        {loading && !streamingText && (
          <div className="flex justify-start">
            <div className="msg-ai px-4 py-3 flex items-center gap-1.5">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 border-t border-ink/8 bg-foam/90 backdrop-blur-md p-4">
        {mode === "livekit" ? (
          <div className="glass-panel rounded-2xl p-4">
            <LiveKitVoiceRoom
              skill={skill}
              voicePreferences={voicePreferences}
              scenario={activeScenario}
              disabled={loading}
            />
            <p className="text-xs text-ink-muted mt-3 leading-relaxed">
              Realtime voice via LiveKit Cloud. Optional: select a scene above
              first, then Start LiveKit.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="inline-flex items-center gap-2 text-xs text-ink-muted cursor-pointer select-none px-1">
              <input
                type="checkbox"
                checked={useWebSearch}
                onChange={(e) => setUseWebSearch(e.target.checked)}
                className="rounded border-ink/20 text-sea focus:ring-sea"
              />
              <Globe className="w-3.5 h-3.5" />
              Web enrich
            </label>
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder={
                  skill === "writing"
                    ? "Paste your essay or ask for a topic…"
                    : empty
                      ? "Or type your own situation…"
                      : "Continue the conversation…"
                }
                rows={2}
                className="flex-1 resize-none rounded-2xl border border-ink/10 bg-white/90 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-sea/40 focus:border-transparent shadow-sm"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="p-3.5 rounded-2xl bg-sea text-white hover:bg-sea-deep transition-colors disabled:opacity-40 shadow-md"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
