"use client";

import { useEffect, useState } from "react";
import { fetchHealth } from "@/lib/api";
import { AlertTriangle } from "lucide-react";

/** Shows when LiveKit is up but Groq/OpenAI keys are missing (no AI replies). */
export function ApiKeyBanner() {
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    fetchHealth()
      .then((h) => setMissing(!h.llm_available))
      .catch(() => setMissing(false));
  }, []);

  if (!missing) return null;

  return (
    <div className="mx-4 mt-3 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
        <div className="leading-relaxed">
          <p className="font-semibold">AI replies need a Groq (or OpenAI) key</p>
          <p className="mt-1 text-amber-900/80 text-xs">
            LiveKit can connect, but chat and voice stay silent without{" "}
            <code className="text-[11px]">GROQ_API_KEY</code>. Get a free key at{" "}
            <a
              className="underline font-medium"
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
            >
              console.groq.com/keys
            </a>
            , put it in <code className="text-[11px]">.env</code>, then run{" "}
            <code className="text-[11px]">docker compose up -d</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
