import { useAuth } from '../../auth/useAuth';
import { staticList } from '../../data/usePagedList';
import { usePlaylists, useRecentlyPlayed } from '../../data/useLibrary';
import { usePlayer } from '../../player/usePlayer';
import PlaylistGrid from './PlaylistGrid';
import TrackList from './TrackList';
import styles from './View.module.css';

/** Cuántas canciones recientes se muestran. */
const RECENT_COUNT = 8;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Buenas noches';
  if (hour < 13) return 'Buen día';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function HomeView({ notFound = false }: { notFound?: boolean }) {
  const { user } = useAuth();
  const playlists = usePlaylists();

  return (
    <section>
      <h1 className={styles.pageTitle}>
        {greeting()}
        {user?.display_name ? `, ${user.display_name}` : ''}
      </h1>
      {notFound && <p className={styles.meta}>Esa página no existe. Te dejamos en el inicio.</p>}

      <RecentlyPlayed />

      <h2 className={styles.sectionTitle}>Tus playlists</h2>
      <PlaylistGrid list={playlists} />
    </section>
  );
}

function RecentlyPlayed() {
  const recent = useRecentlyPlayed();
  const { playTracks } = usePlayer();
  const tracks = recent.data?.slice(0, RECENT_COUNT) ?? [];

  // Sin historial (o si falla) la sección no se muestra: no es crítica.
  if (recent.error || (recent.data && tracks.length === 0)) return null;

  return (
    <section className={styles.resultSection}>
      <h2 className={styles.sectionTitle}>Escuchado recientemente</h2>
      {recent.data ? (
        <TrackList
          list={staticList(tracks)}
          // Se encola el historial para que "siguiente" avance por él.
          onPlay={(index) => playTracks(tracks.map((t) => t.uri), index)}
        />
      ) : (
        <p className={styles.meta}>Cargando…</p>
      )}
    </section>
  );
}
