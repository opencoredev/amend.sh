import { AmendApiError, type JsonValue } from "@amend/sdk";

type OutputFlags = {
  format: "json" | "text";
};

export async function write(stdout: (message: string) => void, flags: OutputFlags, value: unknown) {
  stdout(flags.format === "json" ? JSON.stringify(value, null, 2) : textValue(value));
  return 0;
}

function textValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }
  return JSON.stringify(value, null, 2);
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function errorPayload(error: unknown): Record<string, JsonValue> {
  if (error instanceof AmendApiError) {
    return {
      error: "api_error",
      message: error.message,
      payload: sanitizeJson(error.payload),
      status: error.status,
    };
  }
  if (error instanceof Error) {
    return {
      error: "cli_error",
      message: error.message,
    };
  }
  return {
    error: "unknown_error",
    message: String(error),
  };
}

function sanitizeJson(value: unknown): JsonValue {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeJson(item));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        sanitizeJson(item),
      ]),
    );
  }
  return String(value);
}
