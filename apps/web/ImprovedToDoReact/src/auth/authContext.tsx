import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  beginLogin,
  clearTokens,
  getAccessToken,
  isAuthenticated as hasAuth,
  logout as authLogout,
  refreshTokens,
} from "./authService";
import type { AuthContextValue } from "./types";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(() => getAccessToken());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => hasAuth());

  async function login(): Promise<void> {
    await beginLogin();
  }

  async function refreshAccessToken(): Promise<string | null> {
    const token = await refreshTokens();
    setAccessToken(token);
    setIsAuthenticated(!!token);
    return token;
  }

  function syncFromStorage(): void {
    const token = getAccessToken();
    setAccessToken(token);
    setIsAuthenticated(!!token);
  }

  function clearSession(): void {
    clearTokens();
    setAccessToken(null);
    setIsAuthenticated(false);
  }

  function logout(): void {
    authLogout();
    setAccessToken(null);
    setIsAuthenticated(false);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      isAuthenticated,
      login,
      logout,
      refreshAccessToken,
      syncFromStorage,
      clearSession,
    }),
    [accessToken, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}