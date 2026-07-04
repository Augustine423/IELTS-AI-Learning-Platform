"use client";

import { useState, useRef, useEffect } from "react";
import {
  Skill,
  ChatMessage,
  VoicePreferences,
  streamChat,
  SKILL_STARTERS,
} from "@/lib/api";
import { VoiceConversation } from "./VoiceConversation";
import { AudioPlayer } from "./AudioPlayer";
import { Send, Loader2 } from "lucide-react";

interface ChatInterfaceProps {
  skill: Skill;
  voicePreferences: VoicePreferences;
}

export function ChatInterface({ skill, voicePreferences }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    return () => abortRef.current?.();
  }, []);

  function sendMessage(text: string) {
    if (!text.trim() || loading) return;

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
            content: `Error: ${err}. Is Ollama running? Try: ollama pull llama3.2`,
          },
        ]);
        setStreamingText("");
        setLoading(false);
      }
    );
  }

  function handleStarter() {
    sendMessage(SKILL_STARTERS[skill]);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px]">
        {messages.length === 0 && !streamingText && (
          <div className="text-center py-12">
            <p className="text-slate-500 mb-2">
              Start your {skill} practice session. The AI tutor adapts to your level.
            </p>
            <p className="text-slate-400 text-sm mb-6">
              Tap the mic for hands-free voice conversation, or type below.
            </p>
            <button
              onClick={handleStarter}
              className="px-6 py-3 bg-ielts-blue text-white rounded-xl hover:bg-ielts-navy transition-colors font-medium"
            >
              Start Practice Session
            </button>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-ielts-blue text-white"
                  : "bg-white border border-slate-200 text-slate-800 shadow-sm"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              {msg.role === "assistant" && (
                <AudioPlayer text={msg.content} voicePreferences={voicePreferences} />
              )}
            </div>
          </div>
        ))}

        {streamingText && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white border border-slate-200 text-slate-800 shadow-sm">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{streamingText}</p>
              <span className="inline-block w-2 h-4 bg-ielts-blue animate-pulse ml-0.5" />
            </div>
          </div>
        )}

        {loading && !streamingText && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-ielts-blue" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex items-end gap-3">
          <VoiceConversation
            skill={skill}
            voicePreferences={voicePreferences}
            messages={messages}
            onMessagesChange={setMessages}
            disabled={loading}
          />
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
                ? "Paste your essay here..."
                : "Or type your message..."
            }
            rows={2}
            className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ielts-blue focus:border-transparent"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="p-3 bg-ielts-blue text-white rounded-xl hover:bg-ielts-navy transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
