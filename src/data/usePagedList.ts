import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const noop = () => {};

/** Envuelve un array ya cargado como PagedList (para reusar grillas y listas). */
export function staticList<T>(items: T[]): PagedList<T> {
  return { items, total: items.length, loading: false, error: null, hasMore: false, loadMore: noop, reload: noop };
}

interface Request<T> {
  fetchPage: PageFetcher<T>;
}

interface Loaded<T> {
  /** Pedido al que corresponden estos datos. */
  request: Request<T>;
  items: T[];
  next: string | null;
  total: number | null;
  error: string | null;
  loadingMore: boolean;
}

/**
 * Lista paginada de la Web API. Carga la primera página cada vez que cambia
 * `fetchPage` (memorizalo con useCallback/useMemo) y las siguientes con loadMore().
 * Pasar null deja la lista vacía sin pedir nada.
 */
export function usePagedList<T>(fetchPage: PageFetcher<T> | null): PagedList<T> {
  const [reloadKey, setReloadKey] = useState(0);
  const request = useMemo<Request<T> | null>(
    () => (fetchPage ? { fetchPage, reloadKey } : null),
    [fetchPage, reloadKey],
  );
  const [loaded, setLoaded] = useState<Loaded<T> | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const loadingMoreRef = useRef(false);

  // Primera página.
  useEffect(() => {
    if (!request) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    request
      .fetchPage(null, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return;
        setLoaded({
          request,
          items: page.items,
          next: page.next,
          total: page.total,
          error: null,
          loadingMore: false,
        });
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setLoaded({ request, items: [], next: null, total: null, error: describeError(err), loadingMore: false });
      });
    return () => controller.abort();
  }, [request]);

  // Solo se muestran datos del pedido actual (al cambiar de playlist no se ve la anterior).
  const current = loaded && request && loaded.request === request ? loaded : null;

  const loadMore = useCallback(() => {
    const controller = controllerRef.current;
    if (!request || !current?.next || !controller || loadingMoreRef.current) return;
    loadingMoreRef.current = true;

    // Solo se aplican cambios si la lista sigue siendo la del mismo pedido.
    const update = (fn: (l: Loaded<T>) => Loaded<T>) =>
      setLoaded((l) => (l && l.request === request ? fn(l) : l));

    update((l) => ({ ...l, loadingMore: true, error: null }));
    request
      .fetchPage(current.next, controller.signal)
      .then((page) => {
        if (controller.signal.aborted) return;
        update((l) => ({ ...l, items: [...l.items, ...page.items], next: page.next, loadingMore: false }));
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        update((l) => ({ ...l, loadingMore: false, error: describeError(err) }));
      })
      .finally(() => {
        loadingMoreRef.current = false;
      });
  }, [request, current]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    items: current?.items ?? [],
    total: current?.total ?? null,
    loading: request !== null && (!current || current.loadingMore),
    error: current?.error ?? null,
    hasMore: Boolean(current?.next),
    loadMore,
    reload,
  };
}
