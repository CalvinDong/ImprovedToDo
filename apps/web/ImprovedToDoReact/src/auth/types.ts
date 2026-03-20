export interface TokenResponse {
  token_type?: string;
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  scope?: string;
}

export interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
  syncFromStorage: () => void;
  clearSession: () => void;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
}