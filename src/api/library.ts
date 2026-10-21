import { spotifyFetch } from './client';
import type { Paging, SavedTrack, Track } from './types';

const PAGE_SIZE = 50;
/** Máximo de URIs por llamada a /me/library. */
export const LIBRARY_BATCH_SIZE = 40;

/** Una página de las canciones que te gustan. `url` = el `next` de la página anterior. */
export async function getSavedTracksPage(
  url: string | null,
  signal?: AbortSignal,
): Promise<Paging<Track>> {
  const page = await spotifyFetch<Paging<SavedTrack>>(url ?? '/me/tracks', {
    query: url ? undefined : { limit: PAGE_SIZE },
    signal,
  });
  return {
    ...page,
    items: page.items
      .map((entry) => entry.track ?? entry.item ?? null)
      .filter((t): t is Track => t?.type === 'track' && !t.is_local),
  };
}

/** URI de contexto para reproducir "Tus me gusta" como una playlist. */
export function savedTracksContextUri(userId: string): string {
  return `spotify:user:${userId}:collection`;
}

// Endpoints genéricos de biblioteca (desde 2026): aceptan URIs de cualquier
// tipo (canciones, álbumes, playlists...), hasta 40 por llamada.

/** Para cada URI, si está en tu biblioteca (mismo orden). */
export async function checkInLibrary(uris: string[], signal?: AbortSignal): Promise<boolean[]> {
  const res = await spotifyFetch<boolean[]>('/me/library/contains', {
    query: { uris: uris.join(',') },
    signal,
  });
  return Array.isArray(res) ? res : [];
}

export function saveToLibrary(uris: string[]): Promise<null> {
  return spotifyFetch<null>('/me/library', { method: 'PUT', query: { uris: uris.join(',') } });
}

export function removeFromLibrary(uris: string[]): Promise<null> {
  return spotifyFetch<null>('/me/library', { method: 'DELETE', query: { uris: uris.join(',') } });
}
