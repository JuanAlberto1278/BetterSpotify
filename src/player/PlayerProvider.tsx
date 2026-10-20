import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getValidAccessToken } from '../auth/auth';
import { describeError, SpotifyApiError } from '../api/errors';
import { startPlayback, transferPlayback } from '../api/player';
import { loadSpotifySdk } from './loadSdk';

const PLAYER_NAME = 'BetterSpotify';
const VOLUME_STORAGE_KEY = 'betterspotify.volume';

// ── Tipos públicos (lo que consume la UI) ───────────────────────────────────

export type PlayerStatus = 'connecting' | 'ready' | 'error';

export interface PlayerTrack {
  uri: string;
  name: string;
  artists: { name: string; uri: string }[];
  album: { name: string; uri: string; imageUrl: string | null };
  durationMs: number;
}

/** Foto de la posición en un instante; usePlaybackPosition() la interpola. */
export interface PositionSnapshot {
  positionMs: number;
  durationMs: number;
  paused: boolean;
  /** Date.now() del momento en que se tomó la foto. */
  takenAt: number;
}

export interface PlayerContextValue {
  status: PlayerStatus;
  deviceId: string | null;
  /** true si este navegador es el dispositivo activo de Spotify. */
  isActive: boolean;
  paused: boolean;
  track: PlayerTrack | null;
  contextUri: string | null;
  snapshot: PositionSnapshot;
  volume: number;
  canSkipPrev: boolean;
  canSkipNext: boolean;
  canSeek: boolean;
  error: string | null;

  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (positionMs: number) => void;
  setVolume: (volume: number) => void;
  /** Trae la reproducción a este navegador y la reanuda. */
  transferHere: () => void;
  /** Reproduce una playlist/álbum, opcionalmente empezando por `trackUri`. */
  playContext: (contextUri: string, trackUri?: string) => void;
  /** Reproduce una lista suelta de canciones empezando por `startIndex`. */
  playTracks: (uris: string[], startIndex?: number) => void;
  clearError: () => void;
}

export const PlayerContext = createContext<PlayerContextValue | null>(null);

// ── Provider ────────────────────────────────────────────────────────────────

const EMPTY_SNAPSHOT: PositionSnapshot = { positionMs: 0, durationMs: 0, paused: true, takenAt: 0 };

export function PlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<Spotify.Player | null>(null);
  const transferredRef = useRef(false);

  const [status, setStatus] = useState<PlayerStatus>('connecting');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [state, setState] = useState<Spotify.PlaybackState | null>(null);
  const [snapshot, setSnapshot] = useState<PositionSnapshot>(EMPTY_SNAPSHOT);
  const [volume, setVolumeState] = useState(loadVolume);
  const [error, setError] = useState<string | null>(null);

  // Inicializa el SDK una vez por sesión.
  useEffect(() => {
    let cancelled = false;
    let player: Spotify.Player | null = null;

    const fail = (message: string) => {
      if (cancelled) return;
      setStatus('error');
      setError(message);
    };

    loadSpotifySdk()
      .then(async (Sdk) => {
        if (cancelled) return;

        player = new Sdk.Player({
          name: PLAYER_NAME,
          volume: loadVolume(),
          enableMediaSession: true,
          getOAuthToken: (callback) => {
            getValidAccessToken()
              .then(callback)
              .catch((err) => fail(describeError(err)));
          },
        });
        playerRef.current = player;

        player.addListener('ready', ({ device_id }) => {
          if (cancelled) return;
          setDeviceId(device_id);
          setStatus('ready');
          if (!transferredRef.current) {
            transferredRef.current = true;
            transferWithRetry(device_id).catch((err) => setError(describeError(err)));
          }
        });
        player.addListener('not_ready', () => {
          if (!cancelled) setStatus('connecting');
        });
        player.addListener('player_state_changed', (s) => {
          if (cancelled) return;
          setState(s);
          setSnapshot(
            s
              ? { positionMs: s.position, durationMs: s.duration, paused: s.paused, takenAt: Date.now() }
              : EMPTY_SNAPSHOT,
          );
        });
        player.addListener('initialization_error', (e) =>
          fail(`Este navegador no puede reproducir: ${e.message}`),
        );
        // No es fatal: el SDK vuelve a pedir el token con getOAuthToken.
        player.addListener('authentication_error', (e) => {
          if (!cancelled) setError(`Error de autenticación del reproductor: ${e.message}`);
        });
        player.addListener('account_error', () =>
          fail('Se necesita Spotify Premium para reproducir en el navegador.'),
        );
        player.addListener('playback_error', (e) => {
          if (!cancelled) setError(`Error de reproducción: ${e.message}`);
        });
        player.addListener('autoplay_failed', () => {
          if (!cancelled) setError('El navegador bloqueó la reproducción automática. Tocá play.');
        });

        const connected = await player.connect();
        if (!connected) fail('No se pudo conectar el reproductor.');
      })
      .catch((err) => fail(describeError(err)));

    return () => {
      cancelled = true;
      player?.disconnect();
      playerRef.current = null;
    };
  }, []);

  /** Ejecuta una acción mostrando el error en la UI si falla. */
  const run = useCallback((action: (player: Spotify.Player) => Promise<unknown>) => {
    const player = playerRef.current;
    if (!player) {
      setError('El reproductor todavía no está listo.');
      return;
    }
    // activateElement() tiene que ejecutarse de forma síncrona dentro del click
    // para que el navegador permita reproducir audio.
    void player.activateElement();
    action(player).catch((err) => setError(describeError(err)));
  }, []);

  const isActive = state !== null;

  const togglePlay = useCallback(() => {
    run(async (player) => {
      if (!isActive && deviceId) await transferPlayback(deviceId, true);
      else await player.togglePlay();
    });
  }, [run, isActive, deviceId]);

  const next = useCallback(() => run((p) => p.nextTrack()), [run]);
  const previous = useCallback(() => run((p) => p.previousTrack()), [run]);

  const seek = useCallback(
    (positionMs: number) => {
      // Actualización optimista: la barra no "salta" mientras llega el nuevo estado.
      setSnapshot((s) => ({ ...s, positionMs, takenAt: Date.now() }));
      run((p) => p.seek(positionMs));
    },
    [run],
  );

  const setVolume = useCallback((value: number) => {
    const v = Math.min(1, Math.max(0, value));
    setVolumeState(v);
    saveVolume(v);
    playerRef.current?.setVolume(v).catch(() => {});
  }, []);

  const transferHere = useCallback(() => {
    run(async () => {
      if (!deviceId) throw new Error('El reproductor todavía no está listo.');
      await transferPlayback(deviceId, true);
    });
  }, [run, deviceId]);

  const playContext = useCallback(
    (contextUri: string, trackUri?: string) => {
      run(async () => {
        if (!deviceId) throw new Error('El reproductor todavía no está listo.');
        await startPlayback({
          deviceId,
          contextUri,
          offset: trackUri ? { uri: trackUri } : undefined,
        });
      });
    },
    [run, deviceId],
  );

  const playTracks = useCallback(
    (uris: string[], startIndex = 0) => {
      run(async () => {
        if (!deviceId) throw new Error('El reproductor todavía no está listo.');
        await startPlayback({ deviceId, uris, offset: { position: startIndex } });
      });
    },
    [run, deviceId],
  );

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<PlayerContextValue>(() => {
    const current = state?.track_window.current_track ?? null;
    const disallows = state?.disallows ?? {};
    return {
      status,
      deviceId,
      isActive,
      paused: state?.paused ?? true,
      track: current ? toPlayerTrack(current) : null,
      contextUri: state?.context.uri ?? null,
      snapshot,
      volume,
      canSkipPrev: isActive && !disallows.skipping_prev,
      canSkipNext: isActive && !disallows.skipping_next,
      canSeek: isActive && !disallows.seeking,
      error,
      togglePlay,
      next,
      previous,
      seek,
      setVolume,
      transferHere,
      playContext,
      playTracks,
      clearError,
    };
  }, [
    status, deviceId, isActive, state, snapshot, volume, error,
    togglePlay, next, previous, seek, setVolume, transferHere, playContext, playTracks, clearError,
  ]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Justo después de `ready`, la Web API a veces todavía no conoce el dispositivo
 * y responde 404. Se reintenta un par de veces.
 */
async function transferWithRetry(deviceId: string, attempts = 3): Promise<void> {
  for (let i = 1; ; i++) {
    try {
      await transferPlayback(deviceId, false);
      return;
    } catch (err) {
      if (!(err instanceof SpotifyApiError && err.status === 404) || i >= attempts) throw err;
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

function toPlayerTrack(t: Spotify.Track): PlayerTrack {
  const largest = [...t.album.images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0];
  return {
    uri: t.uri,
    name: t.name,
    artists: t.artists.map(({ name, uri }) => ({ name, uri })),
    album: { name: t.album.name, uri: t.album.uri, imageUrl: largest?.url ?? null },
    durationMs: t.duration_ms,
  };
}

function loadVolume(): number {
  try {
    const v = Number.parseFloat(localStorage.getItem(VOLUME_STORAGE_KEY) ?? '');
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.5;
  } catch {
    return 0.5;
  }
}

function saveVolume(v: number) {
  try {
    localStorage.setItem(VOLUME_STORAGE_KEY, String(v));
  } catch {
    // Sin storage: el volumen simplemente no se recuerda.
  }
}
