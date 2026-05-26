export type JsonValue =
  | boolean
  | null
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };

export type AmendClientOptions = {
  apiBaseUrl?: string;
  fetch?: typeof fetch;
  project: string;
  token?: string;
};
