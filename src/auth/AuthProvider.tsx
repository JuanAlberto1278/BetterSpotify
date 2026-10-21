import { useEffect, useState, type ReactNode } from 'react';
import { getCurrentUser } from '../api/me';
import { describeError } from '../api/errors';
import type { CurrentUser } from '../api/types';
import { isAuthenticated, login, logout, onAuthChange } from './auth';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(isAuthenticated);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [userError, setUserError] = useState<string | null>(null);

  useEffect(() => onAuthChange(() => setAuthenticated(isAuthenticated())), []);

  useEffect(() => {
    if (!authenticated) return;
    const controller = new AbortController();
    getCurrentUser(controller.signal)
      .then((u) => {
        setUser(u);
        setUserError(null);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setUserError(describeError(err));
      });
    return () => controller.abort();
  }, [authenticated]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authenticated,
        // Sin sesión no se expone el usuario anterior (se reemplaza al volver a entrar).
        user: authenticated ? user : null,
        userError: authenticated ? userError : null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
