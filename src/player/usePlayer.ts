import { useContext, useEffect, useState } from 'react';
import { PlayerContext, type PlayerContextValue } from './PlayerProvider';

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer debe usarse dentro de <PlayerProvider>');
  return ctx;
}

const TICK_MS = 250;

/**
 * Posición actual interpolada mientras suena. Está separada de usePlayer() para
 * que solo se re-renderice el componente que la usa (la barra de progreso).
 */
export function usePlaybackPosition(): { positionMs: number; durationMs: number } {
  const { snapshot } = usePlayer();
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    setNow(Date.now());
    if (snapshot.paused) return;
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [snapshot]);

  const elapsed = snapshot.paused ? 0 : Math.max(0, now - snapshot.takenAt);
  return {
    positionMs: Math.min(snapshot.positionMs + elapsed, snapshot.durationMs),
    durationMs: snapshot.durationMs,
  };
}
