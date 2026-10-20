import { useCallback, useEffect, useState } from 'react';
import { describeError } from '../api/errors';

export type AsyncFetcher<T> = (signal: AbortSignal) => Promise<T>;

export interface AsyncResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Ejecuta `fetcher` cada vez que cambia (memorizalo con useMemo/useCallback).
 * Mientras recarga conserva el dato anterior para evitar parpadeos.
 * Pasar null no pide nada.
 */
export function useAsync<T>(fetcher: AsyncFetcher<T> | null): AsyncResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!fetcher) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetcher(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(describeError(err));
        setLoading(false);
      });
    return () => controller.abort();
  }, [fetcher, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return { data, loading, error, reload };
}
