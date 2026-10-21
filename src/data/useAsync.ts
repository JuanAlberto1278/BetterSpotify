import { useCallback, useEffect, useMemo, useState } from 'react';
import { describeError } from '../api/errors';

export type AsyncFetcher<T> = (signal: AbortSignal) => Promise<T>;

export interface AsyncResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

interface Request<T> {
  fetcher: AsyncFetcher<T>;
}

interface Settled<T> {
  /** Pedido al que corresponde este resultado. */
  request: Request<T> | null;
  data: T | null;
  error: string | null;
}

/**
 * Ejecuta `fetcher` cada vez que cambia (memorizalo con useMemo/useCallback).
 * Mientras recarga conserva el dato anterior para evitar parpadeos.
 * Pasar null no pide nada.
 *
 * `loading` no se guarda en estado: se deriva de si el último resultado
 * corresponde al pedido actual.
 */
export function useAsync<T>(fetcher: AsyncFetcher<T> | null): AsyncResult<T> {
  const [reloadKey, setReloadKey] = useState(0);
  const request = useMemo<Request<T> | null>(
    () => (fetcher ? { fetcher, reloadKey } : null),
    [fetcher, reloadKey],
  );
  const [settled, setSettled] = useState<Settled<T>>({ request: null, data: null, error: null });

  useEffect(() => {
    if (!request) return;
    const controller = new AbortController();
    request
      .fetcher(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setSettled({ request, data, error: null });
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setSettled((prev) => ({ request, data: prev.data, error: describeError(err) }));
        }
      });
    return () => controller.abort();
  }, [request]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  const isCurrent = request !== null && settled.request === request;

  return {
    data: settled.data,
    loading: request !== null && !isCurrent,
    error: isCurrent ? settled.error : null,
    reload,
  };
}
