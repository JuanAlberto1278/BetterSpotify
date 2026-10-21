import { useEffect, useMemo, useState } from 'react';
import { searchAll, searchPage, type SearchResults, type SearchType } from '../api/search';
import type { AlbumSummary, Artist, Paging, SimplifiedPlaylist, Track } from '../api/types';
import { useAsync, type AsyncResult } from './useAsync';
import { usePagedList, type PagedList } from './usePagedList';

const SEARCH_DEBOUNCE_MS = 400;

/** Valor que se actualiza recién cuando deja de cambiar por `delayMs`. */
export function useDebouncedValue<T>(value: T, delayMs = SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

/** Primeros resultados de todos los tipos. Una consulta vacía no pide nada. */
export function useSearchAll(query: string): AsyncResult<SearchResults> {
  const fetcher = useMemo(
    () => (query ? (signal: AbortSignal) => searchAll(query, signal) : null),
    [query],
  );
  return useAsync(fetcher);
}

interface ResultTypes {
  track: Track;
  artist: Artist;
  album: AlbumSummary;
  playlist: SimplifiedPlaylist;
}

/** Resultados paginados de un solo tipo (scroll infinito). */
export function useSearchList<T extends SearchType>(query: string, type: T): PagedList<ResultTypes[T]> {
  const fetchPage = useMemo(
    () =>
      query
        ? (url: string | null, signal: AbortSignal) =>
            searchPage(query, type, url, signal) as Promise<Paging<ResultTypes[T]>>
        : null,
    [query, type],
  );
  return usePagedList(fetchPage);
}
