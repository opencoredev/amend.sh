import {
  add,
  agentReadyAudit,
  agentReadyDomainSetup,
  gitignore,
  hasNormalizedText,
  launchRunbook,
  productionReadiness,
  readme,
} from "./readiness-context";

export function runReadinessAgentJsonDocChecks() {
  add(
    "agent-ready docs name JSON artifact output",
    [agentReadyDomainSetup, productionReadiness, launchRunbook].every((doc) =>
      doc.includes("--json-file"),
    ) &&
      agentReadyAudit.includes("--json-file") &&
      readme.includes("agent-ready-status.json") &&
      readme.includes("agent-ready-live-report.json") &&
      readme.includes("`nextGates`") &&
      readme.includes("agent-ready-production-report.json") &&
      readme.includes("agent-ready-completion-audit-report.json") &&
      readme.includes("`$schema` field") &&
      readme.includes("docs/agent-ready-production-report.schema.json") &&
      readme.includes("docs/agent-ready-live-report.schema.json") &&
      readme.includes("docs/agent-ready-status-report.schema.json") &&
      readme.includes("docs/agent-ready-completion-audit-report.schema.json") &&
      readme.includes("agent-ready:completion-audit:validate-report") &&
      hasNormalizedText(readme, "completion audit report schema endpoint") &&
      productionReadiness.includes("`$schema` field") &&
      productionReadiness.includes("`nextGates`") &&
      productionReadiness.includes("docs/agent-ready-production-report.schema.json") &&
      productionReadiness.includes("docs/agent-ready-live-report.schema.json") &&
      productionReadiness.includes("docs/agent-ready-status-report.schema.json") &&
      productionReadiness.includes("docs/agent-ready-completion-audit-report.schema.json") &&
      productionReadiness.includes("agent-ready:completion-audit:validate-report") &&
      hasNormalizedText(productionReadiness, "production report schema endpoint") &&
      hasNormalizedText(productionReadiness, "completion audit report schema endpoint") &&
      launchRunbook.includes("`$schema` field") &&
      launchRunbook.includes("`nextGates`") &&
      launchRunbook.includes("docs/agent-ready-production-report.schema.json") &&
      launchRunbook.includes("docs/agent-ready-live-report.schema.json") &&
      launchRunbook.includes("docs/agent-ready-status-report.schema.json") &&
      launchRunbook.includes("docs/agent-ready-completion-audit-report.schema.json") &&
      launchRunbook.includes("agent-ready:completion-audit:validate-report") &&
      hasNormalizedText(launchRunbook, "production report schema endpoint") &&
      hasNormalizedText(launchRunbook, "completion audit report schema endpoint") &&
      agentReadyDomainSetup.includes("agent-ready-status.json") &&
      agentReadyDomainSetup.includes("agent-ready-live-report.json") &&
      agentReadyDomainSetup.includes("`nextGates`") &&
      agentReadyDomainSetup.includes("agent-ready-production-report.json") &&
      agentReadyDomainSetup.includes("agent-ready-completion-audit-report.json") &&
      agentReadyDomainSetup.includes("`$schema` field") &&
      agentReadyDomainSetup.includes("docs/agent-ready-production-report.schema.json") &&
      agentReadyDomainSetup.includes("docs/agent-ready-live-report.schema.json") &&
      agentReadyDomainSetup.includes("docs/agent-ready-status-report.schema.json") &&
      agentReadyDomainSetup.includes("docs/agent-ready-completion-audit-report.schema.json") &&
      agentReadyDomainSetup.includes("agent-ready:completion-audit:validate-report") &&
      hasNormalizedText(agentReadyDomainSetup, "production report schema endpoint") &&
      hasNormalizedText(agentReadyDomainSetup, "completion audit report schema endpoint"),
  );
  add(
    "agent-ready JSON artifacts are ignored",
    gitignore.includes("agent-ready-live-report.json") &&
      gitignore.includes("agent-ready-production-report.json") &&
      gitignore.includes("agent-ready-status.json") &&
      gitignore.includes("agent-ready-completion-audit-report.json"),
  );
}
