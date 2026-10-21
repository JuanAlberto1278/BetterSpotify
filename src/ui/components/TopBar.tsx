import { useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { usePlaylists } from '../../data/useLibrary';
import { navigate } from '../../router/router';
import { paths, type Route } from '../../router/routes';
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DiscIcon,
  ExternalIcon,
  HeartIcon,
  KeyboardIcon,
  LibraryIcon,
  LogoIcon,
  LogoutIcon,
  PlaylistIcon,
  SearchIcon,
  SettingsIcon,
} from '../icons';
import { pickImage } from '../images';
import Link from './Link';
import Menu, { MenuHeading, MenuItem, MenuSeparator } from './Menu';
import ShortcutsDialog from './ShortcutsDialog';
import styles from './TopBar.module.css';

export const SEARCH_INPUT_ID = 'search-input';

/** Cuántas playlists se muestran en el acceso rápido del menú Biblioteca. */
const QUICK_PLAYLISTS = 12;

export default function TopBar({ route }: { route: Route }) {
  const { user, logout } = useAuth();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const query = route.name === 'search' ? route.query : '';
  const avatar = pickImage(user?.images, 32);
  const libraryActive = route.name === 'liked' || route.name === 'savedAlbums' || route.name === 'playlists';

  const onSearchChange = (value: string) => {
    // Desde otra vista se agrega una entrada al historial (para poder volver);
    // mientras se escribe en la búsqueda solo se reemplaza.
    // Se mantiene la pestaña de resultados elegida (Todo, Canciones, Artistas...).
    const tab = route.name === 'search' ? route.tab : 'all';
    navigate(paths.search(value, tab), { replace: route.name === 'search' });
  };

  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <Link to={paths.home()} className={styles.logo} aria-label="Inicio">
          <LogoIcon />
        </Link>
        <div className={styles.history}>
          <button className={styles.round} onClick={() => window.history.back()} aria-label="Atrás" title="Atrás">
            <ChevronLeftIcon size={18} />
          </button>
          <button
            className={styles.round}
            onClick={() => window.history.forward()}
            aria-label="Adelante"
            title="Adelante"
          >
            <ChevronRightIcon size={18} />
          </button>
        </div>

        <Menu
          label="Biblioteca"
          triggerClassName={libraryActive ? styles.activeTrigger : ''}
          trigger={
            <>
              <LibraryIcon size={18} />
              <span className={styles.triggerText}>Biblioteca</span>
              <ChevronDownIcon size={14} />
            </>
          }
        >
          {(close) => <LibraryMenu route={route} close={close} />}
        </Menu>
      </div>

      <label className={styles.search}>
        <SearchIcon size={18} />
        <input
          id={SEARCH_INPUT_ID}
          type="search"
          placeholder="¿Qué querés escuchar?"
          value={query}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Buscar"
        />
      </label>

      <div className={styles.right}>
        <Menu
          label="Perfil"
          align="right"
          trigger={
            <>
              {avatar ? (
                <img className={styles.avatar} src={avatar} alt="" />
              ) : (
                <span className={`${styles.avatar} ${styles.avatarFallback}`}>
                  {(user?.display_name ?? user?.id ?? '?').charAt(0).toUpperCase()}
                </span>
              )}
              <span className={styles.triggerText}>{user?.display_name ?? user?.id ?? ''}</span>
              <ChevronDownIcon size={14} />
            </>
          }
        >
          {(close) => (
            <>
              {user && (
                <MenuItem
                  icon={<ExternalIcon size={18} />}
                  href={`https://open.spotify.com/user/${encodeURIComponent(user.id)}`}
                  onSelect={close}
                >
                  Ver perfil en Spotify
                </MenuItem>
              )}
              <MenuItem
                icon={<SettingsIcon size={18} />}
                to={paths.settings()}
                onSelect={close}
                active={route.name === 'settings'}
              >
                Configuración
              </MenuItem>
              <MenuItem
                icon={<KeyboardIcon size={18} />}
                onSelect={() => {
                  close();
                  setShortcutsOpen(true);
                }}
              >
                Atajos de teclado
              </MenuItem>
              <MenuSeparator />
              <MenuItem icon={<LogoutIcon size={18} />} onSelect={logout}>
                Cerrar sesión
              </MenuItem>
            </>
          )}
        </Menu>
      </div>

      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </header>
  );
}

/** Contenido del menú Biblioteca. Se monta solo al abrirlo (ahí pide las playlists). */
function LibraryMenu({ route, close }: { route: Route; close: () => void }) {
  const playlists = usePlaylists();
  const quick = playlists.items.slice(0, QUICK_PLAYLISTS);

  return (
    <>
      <MenuItem icon={<HeartIcon size={18} />} to={paths.liked()} onSelect={close} active={route.name === 'liked'}>
        Tus me gusta
      </MenuItem>
      <MenuItem
        icon={<DiscIcon size={18} />}
        to={paths.savedAlbums()}
        onSelect={close}
        active={route.name === 'savedAlbums'}
      >
        Tus álbumes
      </MenuItem>
      <MenuItem
        icon={<PlaylistIcon size={18} />}
        to={paths.playlists()}
        onSelect={close}
        active={route.name === 'playlists'}
      >
        Tus playlists
      </MenuItem>

      <MenuSeparator />
      <MenuHeading>Playlists</MenuHeading>
      {playlists.loading && quick.length === 0 && <div className={styles.menuStatus}>Cargando…</div>}
      {playlists.error && <div className={styles.menuStatus}>{playlists.error}</div>}
      {quick.map((playlist) => {
        const cover = pickImage(playlist.images, 40);
        return (
          <MenuItem
            key={playlist.id}
            icon={
              cover ? (
                <img className={styles.menuCover} src={cover} alt="" />
              ) : (
                <span className={styles.menuCover}>
                  <PlaylistIcon size={14} />
                </span>
              )
            }
            to={paths.playlist(playlist.id)}
            onSelect={close}
            active={route.name === 'playlist' && route.id === playlist.id}
          >
            {playlist.name}
          </MenuItem>
        );
      })}
      {(playlists.total ?? 0) > QUICK_PLAYLISTS && (
        <MenuItem to={paths.playlists()} onSelect={close}>
          Ver todas ({playlists.total})
        </MenuItem>
      )}
    </>
  );
}
