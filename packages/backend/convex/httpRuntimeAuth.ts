import { verifyGitHubWebhookSignature } from "./signatures";

declare const process: {
  env: {
    AMEND_API_TOKEN?: string;
    GITHUB_WEBHOOK_SECRET?: string;
  };
};

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

export function requiresApiToken(resource: string, body: Record<string, unknown>) {
  if (!process.env.AMEND_API_TOKEN) {
    return false;
  }
  if (protectedPostResources.has(resource)) {
    return true;
  }
  if (resource === "preferences" && body.unsubscribed !== true) {
    return true;
  }
  return false;
}

export function verifyApiToken(request: Request) {
  const expected = process.env.AMEND_API_TOKEN;
  if (!expected) {
    return { ok: true as const };
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
  return await verifyGitHubWebhookSignature(
    rawBody,
    request.headers.get("x-hub-signature-256"),
    process.env.GITHUB_WEBHOOK_SECRET,
  );
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
