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
    query: { fields: 'id,name,uri,description,images,owner(id,display_name),collaborative,public,snapshot_id' },
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

// ── Edición (requiere playlist-modify-public / playlist-modify-private) ─────

/** Máximo de canciones por llamada para agregar o quitar. */
const MODIFY_BATCH_SIZE = 100;

export interface PlaylistDetails {
  name: string;
  description: string;
  public: boolean;
}

export function createPlaylist(details: PlaylistDetails): Promise<SimplifiedPlaylist> {
  return spotifyFetch('/me/playlists', { method: 'POST', body: details });
}

export async function updatePlaylist(playlistId: string, details: PlaylistDetails): Promise<void> {
  await spotifyFetch(`/playlists/${encodeURIComponent(playlistId)}`, { method: 'PUT', body: details });
}

export async function addToPlaylist(playlistId: string, uris: string[]): Promise<void> {
  for (let i = 0; i < uris.length; i += MODIFY_BATCH_SIZE) {
    await spotifyFetch(`/playlists/${encodeURIComponent(playlistId)}/items`, {
      method: 'POST',
      body: { uris: uris.slice(i, i + MODIFY_BATCH_SIZE) },
    });
  }
}

/** Quita las canciones (todas sus apariciones en la playlist). */
export async function removeFromPlaylist(playlistId: string, uris: string[]): Promise<void> {
  for (let i = 0; i < uris.length; i += MODIFY_BATCH_SIZE) {
    await spotifyFetch(`/playlists/${encodeURIComponent(playlistId)}/items`, {
      method: 'DELETE',
      body: { items: uris.slice(i, i + MODIFY_BATCH_SIZE).map((uri) => ({ uri })) },
    });
  }
}

/** true si el usuario puede editar la playlist (es suya o es colaborativa). */
export function canEditPlaylist(playlist: SimplifiedPlaylist, userId: string | undefined): boolean {
  return Boolean(userId) && (playlist.owner.id === userId || playlist.collaborative);
}
