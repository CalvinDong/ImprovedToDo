import {
  clearTokens,
  getAccessToken,
  refreshTokens,
} from "../auth/authService";
import { envConfig } from "../utils/envValues";

const API_BASE_URL = envConfig.AUTH_SERVER;

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  let accessToken = getAccessToken();

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  if (response.status === 401) {
    accessToken = await refreshTokens();

    if (!accessToken) {
      clearTokens();
      throw new Error("Session expired.");
    }

    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.headers ?? {}),
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  return response;
}