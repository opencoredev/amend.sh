import { DEMO_SLUG, planCatalog } from "./amendDemoData";

declare const process: {
  env: {
    GITHUB_APP_SLUG?: string;
    SITE_URL?: string;
  };
};

export function workspaceSlug(slug?: string) {
  return slug?.trim() || DEMO_SLUG;
}

export function dashboardSiteUrl() {
  return (process.env.SITE_URL ?? "https://amend.sh").replace(/\/$/, "");
}

export function isLocalAuthSiteUrl(siteUrlValue = process.env.SITE_URL) {
  const siteUrl = siteUrlValue?.trim();
  if (!siteUrl) {
    return false;
  }

  try {
    const normalizedSiteUrl = normalizeSiteUrlCandidate(siteUrl);
    if (!normalizedSiteUrl) return false;
    const parsed = new URL(normalizedSiteUrl);
    return isHttpProtocol(parsed.protocol) && isLocalHostname(parsed.hostname);
  } catch {
    return false;
  }
}

export const seededDemoLocalOnlyMessage =
  "Seeded demo sign-in is only available for local development.";

export function assertSeededDemoLocalAuthAllowed() {
  if (!isLocalAuthSiteUrl()) {
    throw new Error(seededDemoLocalOnlyMessage);
  }
}

function normalizeSiteUrlCandidate(siteUrl: string) {
  if (siteUrl.startsWith("//") || /\s/.test(siteUrl)) return null;

  const hasProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(siteUrl);
  const normalizedSiteUrl = hasProtocol ? siteUrl : `http://${siteUrl}`;
  const protocol = normalizedSiteUrl.match(/^[a-z][a-z0-9+.-]*:/i)?.[0] ?? "";
  const protocolSeparator = normalizedSiteUrl.slice(protocol.length);
  if (protocolSeparator.startsWith("///")) return null;

  return normalizedSiteUrl;
}

function isHttpProtocol(protocol: string) {
  return protocol === "http:" || protocol === "https:";
}

function isLocalHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost")
  );
}

export function githubAppInstallUrl(workspaceSlugValue?: string) {
  const slug = process.env.GITHUB_APP_SLUG?.trim();
  if (!slug) return undefined;
  const state = JSON.stringify({
    returnTo: `${dashboardSiteUrl()}/dashboard/setup/github`,
    workspace: workspaceSlug(workspaceSlugValue),
  });
  return `https://github.com/apps/${slug}/installations/new?state=${encodeURIComponent(state)}`;
}

export function slugPart(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return slug || "feedback";
}

export function projectKey(value: string) {
  return `project-${slugPart(value)}`;
}

export function planByTier(tier: (typeof planCatalog)[number]["tier"] | "enterprise") {
  return (
    planCatalog.find((plan) => plan.tier === tier) ?? {
      tier: "enterprise" as const,
      name: "Enterprise",
      priceMonthly: undefined,
      limits: { trackedRepos: 1_000, reviewers: 1_000, monthlyNotifications: 1_000_000 },
      posture: {
        publicRoadmap: true,
        communityFeedback: true,
        sourceLinkedPublishing: true,
        selfHostFriendly: true,
      },
      notes: "Custom contract with dedicated support, security review, and deployment options.",
    }
  );
}

export function isOpenFeedbackStatus(status: string) {
  return status !== "closed" && status !== "shipped";
}

export function isDraftChangelogStatus(status: string) {
  return status === "draft" || status === "in_review";
}

export function isPublicChangelogStatus(status: string) {
  return status === "published" || status === "in_review";
}

export function compact<T>(items: Array<T | null | undefined>) {
  return items.filter((item): item is T => item !== null && item !== undefined);
}
