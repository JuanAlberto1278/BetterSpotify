import { usePlayer } from '../../player/usePlayer';
import styles from './PlayerBar.module.css';

export default function VolumeControl() {
  const { volume, setVolume, toggleMute } = usePlayer();

  return (
    <div className={styles.volume}>
      <button className={styles.iconButton} onClick={toggleMute} aria-label="Silenciar" title="Silenciar (M)">
        {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
      </button>
      <input
        type="range"
        className={styles.slider}
        min={0}
        max={100}
        value={Math.round(volume * 100)}
        onChange={(e) => setVolume(Number(e.target.value) / 100)}
        aria-label="Volumen"
        title="Volumen (Shift + ↑ / ↓)"
      />
    </div>
  );
}
