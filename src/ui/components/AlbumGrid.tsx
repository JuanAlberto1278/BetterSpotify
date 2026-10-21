import type { AlbumSummary } from '../../api/types';
import type { PagedList } from '../../data/usePagedList';
import { paths } from '../../router/routes';
import { ALBUM_TYPE_LABEL } from '../format';
import { DiscIcon } from '../icons';
import { pickImage } from '../images';
import Link from './Link';
import LoadMoreSentinel from './LoadMoreSentinel';
import styles from './AlbumGrid.module.css';

interface Props {
  list: PagedList<AlbumSummary>;
  emptyText?: string;
  /** Qué mostrar debajo del nombre: "año · tipo" (discografía) o los artistas (biblioteca). */
  subtitle?: 'release' | 'artists';
}

/** Grilla de álbumes con scroll infinito. */
export default function AlbumGrid({ list, emptyText = 'No hay nada para mostrar.', subtitle = 'release' }: Props) {
  const { items, loading, error, hasMore, loadMore } = list;

  return (
    <div>
      {items.length > 0 && (
        <ul className={styles.grid}>
          {items.map((album) => {
            const cover = pickImage(album.images, 200);
            return (
              <li key={album.id}>
                <Link to={paths.album(album.id)} className={styles.card} title={album.name}>
                  {cover ? (
                    <img className={styles.cover} src={cover} alt="" loading="lazy" />
                  ) : (
                    <div className={`${styles.cover} ${styles.placeholder}`}>
                      <DiscIcon size={48} />
                    </div>
                  )}
                  <span className={styles.name}>{album.name}</span>
                  <span className={styles.meta}>
                    {subtitle === 'artists'
                      ? album.artists.map((a) => a.name).join(', ')
                      : `${album.release_date.slice(0, 4)} · ${ALBUM_TYPE_LABEL[album.album_type] ?? 'Álbum'}`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
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
