export type PortalSection = "feedback" | "roadmap" | "updates";

export type PortalRedirectTarget = {
  href: string;
  section?: PortalSection;
  workspaceSlug: string;
};

const portalRedirectPattern = /^\/portal\/([^/?#]+)(?:#(feedback|roadmap|updates))?$/;

export function portalRedirectTo(workspaceSlug: string, section?: PortalSection) {
  const slug = encodeURIComponent(workspaceSlug.trim());
  return section ? `/portal/${slug}#${section}` : `/portal/${slug}`;
}

export function parsePortalRedirectTo(value: unknown): PortalRedirectTarget | null {
  if (typeof value !== "string") return null;

  const match = value.match(portalRedirectPattern);
  if (!match) return null;

  const workspaceSlug = decodeWorkspaceSlug(match[1] ?? "");
  if (!workspaceSlug || workspaceSlug.includes("/")) return null;

  const section = match[2] as PortalSection | undefined;
  return {
    href: portalRedirectTo(workspaceSlug, section),
    section,
    workspaceSlug,
  };
}

function decodeWorkspaceSlug(value: string) {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return "";
  }
}
