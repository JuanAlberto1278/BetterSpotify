import type { ReactNode } from 'react';
import type { PagedList } from '../../data/usePagedList';
import Link from './Link';
import LoadMoreSentinel from './LoadMoreSentinel';
import styles from './CardGrid.module.css';

export interface Card {
  key: string;
  to: string;
  title: string;
  subtitle?: string;
  imageUrl: string | null;
  /** Ícono a mostrar si no hay imagen. */
  placeholder: ReactNode;
}

interface Props<T> {
  list: PagedList<T>;
  toCard: (item: T) => Card;
  emptyText?: string;
}

/** Grilla de tarjetas (álbumes, playlists...) con scroll infinito. */
export default function CardGrid<T>({ list, toCard, emptyText = 'No hay nada para mostrar.' }: Props<T>) {
  const { items, loading, error, hasMore, loadMore } = list;

  return (
    <div>
      {items.length > 0 && (
        <ul className={styles.grid}>
          {items.map((item) => {
            const card = toCard(item);
            return (
              <li key={card.key}>
                <Link to={card.to} className={styles.card} title={card.title}>
                  {card.imageUrl ? (
                    <img className={styles.cover} src={card.imageUrl} alt="" loading="lazy" />
                  ) : (
                    <div className={`${styles.cover} ${styles.placeholder}`}>{card.placeholder}</div>
                  )}
                  <span className={styles.name}>{card.title}</span>
                  {card.subtitle && <span className={styles.meta}>{card.subtitle}</span>}
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
