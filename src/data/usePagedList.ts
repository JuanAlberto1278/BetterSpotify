import { useCallback, useEffect, useRef, useState } from 'react';
import { describeError } from '../api/errors';
import type { Paging } from '../api/types';

export type PageFetcher<T> = (url: string | null, signal: AbortSignal) => Promise<Paging<T>>;

export interface PagedList<T> {
  items: T[];
  total: number | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  reload: () => void;
}

interface State<T> {
  items: T[];
  next: string | null;
  total: number | null;
  loading: boolean;
  error: string | null;
}

const IDLE: State<never> = { items: [], next: null, total: null, loading: false, error: null };

/**
 * Lista paginada de la Web API. Carga la primera página cada vez que cambia
 * `fetchPage` (memorizalo con useCallback/useMemo) y las siguientes con loadMore().
 * Pasar null deja la lista vacía sin pedir nada.
 */
export function usePagedList<T>(fetchPage: PageFetcher<T> | null): PagedList<T> {
  const [state, setState] = useState<State<T>>(IDLE);
  const [reloadKey, setReloadKey] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!fetchPage) {
      setState(IDLE);
      return;
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    loadingRef.current = true;
    setState({ ...IDLE, loading: true });

    fetchPage(null, controller.signal)
      .then((page) => {
        setState({ items: page.items, next: page.next, total: page.total, loading: false, error: null });
      })
      .catch((err) => {
        if (!controller.signal.aborted) setState({ ...IDLE, error: describeError(err) });
      })
      .finally(() => {
        if (!controller.signal.aborted) loadingRef.current = false;
      });

    return () => {
      controller.abort();
      loadingRef.current = false;
    };
  }, [fetchPage, reloadKey]);

  const loadMore = useCallback(() => {
    const controller = controllerRef.current;
    if (!fetchPage || !controller || !state.next || loadingRef.current) return;
    loadingRef.current = true;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetchPage(state.next, controller.signal)
      .then((page) => {
        setState((s) => ({ ...s, items: [...s.items, ...page.items], next: page.next, loading: false }));
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setState((s) => ({ ...s, loading: false, error: describeError(err) }));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) loadingRef.current = false;
      });
  }, [fetchPage, state.next]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    items: state.items,
    total: state.total,
    loading: state.loading,
    error: state.error,
    hasMore: state.next !== null,
    loadMore,
    reload,
  };
}
