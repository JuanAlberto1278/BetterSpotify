import type { Track } from '../../api/types';
import type { PagedList } from '../../data/usePagedList';
import { usePlayer } from '../../player/usePlayer';
import { formatDuration } from '../format';
import { EqualizerIcon, PlayIcon, PlusIcon } from '../icons';
import { pickImage } from '../images';
import LoadMoreSentinel from './LoadMoreSentinel';
import styles from './TrackList.module.css';

interface Props {
  list: PagedList<Track>;
  /** Se llama con el índice de la canción elegida. */
  onPlay: (index: number) => void;
  emptyText?: string;
}

export default function TrackList({ list, onPlay, emptyText = 'No hay canciones.' }: Props) {
  const { track: current, paused, addToQueue } = usePlayer();
  const { items, loading, error, hasMore, loadMore } = list;

  return (
    <div>
      {items.length > 0 && (
        <ol className={styles.list}>
          {items.map((track, index) => {
            const isCurrent = current?.uri === track.uri;
            const cover = pickImage(track.album.images, 40);
            return (
              <li
                // Una playlist puede repetir canciones: el índice desambigua.
                key={`${track.uri}-${index}`}
                className={`${styles.row} ${isCurrent ? styles.current : ''}`}
                onDoubleClick={() => onPlay(index)}
              >
                <button
                  className={styles.playButton}
                  onClick={() => onPlay(index)}
                  aria-label={`Reproducir ${track.name}`}
                >
                  <span className={styles.number}>
                    {isCurrent && !paused ? <EqualizerIcon size={14} /> : index + 1}
                  </span>
                  <span className={styles.playIcon}>
                    <PlayIcon size={14} />
                  </span>
                </button>
                {cover ? (
                  <img className={styles.cover} src={cover} alt="" loading="lazy" />
                ) : (
                  <div className={styles.cover} />
                )}
                <div className={styles.main}>
                  <div className={styles.name}>
                    {track.explicit && <span className={styles.explicit}>E</span>}
                    {track.name}
                  </div>
                  <div className={styles.artists}>{track.artists.map((a) => a.name).join(', ')}</div>
                </div>
                <div className={styles.album}>{track.album.name}</div>
                <button
                  className={styles.queueButton}
                  onClick={() => addToQueue(track.uri)}
                  aria-label={`Agregar ${track.name} a la cola`}
                  title="Agregar a la cola"
                >
                  <PlusIcon size={16} />
                </button>
                <div className={styles.duration}>{formatDuration(track.duration_ms)}</div>
              </li>
            );
          })}
        </ol>
      )}

      {!loading && !error && items.length === 0 && <p className={styles.status}>{emptyText}</p>}
      {loading && <p className={styles.status}>Cargando…</p>}
      {error && (
        <p className={styles.error}>
          {error} <button onClick={items.length ? loadMore : list.reload}>Reintentar</button>
        </p>
      )}
      {hasMore && !error && <LoadMoreSentinel onVisible={loadMore} disabled={loading} />}
    </div>
  );
}
