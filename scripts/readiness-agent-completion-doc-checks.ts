import { add, completionAudit, hasNormalizedText } from "./readiness-context";

export function runReadinessAgentCompletionDocChecks() {
  add(
    "completion audit maps the agent-ready objective",
    completionAudit.includes("Agent-Ready Objective Checklist") &&
      completionAudit.includes("Maximum-visibility crawler policy") &&
      completionAudit.includes("Canonical sitemaps") &&
      completionAudit.includes("LLM-readable maps and mirrors") &&
      completionAudit.includes(
        "machine-readable production, live, status, and completion report schema links",
      ) &&
      completionAudit.includes(
        "web/docs maps link the production, live, status, and completion report schemas",
      ) &&
      completionAudit.includes("Canonical and social metadata") &&
      completionAudit.includes("Structured data") &&
      completionAudit.includes("Crawlable public content") &&
      completionAudit.includes("Private routes noindex") &&
      completionAudit.includes("Source/build validation") &&
      completionAudit.includes("Public production validation") &&
      completionAudit.includes("Complete locally") &&
      completionAudit.includes("Blocked externally") &&
      completionAudit.includes("loading production env/provider inputs") &&
      completionAudit.includes("passing `bun run agent-ready:production`") &&
      completionAudit.includes("bun run agent-ready") &&
      completionAudit.includes("bun test scripts/agent-ready.test.ts") &&
      completionAudit.includes("bun run agent-ready:built") &&
      completionAudit.includes("bun run agent-ready:completion-audit") &&
      completionAudit.includes("agent-ready-completion-audit-report.json") &&
      completionAudit.includes("bun run agent-ready:status") &&
      completionAudit.includes("bun run agent-ready:status:json") &&
      completionAudit.includes("bun run agent-ready:status:validate-report") &&
      completionAudit.includes("bun run agent-ready:live:validate-report") &&
      completionAudit.includes("docs/agent-ready-live-report.schema.json") &&
      completionAudit.includes("docs/agent-ready-status-report.schema.json") &&
      completionAudit.includes("bun run agent-ready:final-gate") &&
      completionAudit.includes("no-secret env/deployment/DNS blocker summaries") &&
      hasNormalizedText(completionAudit, "without printing secret values") &&
      completionAudit.includes("bun run agent-ready:production") &&
      completionAudit.includes("bun --silent run agent-ready:production:json") &&
      completionAudit.includes("bun run agent-ready:production:validate-report") &&
      completionAudit.includes("bun run agent-ready:completion-audit:validate-report") &&
      completionAudit.includes("bun run agent-ready:audit:check") &&
      completionAudit.includes("bun --silent run agent-ready:live:json") &&
      completionAudit.includes("not registered/delegated") &&
      completionAudit.includes("docs.amend.sh"),
  );
}
