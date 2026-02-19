export const DEFAULT_REQUEST_TIMEOUT_MS = 8000;

type FetchWithTimeoutOptions = RequestInit & {
  timeout?: number;
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!value) {
    throw new Error("API URL is not configured.");
  }

  return trimTrailingSlash(value);
}

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const apiPrefix = base.toLowerCase().endsWith("/api") ? "" : "/api";
  return `${base}${apiPrefix}${normalizedPath}`;
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  options: FetchWithTimeoutOptions = {},
): Promise<Response> {
  const { timeout = DEFAULT_REQUEST_TIMEOUT_MS, signal: externalSignal, ...requestInit } = options;

  const controller = new AbortController();
  let didTimeout = false;

  const onExternalAbort = () => {
    controller.abort();
  };

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener("abort", onExternalAbort);
    }
  }

  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeout);

  try {
    return await fetch(input, {
      ...requestInit,
      signal: controller.signal,
    });
  } catch (error) {
    if (didTimeout) {
      throw new Error("Request timed out. Please try again.");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
    if (externalSignal) {
      externalSignal.removeEventListener("abort", onExternalAbort);
    }
  }
}

export function limitResults<T>(items: T[], max: number): T[] {
  if (max <= 0) {
    return [];
  }

  return items.length > max ? items.slice(0, max) : items;
}

export function parseNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

export function parseText(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
}
