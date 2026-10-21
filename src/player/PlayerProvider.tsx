import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getValidAccessToken } from '../auth/auth';
import { describeError, SpotifyApiError } from '../api/errors';
import {
  addToQueue as apiAddToQueue,
  setRepeat,
  setShuffle,
  startPlayback,
  transferPlayback,
  type RepeatMode,
} from '../api/player';
import { getSettings } from '../settings/settings';
import { loadSpotifySdk } from './loadSdk';
import {
  PlayerContext,
  type PlayContextOptions,
  type PlayerContextValue,
  type PlayerStatus,
  type PlayerTrack,
  type PositionSnapshot,
  type Toast,
} from './playerContext';

const PLAYER_NAME = 'BetterSpotify';
const VOLUME_STORAGE_KEY = 'betterspotify.volume';
const REPEAT_MODES: RepeatMode[] = ['off', 'context', 'track'];
/** Máximo de URIs que se mandan en una reproducción de lista suelta. */
const MAX_URIS = 100;

// ── Provider ────────────────────────────────────────────────────────────────

const EMPTY_SNAPSHOT: PositionSnapshot = { positionMs: 0, durationMs: 0, paused: true, takenAt: 0 };
const TOAST_MS = { info: 2500, error: 8000 };

export function PlayerProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<Spotify.Player | null>(null);
  const transferredRef = useRef(false);
  const snapshotRef = useRef(EMPTY_SNAPSHOT);
  const volumeBeforeMuteRef = useRef(0.5);

  const [status, setStatus] = useState<PlayerStatus>('connecting');
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [state, setState] = useState<Spotify.PlaybackState | null>(null);
  const [snapshot, setSnapshotState] = useState<PositionSnapshot>(EMPTY_SNAPSHOT);
  const [volume, setVolumeState] = useState(loadVolume);
  const [queueVersion, setQueueVersion] = useState(0);
  const [queuedByUser, setQueuedByUser] = useState<string[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const lastTrackUriRef = useRef<string | null>(null);

  const setSnapshot = useCallback((update: (prev: PositionSnapshot) => PositionSnapshot) => {
    snapshotRef.current = update(snapshotRef.current);
    setSnapshotState(snapshotRef.current);
  }, []);

  const notify = useCallback((kind: Toast['kind'], text: string) => {
    setToast({ id: Date.now(), kind, text });
  }, []);

  // Los avisos se cierran solos.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast((t) => (t?.id === toast.id ? null : t)), TOAST_MS[toast.kind]);
    return () => clearTimeout(id);
  }, [toast]);

  // Inicializa el SDK una vez por sesión.
  useEffect(() => {
    let cancelled = false;
    let player: Spotify.Player | null = null;

    const fail = (message: string) => {
      if (cancelled) return;
      setStatus('error');
      notify('error', message);
    };
    const warn = (message: string) => {
      if (!cancelled) notify('error', message);
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
          // Solo la primera vez y si el usuario lo tiene activado en Configuración.
          if (!transferredRef.current) {
            transferredRef.current = true;
            if (getSettings().autoTransferOnStart) {
              transferWithRetry(device_id).catch((err) => warn(describeError(err)));
            }
          }
        });
        player.addListener('not_ready', () => {
          if (!cancelled) setStatus('connecting');
        });
        player.addListener('player_state_changed', (s) => {
          if (cancelled) return;
          setState(s);

          // Cuando empieza a sonar una canción agregada a mano, deja de estar "en cola".
          const uri = s?.track_window.current_track?.uri ?? null;
          if (uri && uri !== lastTrackUriRef.current) {
            setQueuedByUser((list) => removeFirst(list, uri));
          }
          lastTrackUriRef.current = uri;

          setSnapshot(() =>
            s
              ? { positionMs: s.position, durationMs: s.duration, paused: s.paused, takenAt: Date.now() }
              : EMPTY_SNAPSHOT,
          );
        });
        player.addListener('initialization_error', (e) =>
          fail(`Este navegador no puede reproducir: ${e.message}`),
        );
        // No es fatal: el SDK vuelve a pedir el token con getOAuthToken.
        player.addListener('authentication_error', (e) =>
          warn(`Error de autenticación del reproductor: ${e.message}`),
        );
        player.addListener('account_error', () =>
          fail('Se necesita Spotify Premium para reproducir en el navegador.'),
        );
        player.addListener('playback_error', (e) => warn(`Error de reproducción: ${e.message}`));
        player.addListener('autoplay_failed', () =>
          warn('El navegador bloqueó la reproducción automática. Tocá play.'),
        );

        const connected = await player.connect();
        if (!connected) fail('No se pudo conectar el reproductor.');
      })
      .catch((err) => fail(describeError(err)));

    return () => {
      cancelled = true;
      player?.disconnect();
      playerRef.current = null;
    };
  }, [notify, setSnapshot]);

  /**
   * Ejecuta una acción mostrando el error en la UI si falla. Llama a
   * activateElement() de forma síncrona: tiene que ocurrir dentro del click para
   * que el navegador permita reproducir audio.
   */
  const run = useCallback(
    (action: () => Promise<unknown>, successText?: string) => {
      void playerRef.current?.activateElement();
      action()
        .then(() => successText && notify('info', successText))
        .catch((err) => notify('error', describeError(err)));
    },
    [notify],
  );

  const requirePlayer = (): Spotify.Player => {
    if (!playerRef.current) throw new Error('El reproductor todavía no está listo.');
    return playerRef.current;
  };
  const requireDevice = useCallback((): string => {
    if (!deviceId) throw new Error('El reproductor todavía no está listo.');
    return deviceId;
  }, [deviceId]);

  const isActive = state !== null;

  const togglePlay = useCallback(() => {
    run(async () => {
      if (!isActive) await transferPlayback(requireDevice(), true);
      else await requirePlayer().togglePlay();
    });
  }, [run, isActive, requireDevice]);

  const next = useCallback(() => run(() => requirePlayer().nextTrack()), [run]);
  const previous = useCallback(() => run(() => requirePlayer().previousTrack()), [run]);

  const seek = useCallback(
    (positionMs: number) => {
      // Actualización optimista: la barra no "salta" mientras llega el nuevo estado.
      setSnapshot((s) => ({ ...s, positionMs, takenAt: Date.now() }));
      run(() => requirePlayer().seek(positionMs));
    },
    [run, setSnapshot],
  );

  const getPositionMs = useCallback(() => {
    const s = snapshotRef.current;
    const elapsed = s.paused ? 0 : Date.now() - s.takenAt;
    return Math.min(s.positionMs + elapsed, s.durationMs);
  }, []);

  const setVolume = useCallback((value: number) => {
    const v = Math.min(1, Math.max(0, value));
    setVolumeState(v);
    saveVolume(v);
    playerRef.current?.setVolume(v).catch(() => {});
  }, []);

  const toggleMute = useCallback(() => {
    if (volume > 0) {
      volumeBeforeMuteRef.current = volume;
      setVolume(0);
    } else {
      setVolume(volumeBeforeMuteRef.current || 0.5);
    }
  }, [volume, setVolume]);

  const shuffle = state?.shuffle ?? false;
  const repeatMode = REPEAT_MODES[state?.repeat_mode ?? 0];

  const toggleShuffle = useCallback(() => run(() => setShuffle(!shuffle)), [run, shuffle]);

  const cycleRepeat = useCallback(() => {
    const nextMode = REPEAT_MODES[(REPEAT_MODES.indexOf(repeatMode) + 1) % REPEAT_MODES.length];
    run(() => setRepeat(nextMode));
  }, [run, repeatMode]);

  const transferTo = useCallback(
    (targetId: string) => run(() => transferPlayback(targetId, true)),
    [run],
  );

  const transferHere = useCallback(
    () => run(() => transferPlayback(requireDevice(), true)),
    [run, requireDevice],
  );

  const playTracks = useCallback(
    (uris: string[], startIndex = 0) => {
      run(() => startUris(requireDevice(), uris, startIndex));
    },
    [run, requireDevice],
  );

  const playContext = useCallback(
    (contextUri: string, { trackUri, fallbackUris }: PlayContextOptions = {}) => {
      run(async () => {
        const id = requireDevice();
        try {
          await startPlayback({
            deviceId: id,
            contextUri,
            offset: trackUri ? { uri: trackUri } : undefined,
          });
        } catch (err) {
          const rejected =
            err instanceof SpotifyApiError && err.status >= 400 && err.status < 500 && err.status !== 429;
          if (!fallbackUris?.length || !rejected) throw err;
          await startUris(id, fallbackUris, trackUri ? Math.max(0, fallbackUris.indexOf(trackUri)) : 0);
        }
      });
    },
    [run, requireDevice],
  );

  const addToQueue = useCallback(
    (uri: string) => {
      run(async () => {
        await apiAddToQueue(uri);
        setQueuedByUser((list) => [...list, uri]);
        setQueueVersion((v) => v + 1);
      }, 'Agregada a la cola');
    },
    [run],
  );

  const dismissToast = useCallback(() => setToast(null), []);

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
      contextName: readContextName(state),
      snapshot,
      volume,
      shuffle,
      repeatMode,
      canSkipPrev: isActive && !disallows.skipping_prev,
      canSkipNext: isActive && !disallows.skipping_next,
      canSeek: isActive && !disallows.seeking,
      canShuffle: isActive && !disallows.toggling_shuffle,
      canRepeat: isActive && !(disallows.toggling_repeat_context && disallows.toggling_repeat_track),
      queueVersion,
      queuedByUser,
      toast,
      togglePlay,
      next,
      previous,
      seek,
      getPositionMs,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      transferHere,
      transferTo,
      playContext,
      playTracks,
      addToQueue,
      notify,
      dismissToast,
    };
  }, [
    status, deviceId, isActive, state, snapshot, volume, shuffle, repeatMode, queueVersion,
    queuedByUser, toast,
    togglePlay, next, previous, seek, getPositionMs, setVolume, toggleMute, toggleShuffle,
    cycleRepeat, transferHere, transferTo, playContext, playTracks, addToQueue, notify, dismissToast,
  ]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function removeFirst(list: string[], value: string): string[] {
  const index = list.indexOf(value);
  return index === -1 ? list : [...list.slice(0, index), ...list.slice(index + 1)];
}

function readContextName(state: Spotify.PlaybackState | null): string | null {
  const name = state?.context.metadata?.name;
  return typeof name === 'string' && name ? name : null;
}

/** Reproduce URIs sueltas, recortando a una ventana de MAX_URIS alrededor del inicio. */
function startUris(deviceId: string, uris: string[], startIndex: number): Promise<null> {
  const from = Math.max(0, Math.min(startIndex, uris.length - MAX_URIS));
  return startPlayback({
    deviceId,
    uris: uris.slice(from, from + MAX_URIS),
    offset: { position: startIndex - from },
  });
}

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
