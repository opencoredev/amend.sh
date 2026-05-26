declare const process: {
  env: {
    GITHUB_APP_ID?: string;
    GITHUB_APP_PRIVATE_KEY?: string;
  };
};

function base64UrlEncode(input: ArrayBuffer | string) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToArrayBuffer(pem: string) {
  const normalized = pem.replace(/\\n/g, "\n");
  const encoded = normalized
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

export async function createGitHubAppJwt() {
  const appId = process.env.GITHUB_APP_ID?.trim();
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.trim();
  if (!appId || !privateKey) {
    throw new Error("GitHub App credentials are not configured.");
  }
  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new Error("GitHub App private key must be PKCS8 PEM format.");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      exp: now + 9 * 60,
      iat: now - 60,
      iss: appId,
    }),
  );
  const unsignedToken = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey),
    { hash: "SHA-256", name: "RSASSA-PKCS1-v1_5" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedToken),
  );
  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

export async function githubJson<T>(url: string, token: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("accept", "application/vnd.github+json");
  headers.set("authorization", token.startsWith("Bearer ") ? token : `Bearer ${token}`);
  headers.set("user-agent", "amend-sh");
  headers.set("x-github-api-version", "2022-11-28");

  const response = await fetch(url, {
    ...init,
    headers,
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`GitHub returned ${response.status}${detail ? `: ${detail}` : ""}`);
  }
  return (await response.json()) as T;
}
