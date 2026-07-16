"use client";

import { useEffect, useState } from "react";
import {
  fetchConfig,
  fetchHealth,
  ModelMode,
  ModelPreferences,
  MODEL_LABELS,
  Skill,
  ProviderConfig,
} from "@/lib/api";
import { clsx } from "clsx";
import { Cpu, Zap } from "lucide-react";

interface ModelSelectorProps {
  skill: Skill;
  value: ModelPreferences;
  onChange: (prefs: ModelPreferences) => void;
  activeModel?: string | null;
}

export function ModelSelector({
  skill,
  value,
  onChange,
  activeModel,
}: ModelSelectorProps) {
  const [config, setConfig] = useState<ProviderConfig | null>(null);
  const [installed, setInstalled] = useState<string[]>([]);

  useEffect(() => {
    fetchConfig().then(setConfig).catch(() => setConfig(null));
    fetchHealth()
      .then((h) => setInstalled(h.models_installed || []))
      .catch(() => setInstalled([]));
  }, []);

  const catalog = config?.model_catalog?.length
    ? config.model_catalog
    : Object.keys(MODEL_LABELS);
  const autoModel = config?.models_by_skill?.[skill] || "llama3.2";
  const displayModel =
    activeModel ||
    (value.mode === "manual" && value.model ? value.model : autoModel);

  return (
    <div className="glass-panel rounded-2xl p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5" />
          Model
        </p>
        <span className="text-[10px] font-medium text-sea truncate max-w-[160px]">
          {MODEL_LABELS[displayModel] || displayModel}
        </span>
      </div>

      <div className="inline-flex rounded-full border border-ink/10 bg-white/70 p-0.5">
        <button
          type="button"
          onClick={() => onChange({ mode: "auto", model: null })}
          className={clsx(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all",
            value.mode === "auto"
              ? "bg-sea text-white"
              : "text-ink-muted hover:text-ink"
          )}
        >
          <Zap className="w-3 h-3" />
          Auto
        </button>
        <button
          type="button"
          onClick={() =>
            onChange({
              mode: "manual",
              model: value.model || autoModel,
            })
          }
          className={clsx(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all",
            value.mode === "manual"
              ? "bg-ink text-white"
              : "text-ink-muted hover:text-ink"
          )}
        >
          Manual
        </button>
      </div>

      {value.mode === "auto" ? (
        <p className="text-[11px] text-ink-muted leading-relaxed">
          This skill uses <strong className="text-ink">{autoModel}</strong>
          {installed.length > 0 && !installed.some((m) => m.startsWith(autoModel.split(":")[0])) && (
            <> · falls back to an online container if needed</>
          )}
        </p>
      ) : (
        <select
          value={value.model || autoModel}
          onChange={(e) =>
            onChange({ mode: "manual", model: e.target.value })
          }
          className="w-full rounded-xl border border-ink/10 bg-white/90 px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-sea/40"
        >
          {catalog.map((m) => {
            const up = installed.length === 0 || installed.some(
              (i) => i === m || i.startsWith(`${m}:`) || m.startsWith(i.split(":")[0])
            );
            return (
              <option key={m} value={m}>
                {(MODEL_LABELS[m] || m) + (up ? "" : " · offline")}
              </option>
            );
          })}
        </select>
      )}
    </div>
  );
}

export function defaultModelPreferences(mode: ModelMode = "auto"): ModelPreferences {
  return { mode, model: null };
}
