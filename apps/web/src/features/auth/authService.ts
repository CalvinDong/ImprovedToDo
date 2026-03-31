import { createPkcePair, randomString } from "./pkce";
import type { TokenResponse } from "./authTypes";
import { envConfig } from "../../shared/envValues";

const AUTH_SERVER = envConfig.AUTH_SERVER;
const CLIENT_ID = envConfig.CLIENT_ID;
const REDIRECT_URI = `${envConfig.SPA_SERVER}/auth/callback`;
const POST_LOGOUT_REDIRECT_URI = `${envConfig.SPA_SERVER}/logout-page`;

const SCOPES = "openid profile offline_access api";

const STORAGE_KEYS = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  idToken: "id_token",
  pkceVerifier: "pkce_code_verifier",
  oauthState: "oauth_state",
} as const;

export async function beginLogin(): Promise<void> {
  const state = randomString(48);
  const { codeVerifier, codeChallenge, codeChallengeMethod } =
    await createPkcePair();

  sessionStorage.setItem(STORAGE_KEYS.pkceVerifier, codeVerifier);
  sessionStorage.setItem(STORAGE_KEYS.oauthState, state);

  const url = new URL(`${AUTH_SERVER}/connect/authorize`);
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", codeChallengeMethod);

  window.location.assign(url.toString());
}

export async function handleAuthCallback(search: string): Promise<TokenResponse> {
  const params = new URLSearchParams(search);

  const code = params.get("code");
  const returnedState = params.get("state");
  const storedState = sessionStorage.getItem(STORAGE_KEYS.oauthState);
  const codeVerifier = sessionStorage.getItem(STORAGE_KEYS.pkceVerifier);

  if (!code) {
    throw new Error("Missing authorization code.");
  }

  if (!returnedState || !storedState || returnedState !== storedState) {
    throw new Error("Invalid OAuth state.");
  }

  if (!codeVerifier) {
    throw new Error("Missing PKCE code verifier.");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const response = await fetch(`${AUTH_SERVER}/connect/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Token exchange failed: ${text}`);
  }

  const data = (await response.json()) as TokenResponse;

  if (data.access_token) {
    localStorage.setItem(STORAGE_KEYS.accessToken, data.access_token);
  }

  if (data.refresh_token) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, data.refresh_token);
  }

  if (data.id_token) {
    localStorage.setItem(STORAGE_KEYS.idToken, data.id_token);
  }

  sessionStorage.removeItem(STORAGE_KEYS.pkceVerifier);
  sessionStorage.removeItem(STORAGE_KEYS.oauthState);

  return data;
}

export async function refreshTokens(): Promise<string | null> {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);

  if (!refreshToken) {
    return null;
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: CLIENT_ID,
    refresh_token: refreshToken,
  });

  const response = await fetch(`${AUTH_SERVER}/connect/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    clearTokens();
    return null;
  }

  const data = (await response.json()) as TokenResponse;

  if (data.access_token) {
    localStorage.setItem(STORAGE_KEYS.accessToken, data.access_token);
  }

  if (data.refresh_token) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, data.refresh_token);
  }

  if (data.id_token) {
    localStorage.setItem(STORAGE_KEYS.idToken, data.id_token);
  }

  return data.access_token ?? null;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.accessToken);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.idToken);
}

export function logout(): void {
  clearTokens();

  const url = new URL(`${AUTH_SERVER}/connect/logout`);
  url.searchParams.set(
    "post_logout_redirect_uri",
    POST_LOGOUT_REDIRECT_URI
  );

  window.location.assign(url.toString());
}