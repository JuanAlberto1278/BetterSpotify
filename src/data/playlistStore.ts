import { useSyncExternalStore } from 'react';
import {
  addToPlaylist,
  createPlaylist,
  removeFromPlaylist,
  updatePlaylist,
  type PlaylistDetails,
} from '../api/playlists';
import type { SimplifiedPlaylist } from '../api/types';

/**
 * Acciones que modifican playlists. Después de cada cambio se incrementa una
 * "versión" para que las vistas que muestran esos datos se recarguen solas.
 */

const playlistVersions = new Map<string, number>();
let listVersion = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function bumpPlaylist(playlistId: string) {
  playlistVersions.set(playlistId, (playlistVersions.get(playlistId) ?? 0) + 1);
  emit();
}

function bumpList() {
  listVersion++;
  emit();
}

/** Versión del contenido/datos de una playlist (cambia al editarla). */
export function usePlaylistVersion(playlistId: string | null): number {
  return useSyncExternalStore(subscribe, () => (playlistId ? (playlistVersions.get(playlistId) ?? 0) : 0));
}

/** Versión de la lista de playlists (cambia al crear o renombrar). */
export function usePlaylistListVersion(): number {
  return useSyncExternalStore(subscribe, () => listVersion);
}

// ── Acciones ────────────────────────────────────────────────────────────────

export async function createPlaylistWith(details: PlaylistDetails, uris: string[] = []): Promise<SimplifiedPlaylist> {
  const playlist = await createPlaylist(details);
  if (uris.length > 0) await addToPlaylist(playlist.id, uris);
  bumpList();
  return playlist;
}

export async function editPlaylistDetails(playlistId: string, details: PlaylistDetails): Promise<void> {
  await updatePlaylist(playlistId, details);
  bumpPlaylist(playlistId);
  bumpList();
}

export async function addTracksToPlaylist(playlistId: string, uris: string[]): Promise<void> {
  await addToPlaylist(playlistId, uris);
  bumpPlaylist(playlistId);
}

/**
 * Quita canciones. No recarga la lista (perdería el scroll): la vista oculta
 * localmente lo que se quitó.
 */
export async function removeTracksFromPlaylist(playlistId: string, uris: string[]): Promise<void> {
  await removeFromPlaylist(playlistId, uris);
}
