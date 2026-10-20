import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSavedTracksPage } from '../api/library';
import { getMyPlaylistsPage, getPlaylist, getPlaylistTracksPage } from '../api/playlists';
import { searchTracksPage } from '../api/search';
import type { SimplifiedPlaylist, Track } from '../api/types';
import { useAsync, type AsyncResult } from './useAsync';
import { usePagedList, type PagedList } from './usePagedList';

/** Playlists del usuario (propias y seguidas). */
export function usePlaylists(): PagedList<SimplifiedPlaylist> {
  const fetchPage = useCallback(
    (url: string | null, signal: AbortSignal) => getMyPlaylistsPage(url, signal),
    [],
  );
  return usePagedList(fetchPage);
}

/** Datos de cabecera de una playlist. */
export function usePlaylist(playlistId: string): AsyncResult<SimplifiedPlaylist> {
  const fetcher = useMemo(
    () => (signal: AbortSignal) => getPlaylist(playlistId, signal),
    [playlistId],
  );
  return useAsync(fetcher);
}

/** Canciones reproducibles de una playlist. */
export function usePlaylistTracks(playlistId: string | null): PagedList<Track> {
  const fetchPage = useMemo(
    () =>
      playlistId
        ? (url: string | null, signal: AbortSignal) => getPlaylistTracksPage(playlistId, url, signal)
        : null,
    [playlistId],
  );
  return usePagedList(fetchPage);
}

/** Canciones que te gustan. */
export function useSavedTracks(): PagedList<Track> {
  const fetchPage = useCallback(
    (url: string | null, signal: AbortSignal) => getSavedTracksPage(url, signal),
    [],
  );
  return usePagedList(fetchPage);
}

const SEARCH_DEBOUNCE_MS = 400;

/** Búsqueda de canciones con debounce. Una consulta vacía no pide nada. */
export function useTrackSearch(query: string): PagedList<Track> & { debouncedQuery: string } {
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const fetchPage = useMemo(
    () =>
      debouncedQuery
        ? (url: string | null, signal: AbortSignal) => searchTracksPage(debouncedQuery, url, signal)
        : null,
    [debouncedQuery],
  );
  return { ...usePagedList(fetchPage), debouncedQuery };
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
