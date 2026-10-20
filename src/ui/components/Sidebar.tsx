import type { SimplifiedPlaylist } from '../../api/types';
import { useAuth } from '../../auth/AuthProvider';
import { usePlaylists } from '../../data/useLibrary';
import { pickImage } from '../images';
import LoadMoreSentinel from './LoadMoreSentinel';
import styles from './Sidebar.module.css';

interface Props {
  selectedPlaylistId: string | null;
  searchActive: boolean;
  onSelectPlaylist: (playlist: SimplifiedPlaylist) => void;
  onOpenSearch: () => void;
}

export default function Sidebar({ selectedPlaylistId, searchActive, onSelectPlaylist, onOpenSearch }: Props) {
  const { user, logout } = useAuth();
  const playlists = usePlaylists();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.user}>
        <span className={styles.userName}>{user?.display_name ?? user?.id ?? '…'}</span>
        <button className={styles.link} onClick={logout}>
          Salir
        </button>
      </div>

      <button
        className={`${styles.item} ${searchActive ? styles.active : ''}`}
        onClick={onOpenSearch}
      >
        🔍 Buscar
      </button>

      <h2 className={styles.heading}>Tus playlists</h2>
      <ul className={styles.list}>
        {playlists.items.map((playlist) => (
          <li key={playlist.id}>
            <button
              className={`${styles.item} ${playlist.id === selectedPlaylistId ? styles.active : ''}`}
              onClick={() => onSelectPlaylist(playlist)}
              title={playlist.name}
            >
              {pickImage(playlist.images, 40) ? (
                <img className={styles.cover} src={pickImage(playlist.images, 40)!} alt="" loading="lazy" />
              ) : (
                <div className={styles.cover} />
              )}
              <span className={styles.name}>{playlist.name}</span>
            </button>
          </li>
        ))}
      </ul>

      {playlists.loading && <p className={styles.status}>Cargando…</p>}
      {playlists.error && (
        <p className={styles.error}>
          {playlists.error}{' '}
          <button className={styles.link} onClick={playlists.reload}>
            Reintentar
          </button>
        </p>
      )}
      {playlists.hasMore && !playlists.error && (
        <LoadMoreSentinel onVisible={playlists.loadMore} disabled={playlists.loading} />
      )}
    </aside>
  );
}
