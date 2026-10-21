import { useAuth } from '../../auth/useAuth';
import { usePlaylists } from '../../data/useLibrary';
import { SHORTCUTS } from '../../player/useKeyboardShortcuts';
import { navigate } from '../../router/router';
import { paths, type Route } from '../../router/routes';
import { DiscIcon, HeartIcon, SearchIcon } from '../icons';
import { pickImage } from '../images';
import LoadMoreSentinel from './LoadMoreSentinel';
import styles from './Sidebar.module.css';

export default function Sidebar({ route }: { route: Route }) {
  const { user, logout } = useAuth();
  const playlists = usePlaylists();

  const itemClass = (active: boolean) => `${styles.item} ${active ? styles.active : ''}`;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.user}>
        <button className={styles.userName} onClick={() => navigate(paths.home())}>
          {user?.display_name ?? user?.id ?? '…'}
        </button>
        <button className={styles.link} onClick={logout}>
          Salir
        </button>
      </div>

      <button className={itemClass(route.name === 'search')} onClick={() => navigate(paths.search())}>
        <span className={styles.icon}>
          <SearchIcon size={22} />
        </span>
        Buscar
      </button>
      <button className={itemClass(route.name === 'liked')} onClick={() => navigate(paths.liked())}>
        <span className={`${styles.cover} ${styles.likedCover}`}>
          <HeartIcon size={18} />
        </span>
        <span className={styles.name}>Tus me gusta</span>
      </button>
      <button className={itemClass(route.name === 'savedAlbums')} onClick={() => navigate(paths.savedAlbums())}>
        <span className={`${styles.cover} ${styles.likedCover}`}>
          <DiscIcon size={18} />
        </span>
        <span className={styles.name}>Tus álbumes</span>
      </button>

      <h2 className={styles.heading}>Tus playlists</h2>
      <ul className={styles.list}>
        {playlists.items.map((playlist) => {
          const cover = pickImage(playlist.images, 40);
          return (
            <li key={playlist.id}>
              <button
                className={itemClass(route.name === 'playlist' && route.id === playlist.id)}
                onClick={() => navigate(paths.playlist(playlist.id))}
                title={playlist.name}
              >
                {cover ? (
                  <img className={styles.cover} src={cover} alt="" loading="lazy" />
                ) : (
                  <div className={styles.cover} />
                )}
                <span className={styles.name}>{playlist.name}</span>
              </button>
            </li>
          );
        })}
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

      <details className={styles.shortcuts}>
        <summary>Atajos de teclado</summary>
        <dl>
          {SHORTCUTS.map(({ keys, action }) => (
            <div key={keys} className={styles.shortcut}>
              <dt>{keys}</dt>
              <dd>{action}</dd>
            </div>
          ))}
        </dl>
      </details>
    </aside>
  );
}
