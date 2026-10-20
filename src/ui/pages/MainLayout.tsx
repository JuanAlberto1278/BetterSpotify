import { useAuth } from '../../auth/AuthProvider';
import PlayerBar from '../components/PlayerBar';
import styles from './MainLayout.module.css';

export default function MainLayout() {
  const { user, userError, logout } = useAuth();

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <span>{user ? `Hola, ${user.display_name ?? user.id}` : 'Cargando…'}</span>
        <button onClick={logout}>Cerrar sesión</button>
      </header>
      <main className={styles.content}>
        {userError && <p className={styles.error}>{userError}</p>}
        <p className={styles.placeholder}>
          Las playlists y la búsqueda llegan en la etapa 3. Por ahora podés elegir
          “BetterSpotify” como dispositivo desde la app de Spotify y controlarlo desde acá.
        </p>
      </main>
      <PlayerBar />
    </div>
  );
}
