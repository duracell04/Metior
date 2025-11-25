const cache = new Map<string, { value: unknown; expires: number }>();

const RETRY_STATUS = new Set([429, 500, 502, 503, 504]);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const isOffline = (): boolean =>
  process.env.MEO_OFFLINE === "ng" || process.env.MEO_OFFLINE === "1" || Boolean(process.env.MEO_FREEZE_DATE);

/**
 * Single-source JSON fetch utility.
 * In offline mode, either throws (hard) or returns empty stub (soft).
 */
export async function fetchJson<T>(
  url: string,
  {
    params,
    cacheKey,
    ttlMs = 1000 * 60 * 60 * 12, // 12 hours
    timeoutMs = 10_000,
    retries = 3,
    soft = false,
  }: {
    params?: Record<string, string | number | undefined>;
    cacheKey?: string;
    ttlMs?: number;
    timeoutMs?: number;
    retries?: number;
    soft?: boolean;
  } = {}
): Promise<T> {
  if (isOffline()) {
    if (soft) return {} as T;
    throw new Error("offline demo: network disabled (fetchJson called)");
  }

  const key = cacheKey || `${url}?${params ? new URLSearchParams(params as Record<string, string>).toString() : ""}`;
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expires > now) {
    return cached.value as T;
  }

  const search = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : "";
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const fullUrl = url + search;
    try {
      const res = await fetch(fullUrl, {
        signal: controller.signal,
        headers: { "User-Agent": "Metior/1.0 (+metior.app)" },
        cache: "no-store",
      });

      if (res.ok) {
        const data = (await res.json()) as T;
        cache.set(key, { value: data, expires: now + ttlMs });
        clearTimeout(timer);
        return data;
      }

      if (res.status === 400) {
        const body = await safeText(res);
        const hint = fullUrl.includes("api_key=")
          ? "FRED_API_KEY looks invalid. Expect 32 lower-case a-z0-9. Remove the param or set a valid key."
          : "";
        throw new Error(`fetch failed 400${body ? `: ${body}` : ""}${hint ? ` — ${hint}` : ""}`);
      }

      if (!RETRY_STATUS.has(res.status) || attempt === retries) {
        const body = await safeText(res);
        throw new Error(`fetch failed ${res.status}${body ? `: ${body}` : ""}`);
      }
    } catch (err) {
      lastError = err;
      if (attempt === retries) {
        break;
      }
      // Exponential backoff with jitter.
      await sleep(400 * Math.pow(1.6, attempt) + Math.random() * 150);
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("fetch failed");
}

async function safeText(res: Response) {
  try {
    return await res.text();
  } catch {
    return "<no body>";
  }
}
