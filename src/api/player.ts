import { spotifyFetch } from './client';

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
