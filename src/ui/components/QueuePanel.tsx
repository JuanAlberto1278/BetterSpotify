import type { Episode, Track } from '../../api/types';
import { useQueue } from '../../data/usePlayback';
import { pickImage } from '../images';
import styles from './QueuePanel.module.css';

export default function QueuePanel({ onClose }: { onClose: () => void }) {
  const queue = useQueue(true);
  const { currently_playing: current, queue: upcoming = [] } = queue.data ?? {};

  return (
    <aside className={styles.panel} aria-label="Cola de reproducción">
      <header className={styles.header}>
        <h2 className={styles.title}>Cola</h2>
        <button className={styles.close} onClick={onClose} aria-label="Cerrar cola">
          ✕
        </button>
      </header>

      {queue.error && (
        <p className={styles.error}>
          {queue.error} <button onClick={queue.reload}>Reintentar</button>
        </p>
      )}
      {queue.loading && !queue.data && <p className={styles.status}>Cargando…</p>}

      {current && (
        <>
          <h3 className={styles.section}>Sonando ahora</h3>
          <QueueItem item={current} highlight />
        </>
      )}

      {queue.data && (
        <>
          <h3 className={styles.section}>A continuación</h3>
          {upcoming.length === 0 ? (
            <p className={styles.status}>No hay nada en cola.</p>
          ) : (
            <ol className={styles.list}>
              {upcoming.map((item, index) => (
                <li key={`${item.uri}-${index}`}>
                  <QueueItem item={item} />
                </li>
              ))}
            </ol>
          )}
        </>
      )}
    </aside>
  );
}

function QueueItem({ item, highlight = false }: { item: Track | Episode; highlight?: boolean }) {
  const image = pickImage(item.type === 'track' ? item.album.images : item.images, 40);
  const subtitle =
    item.type === 'track' ? item.artists.map((a) => a.name).join(', ') : (item.show?.name ?? 'Episodio');

  return (
    <div className={styles.item}>
      {image ? <img className={styles.cover} src={image} alt="" loading="lazy" /> : <div className={styles.cover} />}
      <div className={styles.text}>
        <div className={`${styles.name} ${highlight ? styles.highlight : ''}`}>{item.name}</div>
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
    </div>
  );
}
