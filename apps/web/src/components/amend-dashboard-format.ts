export function slugPart(value: string, fallback: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
}

export function titleizeSlug(value: string) {
  return (
    value
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") || "Project"
  );
}

export function normalizeOptionalUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function isCompleteDomainInput(value: string) {
  const normalized = normalizeOptionalUrl(value);
  if (!normalized || /\s/.test(value)) return false;
  try {
    const host = new URL(normalized).hostname.toLowerCase();
    if (host === "localhost") return true;
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return true;
    if (host.includes("..") || !host.includes(".")) return false;
    const labels = host.split(".");
    const tld = labels[labels.length - 1] ?? "";
    return (
      labels.every((label) => /^[a-z0-9-]+$/.test(label) && label.length > 0) && tld.length >= 2
    );
  } catch {
    return false;
  }
}

export function googleFaviconUrl(value: string) {
  const host = hostFromUrl(value);
  return host
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`
    : undefined;
}

export function duckDuckGoFaviconUrl(value: string) {
  const host = hostFromUrl(value);
  return host ? `https://icons.duckduckgo.com/ip3/${encodeURIComponent(host)}.ico` : undefined;
}

export function hostFromUrl(value: string) {
  const normalized = normalizeOptionalUrl(value);
  if (!normalized) return "";
  try {
    return new URL(normalized).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function fallbackProjectNameFromUrl(value: string) {
  const normalized = normalizeOptionalUrl(value);
  if (!normalized) return "";
  try {
    const host = new URL(normalized).hostname.replace(/^www\./, "");
    const root = host.split(".")[0] ?? "";
    return root
      .split(/[-_]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  } catch {
    return "";
  }
}

export function initialsFor(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean);
  return (parts.slice(0, 2).join("") || "AM").toUpperCase();
}

export function formatDate(value?: number) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(value);
}

export function formatState(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function stateValue(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

export function providerLabel(provider: string) {
  const labels: Record<string, string> = {
    databuddy: "DataBuddy",
    discord: "Discord",
    github: "GitHub",
    linear: "Linear",
    posthog: "PostHog",
    slack: "Slack",
    support: "Support",
    x: "X",
  };
  return labels[provider] ?? formatState(provider);
}
