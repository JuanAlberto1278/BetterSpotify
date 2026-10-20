import { useMemo } from 'react';
import { getDevices, getQueue } from '../api/player';
import type { Device, Queue } from '../api/types';
import { usePlayer } from '../player/usePlayer';
import { useAsync, type AsyncResult } from './useAsync';

/** Spotify tarda un instante en reflejar el cambio de canción en /queue. */
const QUEUE_SETTLE_MS = 400;

/**
 * Cola de reproducción. Solo pide datos con enabled=true y se refresca sola
 * al cambiar de canción o al agregar algo a la cola.
 */
export function useQueue(enabled: boolean): AsyncResult<Queue> {
  const { track, queueVersion } = usePlayer();
  const trackUri = track?.uri;

  const fetcher = useMemo(() => {
    if (!enabled) return null;
    return async (signal: AbortSignal) => {
      await new Promise((r) => setTimeout(r, QUEUE_SETTLE_MS));
      signal.throwIfAborted();
      return getQueue(signal);
    };
    // trackUri y queueVersion son disparadores de recarga.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, trackUri, queueVersion]);

  return useAsync(fetcher);
}

/** Dispositivos de Spotify Connect disponibles. Solo pide datos con enabled=true. */
export function useDevices(enabled: boolean): AsyncResult<Device[]> {
  const fetcher = useMemo(() => (enabled ? (signal: AbortSignal) => getDevices(signal) : null), [enabled]);
  return useAsync(fetcher);
}
