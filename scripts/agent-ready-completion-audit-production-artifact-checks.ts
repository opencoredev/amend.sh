import { excludesAll, includesAll } from "./agent-ready-completion-audit-helpers";
import type {
  CompletionArtifactCheckAdder,
  CompletionAuditContext,
  CompletionAuditRootPackage,
} from "./agent-ready-completion-audit-artifact-types";

export function addProductionArtifactChecks(
  add: CompletionArtifactCheckAdder,
  context: CompletionAuditContext,
  rootPackage: CompletionAuditRootPackage,
) {
  add(
    "crawlable public content is verified by build validator",
    includesAll(context.builtValidator, [
      "webPublicPages",
      "built web route bundle exposes crawlable copy",
      "built docs HTML exposes",
      "built docs Markdown mirror exposes",
      "isParseableJsonObject",
    ]),
  );
  add(
    "live validator covers production fetch, metadata, schema, noindex, and AI user agents",
    includesAll(context.liveValidator, [
      "checkAiUserAgentAccess",
      "has valid JSON-LD",
      "stays on expected origin",
      "x-robots-tag allows indexing",
      "noindex, nofollow",
      "checkLlmsLinksAgainstSitemaps",
      "parseJsonObject",
      "is parseable JSON object",
    ]),
  );
  add(
    "production report command preserves strict readiness, built, status, and live gates",
    includesAll(context.productionReporter, [
      "readinessStrict",
      "built",
      "status",
      "live",
      "blockersFrom",
    ]),
  );
  add(
    "production env contract is shared by strict readiness and status",
    includesAll(context.productionEnvContract, [
      "productionEnvChecks",
      "requiredProductionEnv",
      "webProductionEnvKeys",
      "VITE_CONVEX_URL",
      "VITE_POSTHOG_TOKEN",
      "POSTHOG_API_KEY",
      "STRIPE_WEBHOOK_SECRET",
    ]) &&
      includesAll(context.statusReporter, [
        "./agent-ready-production-env",
        "requiredProductionEnv",
        "productionEnv",
      ]),
  );
  add(
    "production launch handoff uses Amend.sh origins",
    includesAll(context.productionEnvExample, [
      "VITE_DOCS_URL=https://docs.amend.sh/docs",
      "SITE_URL=https://amend.sh",
      "EMAIL_FROM=Amend <updates@amend.sh>",
    ]) &&
      includesAll(context.launchRunbook, [
        'bunx convex env set SITE_URL "https://amend.sh"',
        'bunx convex env set EMAIL_FROM "Amend <updates@amend.sh>"',
        "VITE_DOCS_URL=https://docs.amend.sh/docs",
      ]) &&
      includesAll(context.docsLaunchPage, [
        "bunx convex env set SITE_URL https://amend.sh",
        "https://amend.sh/portal/acme",
        "https://docs.amend.sh/docs",
      ]) &&
      excludesAll(context.productionEnvExample, ["SITE_URL=https://updates.example.com"]) &&
      !context.launchRunbook.includes(
        'bunx convex env set SITE_URL "https://updates.example.com"',
      ) &&
      !context.docsLaunchPage.includes("bunx convex env set SITE_URL https://updates.example.com"),
  );
  add(
    "completion docs map prompt requirements to artifacts",
    includesAll(context.agentReadyAudit, [
      "Prompt-To-Artifact Checklist",
      "Maximum-visibility",
      "Crawlable content",
      "Live production validator",
    ]) &&
      includesAll(context.completionAudit, [
        "Agent-Ready Objective Checklist",
        "Public production validation",
        "Blocked externally",
      ]),
  );
  addPackageGateChecks(add, context, rootPackage);
}

function addPackageGateChecks(
  add: CompletionArtifactCheckAdder,
  context: CompletionAuditContext,
  rootPackage: CompletionAuditRootPackage,
) {
  add(
    "package exposes completion audit and production gates",
    rootPackage.scripts?.["agent-ready:completion-audit"] ===
      "bun scripts/agent-ready-completion-audit.ts" &&
      rootPackage.scripts?.["agent-ready:completion-audit:json"] ===
        "bun scripts/agent-ready-completion-audit.ts --json" &&
      rootPackage.scripts?.["agent-ready:completion-audit:validate-report"] ===
        "bun scripts/agent-ready-completion-audit-report-validate.ts" &&
      rootPackage.scripts?.["agent-ready:live:validate-report"] ===
        "bun scripts/agent-ready-live-report-validate.ts" &&
      rootPackage.scripts?.["agent-ready:status:validate-report"] ===
        "bun scripts/agent-ready-status-report-validate.ts" &&
      rootPackage.scripts?.["agent-ready:production"] ===
        "bun run readiness:strict && bun run agent-ready:built && bun run agent-ready:live" &&
      rootPackage.scripts?.["agent-ready:refresh-report"] ===
        "bun scripts/agent-ready-refresh-report.ts" &&
      rootPackage.scripts?.["agent-ready:final-gate"] === "bun scripts/agent-ready-final-gate.ts" &&
      rootPackage.scripts?.["agent-ready:audit:check"] ===
        "bun run agent-ready:production:validate-report agent-ready-production-report.json && bun run agent-ready:live:validate-report agent-ready-live-report.json && bun run agent-ready:status:validate-report agent-ready-status.json && bun run agent-ready:completion-audit:validate-report agent-ready-completion-audit-report.json && bun run agent-ready:sync-audit:check agent-ready-production-report.json" &&
      includesAll(context.finalGate, [
        "Generate strict production report",
        "Generate standalone live report",
        "Validate live report",
        "Run strict completion audit",
        "Require production report to be green",
        "Require live report to be green",
        "Require status report to be green",
        "Require completion audit report to be green",
        "--require-ok",
        "Agent-ready final gate passed",
      ]) &&
      includesAll(context.liveReportValidator, [
        "agent-ready-live-report.json",
        "reportSchemaUrl",
        "$.$schema",
        "--require-ok",
        "validateConsistency",
        "must equal the number of passing checks",
        "Valid agent-ready live report",
      ]) &&
      includesAll(context.completionReportValidator, [
        "agent-ready-completion-audit-report.json",
        "validateReportConsistency",
        "must equal completionOk or allowed production blockers",
        "Valid agent-ready completion audit report",
      ]),
  );
}
