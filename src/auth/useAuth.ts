import { createContext, useContext } from 'react';
import type { CurrentUser } from '../api/types';

export interface AuthContextValue {
  isAuthenticated: boolean;
  /** null mientras carga o si no hay sesión. */
  user: CurrentUser | null;
  userError: string | null;
  login: () => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
