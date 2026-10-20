import { spotifyFetch } from './client';
import type { Paging, SavedTrack, Track } from './types';

const PAGE_SIZE = 50;

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
