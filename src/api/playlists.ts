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

/** Datos de cabecera de una playlist (sin sus canciones). */
export function getPlaylist(playlistId: string, signal?: AbortSignal): Promise<SimplifiedPlaylist> {
  return spotifyFetch(`/playlists/${encodeURIComponent(playlistId)}`, {
    query: { fields: 'id,name,uri,description,images,owner(id,display_name),collaborative' },
    signal,
  });
}

/**
 * Una página de canciones de una playlist (endpoint /items, campo `item`).
 * Se descartan episodios, archivos locales y elementos borrados, que no se pueden
 * reproducir desde acá.
 *
 * En modo desarrollo Spotify solo devuelve el contenido de playlists propias o
 * colaborativas.
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
