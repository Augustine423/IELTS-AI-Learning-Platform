import { NextResponse } from 'next/server';

type SuggestBody = {
  text?: string;
};

type OllamaGenerateResponse = {
  response?: string;
};

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://ollama:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'qwen2.5:3b-instruct';

function fallbackSuggest(text: string) {
  const cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/\bi is\b/gi, 'I am')
    .replace(/\bpeople is\b/gi, 'people are')
    .replace(/\bmake their life become worse\b/gi, 'makes their lives worse')
    .replace(/\btoo much\b/gi, 'excessively')
    .trim();

  const improved =
    cleaned.endsWith('.') || cleaned.endsWith('?') || cleaned.endsWith('!')
      ? cleaned[0].toUpperCase() + cleaned.slice(1)
      : `${cleaned[0].toUpperCase() + cleaned.slice(1)}.`;

  return {
    improved,
    explanation:
      'Offline fallback rewrite: fixed common subject-verb agreement, smoothed wording, and used a clearer academic tone.',
    tips: [
      'Check subject-verb agreement (people are, not people is).',
      'Prefer precise verbs over vague phrases like become worse.',
      'Keep one clear idea per sentence for Band 8 coherence.',
    ],
    model: 'heuristic-fallback',
    provider: 'local-fallback',
  };
}

function extractJsonObject(raw: string): Record<string, unknown> | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  try {
    return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function suggestWithOllama(text: string) {
  const prompt = `You are an IELTS Band 8 Writing coach.
Improve the learner's English sentence or short paragraph.
Return ONLY valid JSON with keys: improved (string), explanation (string), tips (array of up to 3 short strings).
Do not use markdown.

Learner text:
"""${text}"""`;

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.3,
      },
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = (await response.json()) as OllamaGenerateResponse;
  const parsed = extractJsonObject(data.response ?? '');
  if (!parsed || typeof parsed.improved !== 'string') {
    throw new Error('Ollama returned an unexpected response');
  }

  const tips = Array.isArray(parsed.tips)
    ? parsed.tips.filter((tip): tip is string => typeof tip === 'string').slice(0, 3)
    : [];

  return {
    improved: parsed.improved,
    explanation:
      typeof parsed.explanation === 'string'
        ? parsed.explanation
        : 'Improved grammar, vocabulary, and clarity for IELTS Writing.',
    tips,
    model: OLLAMA_MODEL,
    provider: 'ollama',
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SuggestBody;
    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }
    if (text.length > 2000) {
      return NextResponse.json({ error: 'text is too long (max 2000 chars)' }, { status: 400 });
    }

    try {
      const suggestion = await suggestWithOllama(text);
      return NextResponse.json(suggestion);
    } catch (error) {
      console.warn('Ollama unavailable, using fallback writer:', error);
      return NextResponse.json(fallbackSuggest(text));
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to suggest writing improvements' }, { status: 500 });
  }
}
