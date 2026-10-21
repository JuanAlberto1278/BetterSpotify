import { usePlayer } from '../../player/usePlayer';
import { VolumeIcon } from '../icons';
import styles from './PlayerBar.module.css';

export default function VolumeControl() {
  const { volume, setVolume, toggleMute } = usePlayer();
  const muted = volume === 0;

  return (
    <div className={styles.volume}>
      <button
        className={styles.iconButton}
        onClick={toggleMute}
        aria-label={muted ? 'Activar sonido' : 'Silenciar'}
        title={`${muted ? 'Activar sonido' : 'Silenciar'} (M)`}
      >
        <VolumeIcon level={volume} size={18} />
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
