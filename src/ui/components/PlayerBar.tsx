import { usePlayer } from '../../player/usePlayer';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import styles from './PlayerBar.module.css';

export default function PlayerBar() {
  const {
    status, isActive, paused, track, error,
    canSkipPrev, canSkipNext,
    togglePlay, next, previous, transferHere, clearError,
  } = usePlayer();

  return (
    <footer className={styles.bar}>
      {error && (
        <div className={styles.error} role="alert">
          <span>{error}</span>
          <button className={styles.iconButton} onClick={clearError} aria-label="Cerrar">
            ✕
          </button>
        </div>
      )}

      <div className={styles.nowPlaying}>
        {track?.album.imageUrl ? (
          <img className={styles.cover} src={track.album.imageUrl} alt={track.album.name} />
        ) : (
          <div className={styles.cover} />
        )}
        <div className={styles.info}>
          <div className={styles.title}>{track?.name ?? statusText(status, isActive)}</div>
          <div className={styles.artist}>{track?.artists.map((a) => a.name).join(', ')}</div>
        </div>
      </div>

      <div className={styles.center}>
        {status === 'ready' && !isActive ? (
          <button className={styles.transfer} onClick={transferHere}>
            Reproducir en este navegador
          </button>
        ) : (
          <div className={styles.controls}>
            <button
              className={styles.iconButton}
              onClick={previous}
              disabled={!canSkipPrev}
              aria-label="Anterior"
            >
              ⏮
            </button>
            <button
              className={styles.playButton}
              onClick={togglePlay}
              disabled={status !== 'ready'}
              aria-label={paused ? 'Reproducir' : 'Pausar'}
            >
              {paused ? '▶' : '⏸'}
            </button>
            <button
              className={styles.iconButton}
              onClick={next}
              disabled={!canSkipNext}
              aria-label="Siguiente"
            >
              ⏭
            </button>
          </div>
        )}
        <ProgressBar />
      </div>

      <VolumeControl />
    </footer>
  );
}

function statusText(status: string, isActive: boolean): string {
  if (status === 'connecting') return 'Conectando reproductor…';
  if (status === 'error') return 'Reproductor no disponible';
  return isActive ? 'Nada sonando' : 'Sonando en otro dispositivo';
}
