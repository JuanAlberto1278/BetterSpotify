import { useState } from 'react';
import { usePlaybackPosition, usePlayer } from '../../player/usePlayer';
import { formatDuration } from '../format';
import styles from './PlayerBar.module.css';

export default function ProgressBar() {
  const { seek, canSeek } = usePlayer();
  const { positionMs, durationMs } = usePlaybackPosition();
  // Mientras se arrastra, se muestra el valor del usuario y se hace seek al soltar.
  const [dragMs, setDragMs] = useState<number | null>(null);

  const commit = () => {
    if (dragMs !== null) seek(dragMs);
    setDragMs(null);
  };

  const shown = dragMs ?? positionMs;

  return (
    <div className={styles.progress}>
      <span className={styles.time}>{formatDuration(shown)}</span>
      <input
        type="range"
        className={styles.slider}
        min={0}
        max={durationMs || 1}
        step={1000}
        value={shown}
        disabled={!canSeek || durationMs === 0}
        onChange={(e) => setDragMs(Number(e.target.value))}
        onPointerUp={commit}
        onKeyUp={commit}
        onBlur={() => setDragMs(null)}
        aria-label="Posición"
      />
      <span className={styles.time}>{formatDuration(durationMs)}</span>
    </div>
  );
}
