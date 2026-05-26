import { add, agentReadyAudit, agentReadySyncAudit, hasNormalizedText } from "./readiness-context";

export function runReadinessAgentReportAuditChecks() {
  add(
    "agent-ready audit evidence sync exists",
    agentReadySyncAudit.includes("agent-ready-production-report.json") &&
      agentReadySyncAudit.includes("docs/agent-ready-audit.md") &&
      agentReadySyncAudit.includes("docs/completion-audit.md") &&
      agentReadySyncAudit.includes("--check") &&
      agentReadySyncAudit.includes("checkOnly") &&
      agentReadySyncAudit.includes("assertSynced") &&
      agentReadySyncAudit.includes("agent-ready-live-report.json") &&
      agentReadySyncAudit.includes("assertStandaloneLiveReportSynced") &&
      agentReadySyncAudit.includes("stableValue") &&
      agentReadySyncAudit.includes("comparableLiveReport") &&
      agentReadySyncAudit.includes("matches the embedded live report") &&
      agentReadySyncAudit.includes("Latest JSON live check") &&
      agentReadySyncAudit.includes("Latest agent-ready status check") &&
      agentReadySyncAudit.includes("Latest agent-ready live check") &&
      agentReadySyncAudit.includes("replaceOnce") &&
      agentReadySyncAudit.includes("productionEnv") &&
      agentReadySyncAudit.includes("live report checkedAt") &&
      agentReadySyncAudit.includes("status report checkedAt"),
  );
  add(
    "agent-ready audit documents live DNS blocker",
    agentReadyAudit.includes("Prompt-To-Artifact Checklist") &&
      agentReadyAudit.includes("Production docs URL routing") &&
      agentReadyAudit.includes("https://docs.amend.sh/docs") &&
      agentReadyAudit.includes("dig +short NS amend.sh") &&
      agentReadyAudit.includes("dig +short CNAME amend.sh") &&
      agentReadyAudit.includes("dig +short A docs.amend.sh") &&
      agentReadyAudit.includes("dig +short CNAME docs.amend.sh") &&
      agentReadyAudit.includes("A/AAAA/CNAME DNS records") &&
      agentReadyAudit.includes("whois -h whois.nic.sh amend.sh") &&
      agentReadyAudit.includes("Domain not found") &&
      agentReadyAudit.includes("128/149") &&
      agentReadyAudit.includes("15` agent-ready tests with `643` assertions") &&
      agentReadyAudit.includes("38` tests with `713` assertions") &&
      agentReadyAudit.includes("bun run smoke") &&
      agentReadyAudit.includes("bun run agent-ready") &&
      agentReadyAudit.includes("bun run agent-ready:production") &&
      agentReadyAudit.includes("bun --silent run agent-ready:production:json") &&
      hasNormalizedText(agentReadyAudit, "strict readiness, built artifacts") &&
      agentReadyAudit.includes("readiness and built artifact validation") &&
      agentReadyAudit.includes("bun run agent-ready:live"),
  );
}
