import { usePlaylists } from '../../data/useLibrary';
import { PlaylistIcon } from '../icons';
import PlaylistGrid from './PlaylistGrid';
import styles from './View.module.css';

export default function PlaylistsView() {
  const playlists = usePlaylists();

  return (
    <section>
      <header className={styles.header}>
        <div className={`${styles.cover} ${styles.likedCover}`}>
          <PlaylistIcon size={64} />
        </div>
        <div className={styles.headerText}>
          <p className={styles.kicker}>Biblioteca</p>
          <h1 className={styles.title}>Tus playlists</h1>
          <p className={styles.meta}>
            {playlists.total !== null && `${playlists.total} ${playlists.total === 1 ? 'playlist' : 'playlists'}`}
          </p>
        </div>
      </header>

      <PlaylistGrid list={playlists} />
    </section>
  );
}
