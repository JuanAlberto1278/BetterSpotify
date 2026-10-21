import { savedTracksContextUri } from '../../api/library';
import { useAuth } from '../../auth/useAuth';
import { useLibraryStatus } from '../../data/libraryStore';
import { useSavedTracks } from '../../data/useLibrary';
import { usePlayer } from '../../player/usePlayer';
import { HeartIcon, PlayIcon } from '../icons';
import TrackList from './TrackList';
import styles from './View.module.css';

export default function LikedView() {
  const { user } = useAuth();
  const allTracks = useSavedTracks();
  const { playContext, playTracks } = usePlayer();

  // Lo que quitás con el ♥ desaparece al instante, sin recargar la lista.
  const isSaved = useLibraryStatus(allTracks.items.map((t) => t.uri));
  const tracks = { ...allTracks, items: allTracks.items.filter((t) => isSaved(t.uri) !== false) };
  const removed = allTracks.items.length - tracks.items.length;
  const total = allTracks.total !== null ? allTracks.total - removed : null;

  const play = (index?: number) => {
    const uris = tracks.items.map((t) => t.uri);
    if (!user) {
      playTracks(uris, index ?? 0);
      return;
    }
    // Se intenta como contexto (sigue con todas tus canciones); si Spotify lo
    // rechaza, se reproducen las canciones ya cargadas.
    playContext(savedTracksContextUri(user.id), {
      trackUri: index !== undefined ? uris[index] : undefined,
      fallbackUris: uris,
    });
  };

  return (
    <section>
      <header className={styles.header}>
        <div className={`${styles.cover} ${styles.likedCover}`}>
          <HeartIcon size={64} />
        </div>
        <div>
          <p className={styles.kicker}>Playlist</p>
          <h1 className={styles.title}>Tus me gusta</h1>
          <p className={styles.meta}>{total !== null && `${total} canciones`}</p>
          <button className={styles.playAll} onClick={() => play()} disabled={tracks.items.length === 0}>
            <PlayIcon size={16} /> Reproducir
          </button>
        </div>
      </header>

      <TrackList list={tracks} onPlay={play} emptyText="Todavía no tenés canciones guardadas." />
    </section>
  );
}
