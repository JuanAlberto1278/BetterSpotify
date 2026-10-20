export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  /** Epoch en ms en que vence el access token. */
  expiresAt: number;
  scope: string;
}

export const TOKENS_STORAGE_KEY = 'betterspotify.tokens';

export function loadTokens(): StoredTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredTokens>;
    if (!parsed.accessToken || !parsed.refreshToken || typeof parsed.expiresAt !== 'number') {
      return null;
    }
    return parsed as StoredTokens;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: StoredTokens): void {
  localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
}

export function clearTokens(): void {
  localStorage.removeItem(TOKENS_STORAGE_KEY);
}
