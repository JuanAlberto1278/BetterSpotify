import { useEffect, useRef } from 'react';
import { usePlayer } from './usePlayer';
import type { PlayerContextValue } from './PlayerProvider';

const SEEK_STEP_MS = 5000;
const VOLUME_STEP = 0.05;

export interface ShortcutHandlers {
  /** "/" */
  onFocusSearch?: () => void;
  /** "Q" */
  onToggleQueue?: () => void;
}

/** Lista de atajos para mostrar en la UI (ayuda). */
export const SHORTCUTS: { keys: string; action: string }[] = [
  { keys: 'Espacio', action: 'Reproducir / pausar' },
  { keys: '← / →', action: 'Retroceder / avanzar 5 s' },
  { keys: 'Shift + ← / →', action: 'Canción anterior / siguiente' },
  { keys: 'Shift + ↑ / ↓', action: 'Subir / bajar volumen' },
  { keys: 'M', action: 'Silenciar' },
  { keys: 'S', action: 'Aleatorio' },
  { keys: 'R', action: 'Repetir' },
  { keys: 'Q', action: 'Mostrar / ocultar cola' },
  { keys: '/', action: 'Buscar' },
];

/**
 * Atajos globales del reproductor. Se ignoran mientras se escribe en un campo
 * de texto o se usa Ctrl/Cmd/Alt (para no pisar atajos del navegador).
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers = {}): void {
  const player = usePlayer();
  // Refs para registrar el listener una sola vez y leer siempre lo último.
  const playerRef = useRef<PlayerContextValue>(player);
  const handlersRef = useRef(handlers);
  useEffect(() => {
    playerRef.current = player;
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTyping(e)) return;

      const p = playerRef.current;
      const h = handlersRef.current;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      const handled = (() => {
        switch (key) {
          case ' ':
            // Sobre un botón, Espacio ya lo "clickea": no duplicar.
            if (e.target instanceof HTMLButtonElement) return false;
            if (!e.repeat) p.togglePlay();
            return true;
          case 'ArrowRight':
          case 'ArrowLeft': {
            const forward = key === 'ArrowRight';
            if (e.shiftKey) {
              if (forward ? p.canSkipNext : p.canSkipPrev) (forward ? p.next : p.previous)();
            } else if (p.canSeek) {
              const target = p.getPositionMs() + (forward ? SEEK_STEP_MS : -SEEK_STEP_MS);
              p.seek(Math.min(Math.max(0, target), p.snapshot.durationMs));
            }
            return true;
          }
          case 'ArrowUp':
          case 'ArrowDown':
            if (!e.shiftKey) return false; // sin Shift, las flechas siguen scrolleando
            p.setVolume(p.volume + (key === 'ArrowUp' ? VOLUME_STEP : -VOLUME_STEP));
            return true;
          case 'm':
            p.toggleMute();
            return true;
          case 's':
            if (p.canShuffle) p.toggleShuffle();
            return true;
          case 'r':
            if (p.canRepeat) p.cycleRepeat();
            return true;
          case 'q':
            h.onToggleQueue?.();
            return Boolean(h.onToggleQueue);
          case '/':
            h.onFocusSearch?.();
            return Boolean(h.onFocusSearch);
          default:
            return false;
        }
      })();

      if (handled) e.preventDefault();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}

/** true si el foco está en un lugar donde la tecla tiene otro significado. */
function isTyping(e: KeyboardEvent): boolean {
  const t = e.target;
  if (!(t instanceof HTMLElement)) return false;
  if (t.isContentEditable || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement) {
    return true;
  }
  if (t instanceof HTMLInputElement) {
    // En un slider las flechas lo mueven; el resto de los atajos sí aplican.
    return t.type !== 'range' || e.key.startsWith('Arrow');
  }
  return false;
}
