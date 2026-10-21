import { idFromUri } from '../../api/uri';
import { usePlayer } from '../../player/usePlayer';
import { paths } from '../../router/routes';
import {
  CloseIcon,
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
  QueueIcon,
  RepeatIcon,
  RepeatOneIcon,
  ShuffleIcon,
} from '../icons';
import ArtistLinks from './ArtistLinks';
import DevicePicker from './DevicePicker';
import Link from './Link';
import SaveButton from './SaveButton';
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

  const albumId = track ? idFromUri(track.album.uri) : null;
  const toggleClass =(on: boolean) => `${styles.iconButton} ${styles.toggle} ${on ? styles.on : ''}`;

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
            <CloseIcon size={16} />
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
          <div className={styles.title}>
            {track && albumId ? (
              <Link to={paths.album(albumId)} className={styles.link}>
                {track.name}
              </Link>
            ) : (
              (track?.name ?? statusText(status, isActive))
            )}
          </div>
          <div className={styles.artist}>
            {track && <ArtistLinks artists={track.artists} className={styles.link} />}
          </div>
        </div>
        {track && <SaveButton uri={track.uri} size={18} />}
      </div>

      <div className={styles.center}>
        {status === 'ready' && !isActive ? (
          <button className={styles.transfer} onClick={transferHere}>
            Reproducir en este navegador
          </button>
        ) : (
          <div className={styles.controls}>
            <button
              className={toggleClass(shuffle)}
              onClick={toggleShuffle}
              disabled={!canShuffle}
              aria-label="Aleatorio"
              aria-pressed={shuffle}
              title={`Aleatorio: ${shuffle ? 'sí' : 'no'} (S)`}
            >
              <ShuffleIcon size={18} />
            </button>
            <button
              className={styles.iconButton}
              onClick={previous}
              disabled={!canSkipPrev}
              aria-label="Anterior"
              title="Anterior (Shift + ←)"
            >
              <PreviousIcon />
            </button>
            <button
              className={styles.playButton}
              onClick={togglePlay}
              disabled={status !== 'ready'}
              aria-label={paused ? 'Reproducir' : 'Pausar'}
              title="Reproducir / pausar (Espacio)"
            >
              {paused ? <PlayIcon size={18} /> : <PauseIcon size={18} />}
            </button>
            <button
              className={styles.iconButton}
              onClick={next}
              disabled={!canSkipNext}
              aria-label="Siguiente"
              title="Siguiente (Shift + →)"
            >
              <NextIcon />
            </button>
            <button
              className={toggleClass(repeatMode !== 'off')}
              onClick={cycleRepeat}
              disabled={!canRepeat}
              aria-label={REPEAT_LABEL[repeatMode]}
              title={`${REPEAT_LABEL[repeatMode]} (R)`}
            >
              {repeatMode === 'track' ? <RepeatOneIcon size={18} /> : <RepeatIcon size={18} />}
            </button>
          </div>
        )}
        <ProgressBar />
      </div>

      <div className={styles.right}>
        <button
          className={toggleClass(queueOpen)}
          onClick={onToggleQueue}
          aria-label="Cola de reproducción"
          aria-pressed={queueOpen}
          title="Cola (Q)"
        >
          <QueueIcon size={18} />
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
