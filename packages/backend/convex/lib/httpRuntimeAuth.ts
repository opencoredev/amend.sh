import { verifyGitHubWebhookSignature } from "./signatures";
import { isLocalAuthSiteUrl } from "./amendBackendUtils";

declare const process: {
  env: {
    AMEND_API_TOKEN?: string;
    GITHUB_WEBHOOK_SECRET?: string;
    SITE_URL?: string;
  };
};

const protectedGetResources = new Set([
  "agent-runs",
  "build-briefs",
  "decisions",
  "deliveries",
  "projects",
  "settings",
  "source-events",
]);

const protectedPostResources = new Set([
  "changelog",
  "deliveries",
  "domains",
  "drafts",
  "checkout",
  "integrations",
  "members",
  "plans",
  "projects",
  "portal-settings",
  "repositories",
  "roadmap",
  "rules",
  "source-events",
]);

export function requiresGetApiToken(resource: string) {
  return requiresOwnerApiToken(protectedGetResources.has(resource));
}

export function requiresApiToken(resource: string, body: Record<string, unknown>) {
  if (protectedPostResources.has(resource)) {
    return requiresOwnerApiToken(true);
  }
  if (resource === "preferences" && body.unsubscribed !== true) {
    return requiresOwnerApiToken(true);
  }
  return false;
}

export function verifyApiToken(request: Request) {
  const expected = process.env.AMEND_API_TOKEN;
  if (!expected) {
    return { error: "Missing Amend API token configuration", ok: false as const };
  }

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    return { error: "Missing Amend API token", ok: false as const };
  }

  const actual = header.slice("Bearer ".length);
  return timingSafeEqualText(actual, expected)
    ? { ok: true as const }
    : { error: "Invalid Amend API token", ok: false as const };
}

export async function verifyGitHubSignature(request: Request, rawBody: string) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  // Allow unsigned deliveries ONLY as the intentional local-dev affordance:
  // a local SITE_URL AND no webhook secret configured. In any non-local (prod)
  // environment a missing secret must reject rather than accept forged unsigned
  // webhooks, so we never pass allowUnsigned there. When a secret IS set the
  // helper always requires a valid signature regardless of this flag.
  const allowUnsigned = isLocalAuthSiteUrl(process.env.SITE_URL) && !secret;
  return await verifyGitHubWebhookSignature(
    rawBody,
    request.headers.get("x-hub-signature-256"),
    secret,
    { allowUnsigned },
  );
}

function requiresOwnerApiToken(protectedResource: boolean) {
  if (!protectedResource) {
    return false;
  }
  return Boolean(process.env.AMEND_API_TOKEN) || !isLocalAuthSiteUrl(process.env.SITE_URL);
}

function timingSafeEqualText(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}
