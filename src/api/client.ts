import { getValidAccessToken, logout, refreshAccessToken } from '../auth/auth';
import { API_BASE_URL } from '../config';
import { SpotifyApiError } from './errors';

type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  query?: Record<string, QueryValue>;
  body?: unknown;
  signal?: AbortSignal;
}

const MAX_RATE_LIMIT_RETRIES = 3;
/** Si Spotify pide esperar más que esto, no bloqueamos: se lanza el error. */
const MAX_RETRY_AFTER_SECONDS = 30;

/**
 * Único punto de acceso a la Web API.
 * - 401: refresca el token y reintenta una vez.
 * - 429: espera lo que indique Retry-After y reintenta (hasta 3 veces).
 * - 403 y demás: lanza SpotifyApiError.
 * - 204 / cuerpo vacío: devuelve null.
 *
 * `path` puede ser relativo ("/me") o una URL completa (los `next` de la paginación).
 */
export async function spotifyFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body, signal } = options;
  const url = buildUrl(path, query);

  let retriedUnauthorized = false;
  let rateLimitRetries = 0;

  for (;;) {
    const token = await getValidAccessToken();
    const res = await fetch(url, {
      method,
      signal,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      if (!retriedUnauthorized) {
        retriedUnauthorized = true;
        await refreshAccessToken();
        continue;
      }
      logout();
      throw await toApiError(res);
    }

    if (res.status === 429) {
      const waitSeconds = parseRetryAfter(res.headers.get('Retry-After'), rateLimitRetries);
      if (rateLimitRetries < MAX_RATE_LIMIT_RETRIES && waitSeconds <= MAX_RETRY_AFTER_SECONDS) {
        rateLimitRetries++;
        console.warn(`[api] 429 en ${path}, reintentando en ${waitSeconds}s`);
        await sleep(waitSeconds * 1000, signal);
        continue;
      }
      throw await toApiError(res, waitSeconds);
    }

    if (!res.ok) throw await toApiError(res);

    return (await parseBody(res)) as T;
  }
}

/**
 * Algunos endpoints del player (shuffle, repeat, queue...) responden 200 con
 * texto plano en lugar de JSON o 204. Solo se parsea lo que es JSON; el resto
 * se trata como "sin contenido".
 */
async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  const isJson = res.headers.get('Content-Type')?.includes('json') ?? false;
  try {
    return JSON.parse(text);
  } catch (err) {
    if (isJson) throw err;
    return null;
  }
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Retry-After viene en segundos. Si el navegador no lo expone (CORS) se usa
 * backoff exponencial: 1s, 2s, 4s...
 */
function parseRetryAfter(header: string | null, attempt: number): number {
  const seconds = header ? Number.parseInt(header, 10) : Number.NaN;
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : 2 ** attempt;
}

async function toApiError(res: Response, retryAfter?: number): Promise<SpotifyApiError> {
  let message = res.statusText || `HTTP ${res.status}`;
  let reason: string | undefined;
  try {
    const data = (await res.json()) as { error?: { message?: string; reason?: string } | string };
    if (typeof data.error === 'string') message = data.error;
    else if (data.error) {
      message = data.error.message ?? message;
      reason = data.error.reason;
    }
  } catch {
    // Cuerpo vacío o no-JSON: se queda el statusText.
  }
  return new SpotifyApiError(res.status, message, reason, retryAfter);
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
