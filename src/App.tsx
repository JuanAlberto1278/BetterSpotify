import { useCallback, useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import { PlayerProvider } from './player/PlayerProvider';
import CallbackPage from './ui/pages/CallbackPage';
import LoginPage from './ui/pages/LoginPage';
import MainLayout from './ui/pages/MainLayout';

export default function App() {
  const { isAuthenticated } = useAuth();
  const [path, setPath] = useState(window.location.pathname);

  const navigate = useCallback((to: string) => {
    window.history.replaceState(null, '', to);
    setPath(to);
  }, []);

  if (path === '/callback') return <CallbackPage onDone={() => navigate('/')} />;
  if (!isAuthenticated) return <LoginPage />;
  return (
    <PlayerProvider>
      <MainLayout />
    </PlayerProvider>
  );
}
