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

  const makeRequest = (token: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  let response = await makeRequest(accessToken);

  if (response.status === 401) {
    accessToken = await refreshTokens();

    if (!accessToken) {
      clearTokens();
      throw new Error("Session expired.");
    }

    response = await makeRequest(accessToken);
  }

  return response;
}