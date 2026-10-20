export class SpotifyApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    /** Campo `reason` que Spotify manda en algunos 403 del player (p. ej. PREMIUM_REQUIRED). */
    readonly reason?: string,
    /** Segundos a esperar, si fue un 429 que no se reintentó. */
    readonly retryAfter?: number,
  ) {
    super(message);
    this.name = 'SpotifyApiError';
  }
}

/** Mensaje legible para mostrar en la UI. */
export function describeError(err: unknown): string {
  if (err instanceof SpotifyApiError) {
    switch (err.status) {
      case 401:
        return 'La sesión expiró. Volvé a iniciar sesión.';
      case 403:
        return `Spotify no permite esta acción${err.reason ? ` (${err.reason})` : ''}: ${err.message}`;
      case 404:
        return `No encontrado: ${err.message}`;
      case 429:
        return `Demasiadas solicitudes. Probá de nuevo en ${err.retryAfter ?? 'unos'} segundos.`;
      default:
        return err.message;
    }
  }
  return err instanceof Error ? err.message : String(err);
}
