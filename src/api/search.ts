import { spotifyFetch } from './client';
import type { AlbumSummary, Artist, Paging, SimplifiedPlaylist, Track } from './types';

/** En modo desarrollo el máximo de /search es 10 resultados por tipo. */
const PAGE_SIZE = 10;

export type SearchType = 'track' | 'artist' | 'album' | 'playlist';

export interface SearchResults {
  tracks: Paging<Track>;
  artists: Paging<Artist>;
  albums: Paging<AlbumSummary>;
  playlists: Paging<SimplifiedPlaylist>;
}

/** Clave de la respuesta para cada tipo (track → tracks...). */
const RESULT_KEY = {
  track: 'tracks',
  artist: 'artists',
  album: 'albums',
  playlist: 'playlists',
} as const satisfies Record<SearchType, keyof SearchResults>;

type ResultOf<T extends SearchType> = SearchResults[(typeof RESULT_KEY)[T]]['items'][number];

const EMPTY_PAGE = { items: [], next: null, total: 0, limit: PAGE_SIZE, offset: 0 };

/** Spotify a veces devuelve elementos null (p. ej. playlists borradas). */
function clean<T>(page: Paging<T | null> | undefined): Paging<T> {
  if (!page) return EMPTY_PAGE;
  return { ...page, items: page.items.filter((item): item is T => item !== null) };
}

/** Primeros resultados de todos los tipos en una sola llamada (vista "Todo"). */
export async function searchAll(query: string, signal?: AbortSignal): Promise<SearchResults> {
  const res = await spotifyFetch<Partial<Record<keyof SearchResults, Paging<unknown>>>>('/search', {
    query: { q: query, type: 'track,artist,album,playlist', limit: PAGE_SIZE },
    signal,
  });
  return {
    tracks: clean(res.tracks as Paging<Track | null>),
    artists: clean(res.artists as Paging<Artist | null>),
    albums: clean(res.albums as Paging<AlbumSummary | null>),
    playlists: clean(res.playlists as Paging<SimplifiedPlaylist | null>),
  };
}

/** Una página de resultados de un solo tipo. `url` = el `next` de la página anterior. */
export async function searchPage<T extends SearchType>(
  query: string,
  type: T,
  url: string | null,
  signal?: AbortSignal,
): Promise<Paging<ResultOf<T>>> {
  const res = await spotifyFetch<Partial<Record<string, Paging<ResultOf<T> | null>>>>(url ?? '/search', {
    query: url ? undefined : { q: query, type, limit: PAGE_SIZE },
    signal,
  });
  return clean(res[RESULT_KEY[type]]);
}
