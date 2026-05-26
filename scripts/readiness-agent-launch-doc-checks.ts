import {
  add,
  agentReadyAudit,
  agentReadyDomainSetup,
  aiCrawlerNames,
  completionAudit,
  hasNormalizedText,
  launchRunbook,
  productionReadiness,
  readme,
} from "./readiness-context";

export function runReadinessAgentLaunchDocChecks() {
  add(
    "agent-ready launch docs name A/AAAA/CNAME DNS records",
    readme.includes("A/AAAA/CNAME DNS records") &&
      productionReadiness.includes("A/AAAA/CNAME DNS records") &&
      productionReadiness.includes("Alternate origins are useful for preview deployments only") &&
      productionReadiness.includes("final-response") &&
      launchRunbook.includes("A/AAAA/CNAME DNS records") &&
      launchRunbook.includes("Alternate-origin live checks are allowed for previews") &&
      launchRunbook.includes("do not replace the production gate"),
  );
  add(
    "agent-ready launch docs name the production gate",
    readme.includes("bun run agent-ready:production") &&
      readme.includes("bun --silent run agent-ready:production:json") &&
      readme.includes("bun run agent-ready:production:validate-report") &&
      readme.includes("bun run agent-ready:completion-audit:validate-report") &&
      readme.includes("bun run agent-ready:completion-audit") &&
      readme.includes("agent-ready-completion-audit-report.json") &&
      readme.includes("bun run agent-ready:sync-audit") &&
      readme.includes("bun run agent-ready:audit:check") &&
      readme.includes("bun run agent-ready:status") &&
      readme.includes("bun --silent run agent-ready:status:json") &&
      readme.includes("agent-ready-status.ts --json --json-file") &&
      readme.includes("agent-ready:status:validate-report") &&
      readme.includes("agent-ready-production.ts --json --json-file") &&
      launchRunbook.includes("bun run agent-ready:production") &&
      launchRunbook.includes("bun --silent run agent-ready:production:json") &&
      launchRunbook.includes("bun run agent-ready:production:validate-report") &&
      launchRunbook.includes("bun run agent-ready:completion-audit:validate-report") &&
      launchRunbook.includes("bun run agent-ready:completion-audit") &&
      launchRunbook.includes("agent-ready-completion-audit-report.json") &&
      launchRunbook.includes("bun run agent-ready:status") &&
      launchRunbook.includes("bun --silent run agent-ready:status:json") &&
      launchRunbook.includes("agent-ready-status.ts --json --json-file") &&
      launchRunbook.includes("agent-ready:status:validate-report") &&
      launchRunbook.includes("agent-ready-production.ts --json --json-file") &&
      productionReadiness.includes("bun --silent run agent-ready:production:json") &&
      productionReadiness.includes("bun run agent-ready:production:validate-report") &&
      productionReadiness.includes("bun run agent-ready:completion-audit:validate-report") &&
      productionReadiness.includes("bun run agent-ready:completion-audit") &&
      productionReadiness.includes("agent-ready-completion-audit-report.json") &&
      productionReadiness.includes("bun run agent-ready:status") &&
      productionReadiness.includes("bun --silent run agent-ready:status:json") &&
      productionReadiness.includes("agent-ready-status.ts --json --json-file") &&
      productionReadiness.includes("agent-ready:status:validate-report") &&
      productionReadiness.includes("agent-ready-production.ts --json --json-file") &&
      agentReadyDomainSetup.includes("bun run agent-ready:production") &&
      agentReadyDomainSetup.includes("bun --silent run agent-ready:production:json"),
  );
  add(
    "agent-ready launch docs name docs Open Graph checks",
    hasNormalizedText(
      readme,
      "docs index canonical/Open Graph/parseable TechArticle JSON-LD HTML",
    ) &&
      hasNormalizedText(
        productionReadiness,
        "docs index canonical/Open Graph/parseable TechArticle JSON-LD HTML",
      ) &&
      hasNormalizedText(
        launchRunbook,
        "docs index canonical/Open Graph/parseable TechArticle JSON-LD HTML",
      ),
  );
  add(
    "agent-ready docs name full crawler/fetcher policy",
    [
      readme,
      productionReadiness,
      launchRunbook,
      agentReadyDomainSetup,
      agentReadyAudit,
      completionAudit,
    ].every((doc) => aiCrawlerNames.every((crawler) => doc.includes(crawler))),
  );
}
