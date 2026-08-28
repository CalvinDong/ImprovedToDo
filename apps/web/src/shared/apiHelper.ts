import { apiFetch } from "./apiFetch";

export async function getJson<TResponse>(path: string): Promise<TResponse> {
  const response = await apiFetch(path);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

export async function sendJson<TRequest, TResponse>(
  path: string,
  method: "POST" | "PUT" | "PATCH",
  data: TRequest
): Promise<TResponse> {
  const response = await apiFetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error("Expected JSON response");
  }

  return response.json();
}

export async function deleteRequest(path: string): Promise<void> {
  const response = await apiFetch(path, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Request failed");
  }
}