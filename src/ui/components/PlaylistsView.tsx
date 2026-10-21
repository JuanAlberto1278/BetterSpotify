import { useState } from 'react';
import { usePlaylists } from '../../data/useLibrary';
import { PlaylistIcon, PlusIcon } from '../icons';
import NewPlaylistDialog from './NewPlaylistDialog';
import PlaylistGrid from './PlaylistGrid';
import styles from './View.module.css';

export default function PlaylistsView() {
  const playlists = usePlaylists();
  const [creating, setCreating] = useState(false);

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
          <div className={styles.actions}>
            <button className={styles.playAll} onClick={() => setCreating(true)}>
              <PlusIcon size={16} /> Crear playlist
            </button>
          </div>
        </div>
      </header>

      <PlaylistGrid list={playlists} />
      <NewPlaylistDialog open={creating} onClose={() => setCreating(false)} />
    </section>
  );
}
