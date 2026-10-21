import { useAuth } from '../../auth/useAuth';
import { usePlaylists } from '../../data/useLibrary';
import PlaylistGrid from './PlaylistGrid';
import styles from './View.module.css';

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

      <h2 className={styles.sectionTitle}>Tus playlists</h2>
      <PlaylistGrid list={playlists} />
    </section>
  );
}
