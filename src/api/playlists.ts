import { spotifyFetch } from './client';
import type { Paging, PlaylistItem, SimplifiedPlaylist, Track } from './types';

const PAGE_SIZE = 50;

/** Una página de las playlists del usuario. `url` = el `next` de la página anterior. */
export function getMyPlaylistsPage(
  url: string | null,
  signal?: AbortSignal,
): Promise<Paging<SimplifiedPlaylist>> {
  return spotifyFetch(url ?? '/me/playlists', {
    query: url ? undefined : { limit: PAGE_SIZE },
    signal,
  });
}

/**
 * Una página de canciones de una playlist (endpoint /items, campo `item`).
 * Se descartan episodios, archivos locales y elementos borrados, que no se pueden
 * reproducir desde acá.
 */
export async function getPlaylistTracksPage(
  playlistId: string,
  url: string | null,
  signal?: AbortSignal,
): Promise<Paging<Track>> {
  const page = await spotifyFetch<Paging<PlaylistItem>>(
    url ?? `/playlists/${encodeURIComponent(playlistId)}/items`,
    { query: url ? undefined : { limit: PAGE_SIZE }, signal },
  );
  return {
    ...page,
    items: page.items
      .map((entry) => entry.item)
      .filter((item): item is Track => item?.type === 'track' && !item.is_local),
  };
}

export function getPlaylistTotal(playlist: SimplifiedPlaylist): number | null {
  return playlist.items?.total ?? playlist.tracks?.total ?? null;
}
