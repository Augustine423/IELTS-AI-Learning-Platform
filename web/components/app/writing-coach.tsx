'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SuggestionResult {
  improved: string;
  explanation: string;
  tips: string[];
  model: string;
  provider: string;
}

export function WritingCoach() {
  const [input, setInput] = useState(
    'Nowadays people is using internet too much and it make their life become worse.'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SuggestionResult | null>(null);

  const handleSuggest = async () => {
    const text = input.trim();
    if (!text) {
      setError('Enter a sentence or short paragraph first.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/writing/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Suggestion failed');
      }
      setResult(data as SuggestionResult);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Suggestion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-background mx-auto flex w-full max-w-3xl flex-col px-6 py-10">
      <p className="text-foreground text-2xl font-semibold tracking-tight">Writing coach</p>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        Type a sentence or short paragraph. A free local Ollama LLM (Docker) suggests a clearer Band
        8 style rewrite. LiveKit voice LLM is kept for speaking/listening/reading only.
      </p>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        className="border-border bg-background mt-8 w-full rounded-2xl border px-4 py-3 text-sm leading-6"
        placeholder="Enter your sentence here..."
      />

      <Button
        size="lg"
        disabled={loading}
        onClick={() => void handleSuggest()}
        className="mt-4 rounded-full font-mono text-xs font-bold tracking-wider uppercase"
      >
        {loading ? 'Suggesting...' : 'Suggest better writing'}
      </Button>

      {error && <p className="text-destructive mt-4 text-sm">{error}</p>}

      {result && (
        <div className="border-border mt-6 space-y-4 rounded-2xl border px-4 py-4">
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Improved version
            </p>
            <p className="text-foreground mt-2 text-sm leading-6">{result.improved}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Why this is better
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-6">{result.explanation}</p>
          </div>
          {result.tips.length > 0 && (
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                Quick tips
              </p>
              <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
                {result.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
            Model: {result.model} · Provider: {result.provider}
          </p>
        </div>
      )}
    </section>
  );
}
