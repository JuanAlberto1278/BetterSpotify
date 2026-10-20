import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getCurrentUser } from '../api/me';
import { describeError } from '../api/errors';
import type { CurrentUser } from '../api/types';
import { isAuthenticated, login, logout, onAuthChange } from './auth';

interface AuthContextValue {
  isAuthenticated: boolean;
  /** null mientras carga o si no hay sesión. */
  user: CurrentUser | null;
  userError: string | null;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(isAuthenticated);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [userError, setUserError] = useState<string | null>(null);

  useEffect(() => onAuthChange(() => setAuthenticated(isAuthenticated())), []);

  useEffect(() => {
    if (!authenticated) {
      setUser(null);
      setUserError(null);
      return;
    }
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
      value={{ isAuthenticated: authenticated, user, userError, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
