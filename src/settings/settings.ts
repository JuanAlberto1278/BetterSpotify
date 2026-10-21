import { useSyncExternalStore } from 'react';

/** Preferencias del usuario, guardadas en este navegador. */
export interface Settings {
  /** Al abrir la app, pasar la reproducción a este navegador (en pausa). */
  autoTransferOnStart: boolean;
}

const STORAGE_KEY = 'betterspotify.settings';

const DEFAULTS: Settings = {
  autoTransferOnStart: true,
};

const listeners = new Set<() => void>();
let current: Settings = load();

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function getSettings(): Settings {
  return current;
}

export function updateSettings(patch: Partial<Settings>): void {
  current = { ...current, ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Sin storage: el cambio vale solo para esta sesión.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSettings(): Settings {
  return useSyncExternalStore(subscribe, getSettings);
}
