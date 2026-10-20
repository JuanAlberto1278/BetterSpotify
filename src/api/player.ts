import { spotifyFetch } from './client';
import type { Device, Queue } from './types';

/** Transfiere la reproducción a `deviceId`. Con play=false queda en pausa. */
export function transferPlayback(deviceId: string, play = false): Promise<null> {
  return spotifyFetch<null>('/me/player', {
    method: 'PUT',
    body: { device_ids: [deviceId], play },
  });
}

export interface StartPlaybackOptions {
  deviceId?: string;
  /** URI de playlist, álbum o artista. Excluyente con `uris`. */
  contextUri?: string;
  /** Lista de URIs de canciones. Excluyente con `contextUri`. */
  uris?: string[];
  offset?: { uri: string } | { position: number };
  positionMs?: number;
}

export function startPlayback(options: StartPlaybackOptions): Promise<null> {
  return spotifyFetch<null>('/me/player/play', {
    method: 'PUT',
    query: { device_id: options.deviceId },
    body: {
      context_uri: options.contextUri,
      uris: options.uris,
      offset: options.offset,
      position_ms: options.positionMs,
    },
  });
}

// Sin device_id: se aplican al dispositivo activo.

export function setShuffle(state: boolean): Promise<null> {
  return spotifyFetch<null>('/me/player/shuffle', { method: 'PUT', query: { state } });
}

export type RepeatMode = 'off' | 'context' | 'track';

export function setRepeat(state: RepeatMode): Promise<null> {
  return spotifyFetch<null>('/me/player/repeat', { method: 'PUT', query: { state } });
}

export function addToQueue(uri: string): Promise<null> {
  return spotifyFetch<null>('/me/player/queue', { method: 'POST', query: { uri } });
}

export async function getQueue(signal?: AbortSignal): Promise<Queue> {
  // 204 si no hay nada reproduciéndose.
  const res = await spotifyFetch<Queue | null>('/me/player/queue', { signal });
  return res ?? { currently_playing: null, queue: [] };
}

export async function getDevices(signal?: AbortSignal): Promise<Device[]> {
  const res = await spotifyFetch<{ devices: Device[] }>('/me/player/devices', { signal });
  return res?.devices ?? [];
}
