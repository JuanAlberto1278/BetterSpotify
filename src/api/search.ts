import { spotifyFetch } from './client';
import type { Paging, Track } from './types';

/** En modo desarrollo el límite máximo por página de /search es bajo; 10 es seguro. */
const PAGE_SIZE = 10;

/** Una página de resultados de canciones. `url` = el `next` de la página anterior. */
export async function searchTracksPage(
  query: string,
  url: string | null,
  signal?: AbortSignal,
): Promise<Paging<Track>> {
  const res = await spotifyFetch<{ tracks: Paging<Track> }>(url ?? '/search', {
    query: url ? undefined : { q: query, type: 'track', limit: PAGE_SIZE },
    signal,
  });
  return res.tracks;
}
