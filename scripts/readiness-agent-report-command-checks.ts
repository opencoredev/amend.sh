import {
  add,
  agentReadyCompletionAudit,
  agentReadyProduction,
  agentReadyRefreshReport,
  agentReadyStatus,
} from "./readiness-context";

export function runReadinessAgentReportCommandChecks() {
  add(
    "agent-ready status reports env and DNS blockers without secrets",
    agentReadyStatus.includes("requiredProductionEnv") &&
      agentReadyStatus.includes("./agent-ready-production-env") &&
      agentReadyStatus.includes("writeFile") &&
      agentReadyStatus.includes("--json") &&
      agentReadyStatus.includes("--json-file") &&
      agentReadyStatus.includes("productionEnv") &&
      agentReadyStatus.includes("nextGates") &&
      agentReadyStatus.includes("checkedAt") &&
      agentReadyStatus.includes("blockers") &&
      agentReadyStatus.includes("Blockers:") &&
      agentReadyStatus.includes(
        "Load ${missingEnv.length} missing production environment values.",
      ) &&
      agentReadyStatus.includes("Register ${apex}.") &&
      agentReadyStatus.includes("Delegate ${apex} with a DNS provider.") &&
      agentReadyStatus.includes(
        "Create A/AAAA or CNAME records for ${status.host} pointing at the ${label} deployment.",
      ) &&
      agentReadyStatus.includes("missing env") &&
      agentReadyStatus.includes("registered=") &&
      agentReadyStatus.includes("delegated=") &&
      agentReadyStatus.includes("records=") &&
      agentReadyStatus.includes("bun run agent-ready:production") &&
      agentReadyStatus.includes("bun run agent-ready:final-gate") &&
      !agentReadyStatus.includes("console.log(process.env"),
  );
  add(
    "agent-ready production JSON report preserves blockers when strict readiness fails",
    agentReadyProduction.includes('runCommand(["bun", "scripts/readiness.ts", "--strict"])') &&
      agentReadyProduction.includes('runCommand(["bun", "scripts/agent-ready-built.ts"])') &&
      agentReadyProduction.includes(
        'runCommand(["bun", "scripts/agent-ready-status.ts", "--json"])',
      ) &&
      agentReadyProduction.includes(
        'runCommand(["bun", "scripts/agent-ready-live.ts", "--json"])',
      ) &&
      agentReadyProduction.includes("parseReadinessSummary") &&
      agentReadyProduction.includes("parseBuiltSummary") &&
      agentReadyProduction.includes("blockersFrom") &&
      agentReadyProduction.includes("reportSchemaUrl") &&
      agentReadyProduction.includes("readinessStrict") &&
      agentReadyProduction.includes(
        "Pass strict readiness with production environment values loaded.",
      ) &&
      agentReadyProduction.includes(
        "Pass the live agent-ready validator against amend.sh and docs.amend.sh.",
      ) &&
      agentReadyProduction.includes("--json-file") &&
      agentReadyProduction.includes("writeFile"),
  );
  add(
    "agent-ready production report refresh preserves blockers and syncs audits",
    agentReadyRefreshReport.includes("scripts/agent-ready-production.ts") &&
      agentReadyRefreshReport.includes("--json-file") &&
      agentReadyRefreshReport.includes("scripts/agent-ready-sync-audit.ts") &&
      agentReadyRefreshReport.includes("agent-ready:audit:check") &&
      agentReadyRefreshReport.includes("scripts/agent-ready-live.ts") &&
      agentReadyRefreshReport.includes("agent-ready-live-report.json") &&
      agentReadyRefreshReport.includes("scripts/agent-ready-completion-audit.ts") &&
      agentReadyRefreshReport.includes("scripts/agent-ready-status.ts") &&
      agentReadyRefreshReport.includes("agent-ready-status.json") &&
      agentReadyRefreshReport.includes("--allow-production-blockers") &&
      agentReadyRefreshReport.includes("--json-file") &&
      agentReadyRefreshReport.includes("agent-ready-completion-audit-report.json") &&
      agentReadyRefreshReport.includes("Validate reports and synced audits") &&
      agentReadyRefreshReport.includes("status.exitCode") &&
      agentReadyRefreshReport.includes("production.exitCode") &&
      agentReadyRefreshReport.includes("refreshed with blockers"),
  );
  add(
    "agent-ready completion audit maps objective to artifacts and production report",
    agentReadyCompletionAudit.includes("Agent-ready completion audit") &&
      agentReadyCompletionAudit.includes("maximum-visibility web robots policy exists") &&
      agentReadyCompletionAudit.includes("web llms.txt maps web and docs resources") &&
      agentReadyCompletionAudit.includes("Agent-ready live report JSON Schema") &&
      agentReadyCompletionAudit.includes(
        "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json",
      ) &&
      agentReadyCompletionAudit.includes("Agent-ready status report JSON Schema") &&
      agentReadyCompletionAudit.includes(
        "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json",
      ) &&
      agentReadyCompletionAudit.includes("canonical and social metadata are wired") &&
      agentReadyCompletionAudit.includes("structured data is wired") &&
      agentReadyCompletionAudit.includes("crawlable public content is verified") &&
      agentReadyCompletionAudit.includes("isParseableJsonObject") &&
      agentReadyCompletionAudit.includes("parseJsonObject") &&
      agentReadyCompletionAudit.includes("is parseable JSON object") &&
      agentReadyCompletionAudit.includes("scripts/agent-ready-production-env.ts") &&
      agentReadyCompletionAudit.includes(
        "production env contract is shared by strict readiness and status",
      ) &&
      agentReadyCompletionAudit.includes("production launch handoff uses Amend.sh origins") &&
      agentReadyCompletionAudit.includes("SITE_URL=https://amend.sh") &&
      agentReadyCompletionAudit.includes("EMAIL_FROM=Amend <updates@amend.sh>") &&
      agentReadyCompletionAudit.includes("saved production report has passing live validator") &&
      agentReadyCompletionAudit.includes("saved production report is complete and blocker-free") &&
      agentReadyCompletionAudit.includes("allowProductionBlockers") &&
      agentReadyCompletionAudit.includes("--json-file") &&
      agentReadyCompletionAudit.includes("writeFile") &&
      agentReadyCompletionAudit.includes("missingOrBlocked") &&
      agentReadyCompletionAudit.includes("Only external production blockers remain.") &&
      agentReadyCompletionAudit.includes("process.exitCode = 1"),
  );
}
