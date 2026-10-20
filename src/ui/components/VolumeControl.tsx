import { useRef } from 'react';
import { usePlayer } from '../../player/usePlayer';
import styles from './PlayerBar.module.css';

export default function VolumeControl() {
  const { volume, setVolume } = usePlayer();
  const beforeMute = useRef(0.5);

  const toggleMute = () => {
    if (volume > 0) {
      beforeMute.current = volume;
      setVolume(0);
    } else {
      setVolume(beforeMute.current || 0.5);
    }
  };

  return (
    <div className={styles.volume}>
      <button className={styles.iconButton} onClick={toggleMute} aria-label="Silenciar">
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
      />
    </div>
  );
}
