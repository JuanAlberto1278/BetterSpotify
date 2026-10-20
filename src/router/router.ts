import { useMemo, useSyncExternalStore } from 'react';
import { parseRoute, type Route } from './routes';

const NAVIGATE_EVENT = 'betterspotify:navigate';

function currentLocation(): string {
  return window.location.pathname + window.location.search;
}

/** Cambia la URL sin recargar. Con replace no se agrega una entrada al historial. */
export function navigate(to: string, { replace = false } = {}): void {
  if (to === currentLocation()) return;
  if (replace) window.history.replaceState(null, '', to);
  else window.history.pushState(null, '', to);
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange);
  window.addEventListener(NAVIGATE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(NAVIGATE_EVENT, onChange);
  };
}

/** Ruta actual; se actualiza con navigate() y con atrás/adelante del navegador. */
export function useRoute(): Route {
  const location = useSyncExternalStore(subscribe, currentLocation);
  return useMemo(() => parseRoute(location), [location]);
}
