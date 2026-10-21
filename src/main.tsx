import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initAuth } from './auth/auth';
import { AuthProvider } from './auth/AuthProvider';
import App from './App';
import ErrorBoundary from './ui/components/ErrorBoundary';
import './ui/global.css';

initAuth();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
