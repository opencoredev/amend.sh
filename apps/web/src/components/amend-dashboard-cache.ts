export function dashboardCacheKey(workspaceId: string, projectSlug?: string) {
  return `amend.dashboard.${workspaceId || "workspace"}.${projectSlug || "workspace"}`;
}

export function projectsCacheKey(workspaceId: string) {
  return `amend.projects.${workspaceId || "workspace"}`;
}

export function readStoredJson<T>(key: string): T | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function writeStoredJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota/private-mode failures; live Convex data still renders.
  }
}
