type ClientEnvKey =
  | "VITE_CONVEX_SITE_URL"
  | "VITE_CONVEX_URL"
  | "VITE_POSTHOG_HOST"
  | "VITE_POSTHOG_PROJECT_ID"
  | "VITE_POSTHOG_TOKEN";

export function requiredClientEnv(key: ClientEnvKey) {
  const value = optionalClientEnv(key);
  if (!value) {
    throw new Error(`${key} is not set`);
  }
  return value;
}

export function optionalClientEnv(key: ClientEnvKey) {
  const value = import.meta.env[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}
