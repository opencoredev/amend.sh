export type RequestOptions = {
  body?: unknown;
  headers?: Record<string, string | undefined>;
  method?: "GET" | "POST";
  search?: Record<string, string | undefined>;
};

export class AmendApiError extends Error {
  constructor(
    readonly status: number,
    readonly payload: unknown,
  ) {
    super(`Amend API request failed with status ${status}`);
  }
}

export function normalizeApiBaseUrl(apiBaseUrl: string) {
  return apiBaseUrl.replace(/\/+$/, "");
}

export function stripLocalOrigin(url: URL) {
  if (url.origin === "http://amend.local") {
    return `${url.pathname}${url.search}`;
  }
  return url.toString();
}

export function definedHeaders(headers: Record<string, string | undefined> | undefined) {
  return Object.fromEntries(
    Object.entries(headers ?? {}).filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
}

export async function parseJsonResponse(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
