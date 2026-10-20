import { useState } from 'react';
import { useAuth } from '../../auth/AuthProvider';
import { CLIENT_ID } from '../../config';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = () => {
    setError(null);
    login().catch((err: Error) => setError(err.message));
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>BetterSpotify</h1>
      {!CLIENT_ID && (
        <p className={styles.error}>
          Falta <code>VITE_SPOTIFY_CLIENT_ID</code> en el archivo <code>.env</code>. Reiniciá{' '}
          <code>npm run dev</code> después de agregarlo.
        </p>
      )}
      <button className={styles.button} onClick={handleLogin} disabled={!CLIENT_ID}>
        Iniciar sesión con Spotify
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </main>
  );
}
