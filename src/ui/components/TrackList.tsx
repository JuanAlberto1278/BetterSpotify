import type { Track } from '../../api/types';
import type { PagedList } from '../../data/usePagedList';
import { usePlayer } from '../../player/usePlayer';
import { paths } from '../../router/routes';
import { formatDuration } from '../format';
import { EqualizerIcon, PlayIcon } from '../icons';
import { pickImage } from '../images';
import ArtistLinks from './ArtistLinks';
import Link from './Link';
import LoadMoreSentinel from './LoadMoreSentinel';
import SaveButton from './SaveButton';
import TrackMenu from './TrackMenu';
import styles from './TrackList.module.css';

interface Props {
  list: PagedList<Track>;
  /** Se llama con el índice de la canción elegida. */
  onPlay: (index: number) => void;
  emptyText?: string;
  /** "album": sin portada ni columna de álbum (dentro de la vista de un álbum). */
  variant?: 'default' | 'album';
  /** Si está, cada fila ofrece "Quitar de esta playlist". */
  onRemove?: (track: Track) => void;
  /** Playlist que se está viendo (no se ofrece agregar a sí misma). */
  playlistId?: string;
}

export default function TrackList({
  list,
  onPlay,
  emptyText = 'No hay canciones.',
  variant = 'default',
  onRemove,
  playlistId,
}: Props) {
  const { track: current, paused } = usePlayer();
  const { items, loading, error, hasMore, loadMore } = list;
  const showAlbum = variant === 'default';

  return (
    <div>
      {items.length > 0 && (
        <ol className={`${styles.list} ${showAlbum ? '' : styles.compact}`}>
          {items.map((track, index) => {
            const isCurrent = current?.uri === track.uri;
            const cover = showAlbum ? pickImage(track.album.images, 40) : null;
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
                {showAlbum &&
                  (cover ? (
                    <img className={styles.cover} src={cover} alt="" loading="lazy" />
                  ) : (
                    <div className={styles.cover} />
                  ))}
                <div className={styles.main}>
                  <div className={styles.name}>
                    {track.explicit && <span className={styles.explicit}>E</span>}
                    {track.name}
                  </div>
                  <div className={styles.artists}>
                    <ArtistLinks artists={track.artists} className={styles.link} />
                  </div>
                </div>
                {showAlbum && (
                  <div className={styles.album}>
                    {track.album.id ? (
                      <Link
                        to={paths.album(track.album.id)}
                        className={styles.link}
                        onDoubleClick={(e) => e.stopPropagation()}
                      >
                        {track.album.name}
                      </Link>
                    ) : (
                      track.album.name
                    )}
                  </div>
                )}
                <SaveButton uri={track.uri} className={styles.heart} />
                {/* El menú no debe disparar el doble clic de la fila (reproducir). */}
                <span className={styles.menuCell} onDoubleClick={(e) => e.stopPropagation()}>
                  <TrackMenu
                    track={track}
                    className={styles.menuButton}
                    currentPlaylistId={playlistId}
                    onRemove={onRemove ? () => onRemove(track) : undefined}
                  />
                </span>
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
