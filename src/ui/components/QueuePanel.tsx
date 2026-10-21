import { useQueue, type QueueEntry } from '../../data/usePlayback';
import { CloseIcon } from '../icons';
import { pickImage } from '../images';
import styles from './QueuePanel.module.css';

export default function QueuePanel({ onClose }: { onClose: () => void }) {
  const queue = useQueue(true);
  const sections = queue.data;

  return (
    <aside className={styles.panel} aria-label="Cola de reproducción">
      <header className={styles.header}>
        <h2 className={styles.title}>Cola</h2>
        <button className={styles.close} onClick={onClose} aria-label="Cerrar cola">
          <CloseIcon size={18} />
        </button>
      </header>

      {queue.error && (
        <p className={styles.error}>
          {queue.error} <button onClick={queue.reload}>Reintentar</button>
        </p>
      )}
      {queue.loading && !sections && <p className={styles.status}>Cargando…</p>}

      {sections?.current && (
        <>
          <h3 className={styles.section}>Sonando ahora</h3>
          <QueueItem item={sections.current} variant="current" />
        </>
      )}

      {sections && sections.userQueued.length > 0 && (
        <>
          <h3 className={styles.section}>Agregadas por vos</h3>
          <QueueList items={sections.userQueued} variant="user" />
        </>
      )}

      {sections && (
        <>
          <h3 className={styles.section}>
            {sections.contextName ? `Siguiente de: ${sections.contextName}` : 'A continuación'}
          </h3>
          {sections.upcoming.length === 0 ? (
            <p className={styles.status}>No hay nada más en cola.</p>
          ) : (
            <QueueList items={sections.upcoming} />
          )}
        </>
      )}
    </aside>
  );
}

type Variant = 'current' | 'user' | 'context';

function QueueList({ items, variant = 'context' }: { items: QueueEntry[]; variant?: Variant }) {
  return (
    <ol className={styles.list}>
      {items.map((item, index) => (
        <li key={`${item.uri}-${index}`}>
          <QueueItem item={item} variant={variant} />
        </li>
      ))}
    </ol>
  );
}

function QueueItem({ item, variant }: { item: QueueEntry; variant: Variant }) {
  const image = pickImage(item.type === 'track' ? item.album.images : item.images, 40);
  const subtitle =
    item.type === 'track' ? item.artists.map((a) => a.name).join(', ') : (item.show?.name ?? 'Episodio');

  return (
    <div className={`${styles.item} ${styles[variant] ?? ''}`}>
      {image ? <img className={styles.cover} src={image} alt="" loading="lazy" /> : <div className={styles.cover} />}
      <div className={styles.text}>
        <div className={styles.name}>{item.name}</div>
        <div className={styles.subtitle}>{subtitle}</div>
      </div>
    </div>
  );
}
