import { useAuth } from './auth/useAuth';
import { PlayerProvider } from './player/PlayerProvider';
import { navigate, useRoute } from './router/router';
import { paths } from './router/routes';
import CallbackPage from './ui/pages/CallbackPage';
import LoginPage from './ui/pages/LoginPage';
import MainLayout from './ui/pages/MainLayout';

const goHome = () => navigate(paths.home(), { replace: true });

export default function App() {
  const { isAuthenticated } = useAuth();
  const route = useRoute();

  if (route.name === 'callback') return <CallbackPage onDone={goHome} />;
  if (!isAuthenticated) return <LoginPage />;
  return (
    <PlayerProvider>
      <MainLayout route={route} />
    </PlayerProvider>
  );
}
