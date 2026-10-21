import { useMemo } from 'react';
import { getDevices, getQueue } from '../api/player';
import type { Device, Episode, Queue, Track } from '../api/types';
import { usePlayer } from '../player/usePlayer';
import { useAsync, type AsyncResult } from './useAsync';

/** Spotify tarda un instante en reflejar el cambio de canción en /queue. */
const QUEUE_SETTLE_MS = 400;

export type QueueEntry = Track | Episode;

export interface QueueSections {
  current: QueueEntry | null;
  /** Lo que agregaste con "agregar a la cola" desde esta app. */
  userQueued: QueueEntry[];
  /** Lo que sigue del contexto (playlist, álbum, búsqueda...). */
  upcoming: QueueEntry[];
  /** Nombre del contexto, si se conoce. */
  contextName: string | null;
}

/**
 * Cola de reproducción separada en secciones. Solo pide datos con enabled=true
 * y se refresca sola al cambiar de canción o al agregar algo a la cola.
 */
export function useQueue(enabled: boolean): Omit<AsyncResult<Queue>, 'data'> & {
  data: QueueSections | null;
} {
  const { track, queueVersion, queuedByUser, contextName } = usePlayer();
  const trackUri = track?.uri;

  const fetcher = useMemo(() => {
    // trackUri y queueVersion solo se usan como disparadores de recarga.
    void trackUri;
    void queueVersion;
    if (!enabled) return null;
    return async (signal: AbortSignal) => {
      await new Promise((r) => setTimeout(r, QUEUE_SETTLE_MS));
      signal.throwIfAborted();
      return getQueue(signal);
    };
  }, [enabled, trackUri, queueVersion]);

  const result = useAsync(fetcher);

  const data = useMemo(
    () => (result.data ? splitQueue(result.data, queuedByUser, contextName) : null),
    [result.data, queuedByUser, contextName],
  );

  return { ...result, data };
}

/**
 * Spotify pone lo agregado a mano al principio de la cola. Se toma el bloque
 * inicial cuyas URIs coinciden con las que agregaste (respetando repeticiones).
 */
function splitQueue(queue: Queue, queuedByUser: string[], contextName: string | null): QueueSections {
  const pending = new Map<string, number>();
  for (const uri of queuedByUser) pending.set(uri, (pending.get(uri) ?? 0) + 1);

  let split = 0;
  for (const entry of queue.queue) {
    const count = pending.get(entry.uri) ?? 0;
    if (count === 0) break;
    pending.set(entry.uri, count - 1);
    split++;
  }

  return {
    current: queue.currently_playing,
    userQueued: queue.queue.slice(0, split),
    upcoming: queue.queue.slice(split),
    contextName,
  };
}

/** Dispositivos de Spotify Connect disponibles. Solo pide datos con enabled=true. */
export function useDevices(enabled: boolean): AsyncResult<Device[]> {
  const fetcher = useMemo(() => (enabled ? (signal: AbortSignal) => getDevices(signal) : null), [enabled]);
  return useAsync(fetcher);
}
