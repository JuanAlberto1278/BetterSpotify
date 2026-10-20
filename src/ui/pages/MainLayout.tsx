import { useAuth } from '../../auth/AuthProvider';
import AuthDebug from '../components/AuthDebug';
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
        {/* Temporal (etapa 1): para probar el refresh. */}
        <AuthDebug />
      </main>
    </div>
  );
}
