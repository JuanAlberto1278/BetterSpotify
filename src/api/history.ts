import { spotifyFetch } from './client';
import type { PlayHistoryItem, Track } from './types';

/** Últimas canciones escuchadas (sin repetir), de la más reciente a la más vieja. */
export async function getRecentlyPlayed(signal?: AbortSignal): Promise<Track[]> {
  const res = await spotifyFetch<{ items: PlayHistoryItem[] }>('/me/player/recently-played', {
    query: { limit: 50 },
    signal,
  });
  const seen = new Set<string>();
  const tracks: Track[] = [];
  for (const { track } of res?.items ?? []) {
    if (!track || seen.has(track.uri)) continue;
    seen.add(track.uri);
    tracks.push(track);
  }
  return tracks;
}
