/**
 * Server-only client for the production YourGrails API.
 *
 * Verified base URL: https://api.yourgrails.com/api (see docs/YOUR-GRAILS-ARCHITECTURE.md).
 * Only imported from createServerFn handlers, so it never ships in the browser bundle.
 * Public reads need no credentials. Never add a bearer token or secret here without moving it to env.
 */

export const DEFAULT_YG_API_BASE = "https://api.yourgrails.com/api";

export class YgApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "YgApiError";
    this.status = status;
  }
}

function baseUrl(): string {
  const fromEnv = process.env.YG_API_BASE_URL?.trim();
  return (fromEnv || DEFAULT_YG_API_BASE).replace(/\/+$/, "");
}

type Query = Record<string, string | number | undefined | null>;

export function buildPath(path: string, query?: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Mirrors the production client's error message extraction. */
export function errorMessage(body: unknown, statusText: string): string {
  const b = body as { error?: unknown; message?: unknown } | null;
  if (b && typeof b.error === "object" && b.error && "message" in b.error) {
    return String((b.error as { message: unknown }).message || statusText || "Request failed");
  }
  if (b && typeof b.error === "string") return b.error;
  if (b && typeof b.message === "string") return b.message;
  return statusText || "Request failed";
}

/** GET a production endpoint and unwrap the `{ success, data }` envelope. */
export async function ygGet<T>(path: string, query?: Query, timeoutMs = 8000): Promise<T> {
  const url = `${baseUrl()}${buildPath(path, query)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    throw new YgApiError(timedOut ? "YourGrails did not respond in time." : "YourGrails could not be reached.", 0);
  }
  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text.slice(0, 200) };
    }
  }
  if (!res.ok) throw new YgApiError(errorMessage(body, res.statusText), res.status);
  const env = body as { success?: boolean; data?: T } | null;
  if (!env || env.success === false || !("data" in env)) {
    throw new YgApiError(errorMessage(body, "Unexpected response from YourGrails."), res.status);
  }
  return env.data as T;
}
