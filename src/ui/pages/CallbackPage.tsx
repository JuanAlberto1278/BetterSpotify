import { useEffect, useState } from 'react';
import { handleCallback } from '../../auth/auth';
import styles from './LoginPage.module.css';

export default function CallbackPage({ onDone }: { onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleCallback()
      .then(onDone)
      .catch((err: Error) => setError(err.message));
  }, [onDone]);

  return (
    <main className={styles.page}>
      {error ? (
        <>
          <p className={styles.error}>{error}</p>
          <a href="/">Volver al inicio</a>
        </>
      ) : (
        <p>Conectando con Spotify…</p>
      )}
    </main>
  );
}
