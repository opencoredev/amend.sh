import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import {
  checkForUpdate,
  localVersionMetadata,
  resolveOpenApiPath,
  updateCheckPosture,
} from "./cliRuntime";
import type { CliContext } from "./cliTypes";

export function githubSync(context: CliContext) {
  return {
    mode: "provider_gated",
    project: context.project,
    dryRun: true,
    next: [
      "Set GITHUB_APP_ID, GITHUB_APP_SLUG, GITHUB_APP_CLIENT_ID, GITHUB_APP_CLIENT_SECRET, and GITHUB_APP_PRIVATE_KEY in Convex.",
      "Install the GitHub App for the repository.",
      "Use the dashboard or API to connect the repository and replay webhook fixtures.",
    ],
  };
}

export async function doctor(context: CliContext) {
  const openApiPath = resolveOpenApiPath(context.cwd);
  const localVersion = localVersionMetadata(context.cwd, context.env);
  const update = context.flags.updateCheck
    ? await checkForUpdate(context, localVersion.version)
    : updateCheckPosture(context);
  return {
    endpoint: context.endpoint,
    project: context.project,
    version: localVersion,
    checks: [
      {
        name: "api token",
        status: context.token ? "configured" : "missing_optional",
        detail: context.token
          ? "AMEND_API_TOKEN or --token is present."
          : "Public/demo reads work without it; owner mutations require a token when configured.",
      },
      {
        name: "openapi spec",
        status: existsSync(openApiPath) ? "ok" : "missing",
        detail: openApiPath,
      },
      {
        name: "provider keys",
        status:
          context.env.GITHUB_APP_ID || context.env.GITHUB_WEBHOOK_SECRET
            ? "partially_configured"
            : "demo_mode",
        detail:
          "GitHub, AI, Slack/Discord, email, and Stripe keys unlock live providers but are not required for local demo validation.",
      },
      {
        name: "update check",
        status: update.status,
        detail: update.detail,
      },
    ],
  };
}

export async function version(context: CliContext) {
  const local = localVersionMetadata(context.cwd, context.env);
  return {
    local,
    server: context.flags.server ? await context.amend.version() : undefined,
    update: context.flags.updateCheck ? await checkForUpdate(context, local.version) : undefined,
  };
}

export function generateApiToken(context: CliContext) {
  const token = generateApiTokenValue(context.flags.limit);
  return {
    command: `bunx convex env set AMEND_API_TOKEN "${token}"`,
    env: `AMEND_API_TOKEN=${token}`,
    next: [
      `bunx convex env set AMEND_API_TOKEN "${token}"`,
      `export AMEND_API_TOKEN="${token}"`,
      "Rerun `bun packages/cli/src/index.ts doctor` to confirm the token is configured.",
    ],
    persisted: false,
    scope: "owner",
    token,
    warning:
      "Generated locally for development. Store it in your Convex or hosting environment; Amend does not persist CLI-generated tokens yet.",
  };
}

export function generateApiTokenValue(limit?: number) {
  const bytes = Math.max(16, Math.min(limit ?? 32, 96));
  return `amend_dev_${randomBytes(bytes).toString("base64url")}`;
}
