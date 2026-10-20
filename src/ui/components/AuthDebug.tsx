import { useEffect, useState } from 'react';
import { getTokenExpiry, onAuthChange, refreshAccessToken } from '../../auth/auth';

/** Panel temporal para verificar el refresh de tokens. Se puede borrar sin afectar nada. */
export default function AuthDebug() {
  const [expiry, setExpiry] = useState(getTokenExpiry);
  const [now, setNow] = useState(Date.now);
  const [status, setStatus] = useState('');

  useEffect(() => onAuthChange(() => setExpiry(getTokenExpiry())), []);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const forceRefresh = () => {
    setStatus('Refrescando…');
    refreshAccessToken()
      .then(() => setStatus(`Refrescado a las ${new Date().toLocaleTimeString()}`))
      .catch((err: Error) => setStatus(`Error: ${err.message}`));
  };

  const secondsLeft = expiry ? Math.round((expiry - now) / 1000) : null;

  return (
    <section style={{ marginTop: '2rem', opacity: 0.8, fontSize: '0.9rem' }}>
      <h3>Debug de sesión</h3>
      <p>
        Token vence en: {secondsLeft !== null ? `${Math.floor(secondsLeft / 60)}m ${secondsLeft % 60}s` : '—'}
        {' '}(el refresh automático corre ~60 s antes)
      </p>
      <button onClick={forceRefresh}>Forzar refresh</button> <span>{status}</span>
    </section>
  );
}
