import {
  AmendApiError,
  definedHeaders,
  normalizeApiBaseUrl,
  parseJsonResponse,
  stripLocalOrigin,
} from "./http";
import type { RequestOptions } from "./http";
import type { AmendClientOptions } from "./types";

export class AmendTransport {
  readonly apiBaseUrl: string;
  readonly project: string;

  private readonly fetchImpl: typeof fetch;
  private readonly token?: string;

  constructor(options: AmendClientOptions) {
    this.project = options.project;
    this.token = options.token;
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
    this.apiBaseUrl = normalizeApiBaseUrl(options.apiBaseUrl ?? "/api/v1");
  }

  protected async request<T = unknown>(path: string, options: RequestOptions = {}) {
    return await this.requestPath<T>(`${this.project}/${path}`, options);
  }

  protected async requestGlobal<T = unknown>(path: string, options: RequestOptions = {}) {
    return await this.requestPath<T>(path, options);
  }

  private async requestPath<T = unknown>(path: string, options: RequestOptions = {}) {
    const method = options.method ?? "GET";
    const url = new URL(`${this.apiBaseUrl}/${path.replace(/^\/+/, "")}`, "http://amend.local");

    for (const [key, value] of Object.entries(options.search ?? {})) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }

    const response = await this.fetchImpl(stripLocalOrigin(url), {
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      headers: {
        Accept: "application/json",
        ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...definedHeaders(options.headers),
      },
      method,
    });

    const payload = await parseJsonResponse(response);
    if (!response.ok) {
      throw new AmendApiError(response.status, payload);
    }
    return payload as T;
  }
}
