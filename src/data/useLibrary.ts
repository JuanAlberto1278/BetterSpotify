import { useCallback, useEffect, useMemo, useState } from 'react';
import { albumTracksAsTracks, getAlbum, getAlbumTracksPage } from '../api/albums';
import { getArtist, getArtistAlbumsPage, type DiscographyGroup } from '../api/artists';
import { getSavedAlbumsPage, getSavedTracksPage } from '../api/library';
import { getMyPlaylistsPage, getPlaylist, getPlaylistTracksPage } from '../api/playlists';
import { searchTracksPage } from '../api/search';
import type { Album, AlbumSummary, Artist, SimplifiedPlaylist, Track } from '../api/types';
import { primeSaved } from './libraryStore';
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
  const fetchPage = useCallback(async (url: string | null, signal: AbortSignal) => {
    const page = await getSavedTracksPage(url, signal);
    // Ya sabemos que están guardadas: evita consultar /me/library/contains.
    primeSaved(page.items.map((t) => t.uri));
    return page;
  }, []);
  return usePagedList(fetchPage);
}

/** Tus álbumes guardados. */
export function useSavedAlbums(): PagedList<AlbumSummary> {
  const fetchPage = useCallback(async (url: string | null, signal: AbortSignal) => {
    const page = await getSavedAlbumsPage(url, signal);
    primeSaved(page.items.map((a) => a.uri));
    return page;
  }, []);
  return usePagedList(fetchPage);
}

/** Álbum (cabecera) y sus canciones paginadas. */
export function useAlbum(albumId: string): { album: AsyncResult<Album>; tracks: PagedList<Track> } {
  const fetcher = useMemo(() => (signal: AbortSignal) => getAlbum(albumId, signal), [albumId]);
  const album = useAsync(fetcher);
  const data = album.data?.id === albumId ? album.data : null;

  // La primera página de canciones ya viene dentro del álbum: no se pide de nuevo.
  const fetchPage = useMemo(
    () =>
      data
        ? (url: string | null, signal: AbortSignal) =>
            url
              ? getAlbumTracksPage(data, url, signal)
              : Promise.resolve(albumTracksAsTracks(data, data.tracks))
        : null,
    [data],
  );
  return { album, tracks: usePagedList(fetchPage) };
}

/** Datos de un artista. */
export function useArtist(artistId: string): AsyncResult<Artist> {
  const fetcher = useMemo(() => (signal: AbortSignal) => getArtist(artistId, signal), [artistId]);
  return useAsync(fetcher);
}

/** Discografía de un artista filtrada por grupos (álbumes, sencillos...). */
export function useArtistAlbums(artistId: string, groups: DiscographyGroup[]): PagedList<AlbumSummary> {
  const key = groups.join(',');
  const fetchPage = useMemo(
    () => (url: string | null, signal: AbortSignal) =>
      getArtistAlbumsPage(artistId, key.split(',') as DiscographyGroup[], url, signal),
    [artistId, key],
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
