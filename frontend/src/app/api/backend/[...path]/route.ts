import { NextRequest, NextResponse } from "next/server";

const API_INTERNAL_URL = (
  process.env.API_INTERNAL_URL || "http://localhost:8000"
).replace(/\/$/, "");

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

function proxyTimeoutMs(path: string): number {
  if (path.includes("voice/stt")) return 300_000;
  if (path.includes("voice/tts")) return 120_000;
  if (path.includes("chat/stream")) return 300_000;
  return 60_000;
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params;
  const pathStr = path.join("/");
  const targetUrl = `${API_INTERNAL_URL}/${pathStr}${request.nextUrl.search}`;
  const timeoutMs = proxyTimeoutMs(pathStr);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === "host" || lower === "connection") return;
    headers.set(key, value);
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers,
    redirect: "manual",
    signal: controller.signal,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const contentType = request.headers.get("content-type") || "";
    // Buffer uploads (mic audio) — streaming multipart through Node fetch is unreliable.
    if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/octet-stream")
    ) {
      init.body = await request.arrayBuffer();
    } else {
      init.body = request.body;
      init.duplex = "half";
    }
  }

  try {
    const response = await fetch(targetUrl, init);

    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "transfer-encoding") return;
      responseHeaders.set(key, value);
    });

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Backend request timed out. Voice transcription can take up to a minute on first use."
        : "Backend unavailable. Check that docker compose is running.";
    return NextResponse.json({ detail: message }, { status: 504 });
  } finally {
    clearTimeout(timeoutId);
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
