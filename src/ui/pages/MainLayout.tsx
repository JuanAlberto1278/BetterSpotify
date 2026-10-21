import { useCallback, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { useKeyboardShortcuts } from '../../player/useKeyboardShortcuts';
import type { Route } from '../../router/routes';
import AlbumView from '../components/AlbumView';
import ArtistView from '../components/ArtistView';
import ErrorBoundary from '../components/ErrorBoundary';
import HomeView from '../components/HomeView';
import LikedView from '../components/LikedView';
import PlayerBar from '../components/PlayerBar';
import PlaylistsView from '../components/PlaylistsView';
import PlaylistView from '../components/PlaylistView';
import QueuePanel from '../components/QueuePanel';
import SavedAlbumsView from '../components/SavedAlbumsView';
import SearchView from '../components/SearchView';
import SettingsView from '../components/SettingsView';
import TopBar, { SEARCH_INPUT_ID } from '../components/TopBar';
import styles from './MainLayout.module.css';

export default function MainLayout({ route }: { route: Route }) {
  const { userError } = useAuth();
  const [queueOpen, setQueueOpen] = useState(false);

  const toggleQueue = useCallback(() => setQueueOpen((open) => !open), []);
  const focusSearch = useCallback(() => {
    const input = document.getElementById(SEARCH_INPUT_ID) as HTMLInputElement | null;
    input?.focus();
    input?.select();
  }, []);

  useKeyboardShortcuts({ onFocusSearch: focusSearch, onToggleQueue: toggleQueue });

  return (
    <div className={`${styles.layout} ${queueOpen ? styles.withQueue : ''}`}>
      <div className={styles.top}>
        <TopBar route={route} />
      </div>

      <main className={styles.content}>
        {userError && <p className={styles.error}>{userError}</p>}

        {/* Un error en una vista no tumba el reproductor; al navegar se reintenta. */}
        <ErrorBoundary resetKey={route} title="No se pudo mostrar esta vista">
          <View route={route} />
        </ErrorBoundary>
      </main>

      {queueOpen && (
        <div className={styles.queueSlot}>
          <ErrorBoundary title="No se pudo mostrar la cola">
            <QueuePanel onClose={() => setQueueOpen(false)} />
          </ErrorBoundary>
        </div>
      )}

      <div className={styles.player}>
        <PlayerBar queueOpen={queueOpen} onToggleQueue={toggleQueue} />
      </div>
    </div>
  );
}

function View({ route }: { route: Route }) {
  switch (route.name) {
    case 'search':
      return <SearchView query={route.query} tab={route.tab} />;
    case 'liked':
      return <LikedView />;
    case 'savedAlbums':
      return <SavedAlbumsView />;
    case 'playlists':
      return <PlaylistsView />;
    case 'playlist':
      return <PlaylistView key={route.id} playlistId={route.id} />;
    case 'album':
      return <AlbumView key={route.id} albumId={route.id} />;
    case 'artist':
      return <ArtistView key={route.id} artistId={route.id} />;
    case 'settings':
      return <SettingsView />;
    case 'notFound':
      return <HomeView notFound />;
    default:
      return <HomeView />;
  }
}
