import { ACCOUNTS_URL, CLIENT_ID, REDIRECT_URI, SCOPES } from '../config';
import { createCodeChallenge, generateRandomString } from './pkce';
import {
  clearTokens,
  loadTokens,
  saveTokens,
  TOKENS_STORAGE_KEY,
  type StoredTokens,
} from './tokenStore';

const VERIFIER_KEY = 'betterspotify.pkce_verifier';
const STATE_KEY = 'betterspotify.pkce_state';

/** Margen antes del vencimiento en el que ya consideramos el token "viejo". */
const REFRESH_MARGIN_MS = 60_000;

export class AuthError extends Error {
  constructor(
    message: string,
    /** Status HTTP del endpoint de tokens (0 si fue un error de red o local). */
    readonly status = 0,
    /** Código OAuth, por ejemplo "invalid_grant". */
    readonly code?: string,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ── Suscripción a cambios de sesión ─────────────────────────────────────────

type Listener = () => void;
const listeners = new Set<Listener>();

export function onAuthChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitAuthChange() {
  for (const listener of listeners) listener();
}

export function isAuthenticated(): boolean {
  return loadTokens() !== null;
}

/** Epoch en ms en que vence el access token actual (null si no hay sesión). */
export function getTokenExpiry(): number | null {
  return loadTokens()?.expiresAt ?? null;
}

// ── Login ───────────────────────────────────────────────────────────────────

export async function login(): Promise<void> {
  if (!CLIENT_ID) throw new AuthError('Falta VITE_SPOTIFY_CLIENT_ID en el archivo .env');

  const verifier = generateRandomString(64);
  const state = generateRandomString(16);
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: await createCodeChallenge(verifier),
    scope: SCOPES.join(' '),
    state,
  });

  window.location.assign(`${ACCOUNTS_URL}/authorize?${params}`);
}

// ── Callback ────────────────────────────────────────────────────────────────

let callbackPromise: Promise<void> | null = null;

/**
 * Intercambia el `code` de la URL por tokens. Es idempotente: el StrictMode de
 * React ejecuta los efectos dos veces y el code solo se puede canjear una vez.
 */
export function handleCallback(): Promise<void> {
  callbackPromise ??= doHandleCallback();
  return callbackPromise;
}

async function doHandleCallback(): Promise<void> {
  const params = new URLSearchParams(window.location.search);

  const error = params.get('error');
  if (error) {
    throw new AuthError(
      error === 'access_denied' ? 'Cancelaste el inicio de sesión.' : `Spotify devolvió: ${error}`,
    );
  }

  const code = params.get('code');
  const state = params.get('state');
  const expectedState = sessionStorage.getItem(STATE_KEY);
  const verifier = sessionStorage.getItem(VERIFIER_KEY);

  if (!code) throw new AuthError('La URL de callback no trae ningún code.');
  if (!state || state !== expectedState || !verifier) {
    throw new AuthError('El state no coincide o expiró. Volvé a iniciar sesión.');
  }

  try {
    const tokens = await requestTokens({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: verifier,
    });
    storeTokens(tokens);
  } finally {
    sessionStorage.removeItem(VERIFIER_KEY);
    sessionStorage.removeItem(STATE_KEY);
  }
}

// ── Refresh ─────────────────────────────────────────────────────────────────

let refreshPromise: Promise<string> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Refresca el access token. Si ya hay un refresh en curso, devuelve esa misma
 * promesa para no gastar el refresh token dos veces.
 */
export function refreshAccessToken(): Promise<string> {
  refreshPromise ??= doRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

async function doRefresh(): Promise<string> {
  const current = loadTokens();
  if (!current) throw new AuthError('No hay sesión iniciada.');

  try {
    const tokens = await requestTokens(
      {
        grant_type: 'refresh_token',
        refresh_token: current.refreshToken,
        client_id: CLIENT_ID,
      },
      current.refreshToken,
    );
    storeTokens(tokens);
    return tokens.accessToken;
  } catch (err) {
    // 400/401 del endpoint de tokens = refresh token revocado o inválido.
    // Los errores de red no cierran la sesión.
    if (err instanceof AuthError && (err.status === 400 || err.status === 401)) logout();
    throw err;
  }
}

/** Devuelve un access token vigente, refrescándolo antes si está por vencer. */
export async function getValidAccessToken(): Promise<string> {
  const tokens = loadTokens();
  if (!tokens) throw new AuthError('No hay sesión iniciada.');
  if (Date.now() < tokens.expiresAt - REFRESH_MARGIN_MS) return tokens.accessToken;
  return refreshAccessToken();
}

function scheduleRefresh() {
  clearTimeout(refreshTimer);
  const tokens = loadTokens();
  if (!tokens) return;
  const delay = Math.max(0, tokens.expiresAt - REFRESH_MARGIN_MS - Date.now());
  refreshTimer = setTimeout(() => {
    refreshAccessToken().catch((err) => console.warn('[auth] refresh automático falló', err));
  }, delay);
}

// ── Logout / init ───────────────────────────────────────────────────────────

export function logout(): void {
  clearTimeout(refreshTimer);
  clearTokens();
  emitAuthChange();
}

let initialized = false;

/** Llamar una vez al arrancar la app. */
export function initAuth(): void {
  if (initialized) return;
  initialized = true;

  scheduleRefresh();

  // Mantener sincronizadas varias pestañas abiertas.
  window.addEventListener('storage', (event) => {
    if (event.key !== TOKENS_STORAGE_KEY) return;
    scheduleRefresh();
    emitAuthChange();
  });

  // Los timers se congelan en pestañas en segundo plano; revisar al volver.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isAuthenticated()) {
      getValidAccessToken().catch(() => {});
    }
  });
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function storeTokens(tokens: StoredTokens) {
  saveTokens(tokens);
  scheduleRefresh();
  emitAuthChange();
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
}

async function requestTokens(
  body: Record<string, string>,
  previousRefreshToken?: string,
): Promise<StoredTokens> {
  let res: Response;
  try {
    res = await fetch(`${ACCOUNTS_URL}/api/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body),
    });
  } catch {
    throw new AuthError('No se pudo conectar con Spotify.');
  }

  const data = (await res.json().catch(() => ({}))) as Partial<TokenResponse> & {
    error?: string;
    error_description?: string;
  };

  if (!res.ok || !data.access_token) {
    throw new AuthError(
      data.error_description ?? data.error ?? `Error ${res.status} al pedir tokens`,
      res.status,
      data.error,
    );
  }

  // Spotify puede rotar el refresh token; si no manda uno nuevo, se conserva el anterior.
  const refreshToken = data.refresh_token ?? previousRefreshToken;
  if (!refreshToken) throw new AuthError('Spotify no devolvió un refresh token.');

  return {
    accessToken: data.access_token,
    refreshToken,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    scope: data.scope ?? '',
  };
}
