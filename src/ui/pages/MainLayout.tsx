import { useCallback, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { useKeyboardShortcuts } from '../../player/useKeyboardShortcuts';
import { navigate } from '../../router/router';
import { paths, type Route } from '../../router/routes';
import ErrorBoundary from '../components/ErrorBoundary';
import LikedView from '../components/LikedView';
import PlayerBar from '../components/PlayerBar';
import PlaylistView from '../components/PlaylistView';
import QueuePanel from '../components/QueuePanel';
import SearchView, { SEARCH_INPUT_ID } from '../components/SearchView';
import Sidebar from '../components/Sidebar';
import styles from './MainLayout.module.css';

export default function MainLayout({ route }: { route: Route }) {
  const { user, userError } = useAuth();
  const [queueOpen, setQueueOpen] = useState(false);

  const toggleQueue = useCallback(() => setQueueOpen((open) => !open), []);
  const focusSearch = useCallback(() => {
    if (route.name !== 'search') navigate(paths.search());
    // Esperar a que se monte el input si veníamos de otra vista.
    requestAnimationFrame(() => document.getElementById(SEARCH_INPUT_ID)?.focus());
  }, [route.name]);

  useKeyboardShortcuts({ onFocusSearch: focusSearch, onToggleQueue: toggleQueue });

  return (
    <div className={`${styles.layout} ${queueOpen ? styles.withQueue : ''}`}>
      <Sidebar route={route} />

      <main className={styles.content}>
        {userError && <p className={styles.error}>{userError}</p>}

        {/* Un error en una vista no tumba el reproductor; al navegar se reintenta. */}
        <ErrorBoundary resetKey={route} title="No se pudo mostrar esta vista">
          {route.name === 'search' && <SearchView query={route.query} />}
          {route.name === 'liked' && <LikedView />}
          {route.name === 'playlist' && <PlaylistView key={route.id} playlistId={route.id} />}
          {(route.name === 'home' || route.name === 'notFound' || route.name === 'callback') && (
            <>
              <h1>Hola{user?.display_name ? `, ${user.display_name}` : ''}</h1>
              <p className={styles.placeholder}>
                {route.name === 'notFound'
                  ? 'Esa página no existe.'
                  : 'Elegí una playlist o buscá una canción.'}
              </p>
            </>
          )}
        </ErrorBoundary>
      </main>

      {queueOpen && (
        <div className={styles.queueSlot}>
          <ErrorBoundary title="No se pudo mostrar la cola">
            <QueuePanel onClose={() => setQueueOpen(false)} />
          </ErrorBoundary>
        </div>
      )}

      <PlayerBar queueOpen={queueOpen} onToggleQueue={toggleQueue} />
    </div>
  );
}
