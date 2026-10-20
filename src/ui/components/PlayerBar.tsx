import { usePlayer } from '../../player/usePlayer';
import DevicePicker from './DevicePicker';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import styles from './PlayerBar.module.css';

const REPEAT_LABEL = { off: 'Repetir: no', context: 'Repetir: todo', track: 'Repetir: canción' };

interface Props {
  queueOpen: boolean;
  onToggleQueue: () => void;
}

export default function PlayerBar({ queueOpen, onToggleQueue }: Props) {
  const {
    status, isActive, paused, track, toast,
    shuffle, repeatMode,
    canSkipPrev, canSkipNext, canShuffle, canRepeat,
    togglePlay, next, previous, toggleShuffle, cycleRepeat, transferHere, dismissToast,
  } = usePlayer();

  return (
    <footer className={styles.bar}>
      {toast && (
        <div
          key={toast.id}
          className={`${styles.toast} ${toast.kind === 'error' ? styles.toastError : ''}`}
          role={toast.kind === 'error' ? 'alert' : 'status'}
        >
          <span>{toast.text}</span>
          <button className={styles.iconButton} onClick={dismissToast} aria-label="Cerrar">
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
              className={`${styles.iconButton} ${shuffle ? styles.on : ''}`}
              onClick={toggleShuffle}
              disabled={!canShuffle}
              aria-label="Aleatorio"
              aria-pressed={shuffle}
              title="Aleatorio (S)"
            >
              🔀
            </button>
            <button
              className={styles.iconButton}
              onClick={previous}
              disabled={!canSkipPrev}
              aria-label="Anterior"
              title="Anterior (Shift + ←)"
            >
              ⏮
            </button>
            <button
              className={styles.playButton}
              onClick={togglePlay}
              disabled={status !== 'ready'}
              aria-label={paused ? 'Reproducir' : 'Pausar'}
              title="Reproducir / pausar (Espacio)"
            >
              {paused ? '▶' : '⏸'}
            </button>
            <button
              className={styles.iconButton}
              onClick={next}
              disabled={!canSkipNext}
              aria-label="Siguiente"
              title="Siguiente (Shift + →)"
            >
              ⏭
            </button>
            <button
              className={`${styles.iconButton} ${repeatMode !== 'off' ? styles.on : ''}`}
              onClick={cycleRepeat}
              disabled={!canRepeat}
              aria-label={REPEAT_LABEL[repeatMode]}
              title={`${REPEAT_LABEL[repeatMode]} (R)`}
            >
              {repeatMode === 'track' ? '🔂' : '🔁'}
            </button>
          </div>
        )}
        <ProgressBar />
      </div>

      <div className={styles.right}>
        <button
          className={`${styles.iconButton} ${queueOpen ? styles.on : ''}`}
          onClick={onToggleQueue}
          aria-label="Cola de reproducción"
          aria-pressed={queueOpen}
          title="Cola (Q)"
        >
          ☰
        </button>
        <DevicePicker />
        <VolumeControl />
      </div>
    </footer>
  );
}

function statusText(status: string, isActive: boolean): string {
  if (status === 'connecting') return 'Conectando reproductor…';
  if (status === 'error') return 'Reproductor no disponible';
  return isActive ? 'Nada sonando' : 'Sonando en otro dispositivo';
}
