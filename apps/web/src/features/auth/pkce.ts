function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function randomString(length = 64): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    result += chars[bytes[i] % chars.length];
  }

  return result;
}

async function sha256(value: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  return await crypto.subtle.digest("SHA-256", data);
}

export async function createPkcePair(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: "S256";
}> {
  const codeVerifier = randomString(96);
  const hashed = await sha256(codeVerifier);

  return {
    codeVerifier,
    codeChallenge: base64UrlEncode(hashed),
    codeChallengeMethod: "S256",
  };
}