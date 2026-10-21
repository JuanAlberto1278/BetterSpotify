import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { checkInLibrary, LIBRARY_BATCH_SIZE, removeFromLibrary, saveToLibrary } from '../api/library';

/**
 * Estado "está en tu biblioteca" por URI (canciones, álbumes...), compartido por
 * toda la app para que el ♥ se vea igual en la lista, en el reproductor, etc.
 *
 * Las consultas se juntan durante un instante y se piden en lotes de 40.
 */

const BATCH_DELAY_MS = 50;

const saved = new Map<string, boolean>();
const pending = new Set<string>();
const inFlight = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;
let flushTimer: ReturnType<typeof setTimeout> | undefined;

function emit() {
  version++;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Encola URIs cuyo estado todavía no se conoce. */
function request(uris: string[]) {
  for (const uri of uris) {
    if (!saved.has(uri) && !inFlight.has(uri)) pending.add(uri);
  }
  if (pending.size > 0 && flushTimer === undefined) {
    flushTimer = setTimeout(flush, BATCH_DELAY_MS);
  }
}

async function flush() {
  flushTimer = undefined;
  const batch = [...pending];
  pending.clear();
  batch.forEach((uri) => inFlight.add(uri));

  for (let i = 0; i < batch.length; i += LIBRARY_BATCH_SIZE) {
    const chunk = batch.slice(i, i + LIBRARY_BATCH_SIZE);
    try {
      const result = await checkInLibrary(chunk);
      chunk.forEach((uri, j) => saved.set(uri, Boolean(result[j])));
    } catch (err) {
      // Queda como desconocido; se reintenta la próxima vez que se pida.
      console.warn('[library] no se pudo consultar la biblioteca', err);
    } finally {
      chunk.forEach((uri) => inFlight.delete(uri));
    }
  }
  emit();
}

/** Marca URIs que ya sabemos que están guardadas (p. ej. las de "Tus me gusta"). */
export function primeSaved(uris: string[]) {
  let changed = false;
  for (const uri of uris) {
    if (saved.get(uri) !== true) {
      saved.set(uri, true);
      changed = true;
    }
  }
  if (changed) emit();
}

/** Guarda o quita una URI. Actualiza la UI al instante y revierte si falla. */
export async function setInLibrary(uri: string, value: boolean): Promise<void> {
  const previous = saved.get(uri);
  saved.set(uri, value);
  emit();
  try {
    await (value ? saveToLibrary([uri]) : removeFromLibrary([uri]));
  } catch (err) {
    if (previous === undefined) saved.delete(uri);
    else saved.set(uri, previous);
    emit();
    throw err;
  }
}

/**
 * Estado de biblioteca de un conjunto de URIs. Devuelve una función que responde
 * true / false, o undefined mientras no se sabe.
 */
export function useLibraryStatus(uris: string[]): (uri: string) => boolean | undefined {
  const currentVersion = useSyncExternalStore(subscribe, () => version);
  const key = uris.join(',');

  useEffect(() => {
    if (key) request(key.split(','));
  }, [key]);

  // currentVersion fuerza una función nueva cuando cambia el store.
  return useCallback((uri: string) => (currentVersion >= 0 ? saved.get(uri) : undefined), [currentVersion]);
}
