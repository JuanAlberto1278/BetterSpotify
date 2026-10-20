import { useState } from 'react';
import type { SimplifiedPlaylist } from '../../api/types';
import { useAuth } from '../../auth/AuthProvider';
import PlayerBar from '../components/PlayerBar';
import PlaylistView from '../components/PlaylistView';
import SearchView from '../components/SearchView';
import Sidebar from '../components/Sidebar';
import styles from './MainLayout.module.css';

type View = { type: 'home' } | { type: 'search' } | { type: 'playlist'; playlist: SimplifiedPlaylist };

export default function MainLayout() {
  const { user, userError } = useAuth();
  const [view, setView] = useState<View>({ type: 'home' });
  // Vive acá para que la búsqueda se conserve al ir y volver de una playlist.
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className={styles.layout}>
      <Sidebar
        selectedPlaylistId={view.type === 'playlist' ? view.playlist.id : null}
        searchActive={view.type === 'search'}
        onSelectPlaylist={(playlist) => setView({ type: 'playlist', playlist })}
        onOpenSearch={() => setView({ type: 'search' })}
      />

      <main className={styles.content}>
        {userError && <p className={styles.error}>{userError}</p>}

        {view.type === 'home' && (
          <>
            <h1>Hola{user?.display_name ? `, ${user.display_name}` : ''}</h1>
            <p className={styles.placeholder}>Elegí una playlist o buscá una canción.</p>
          </>
        )}
        {view.type === 'search' && <SearchView query={searchQuery} onQueryChange={setSearchQuery} />}
        {view.type === 'playlist' && <PlaylistView key={view.playlist.id} playlist={view.playlist} />}
      </main>

      <PlayerBar />
    </div>
  );
}
