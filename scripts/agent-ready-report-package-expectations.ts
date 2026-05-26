export const agentReadyPackageScripts = {
  "agent-ready:production":
    "bun run readiness:strict && bun run agent-ready:built && bun run agent-ready:live",
  "agent-ready:production:json": "bun scripts/agent-ready-production.ts --json",
  "agent-ready:refresh-report": "bun scripts/agent-ready-refresh-report.ts",
  "agent-ready:final-gate": "bun scripts/agent-ready-final-gate.ts",
  "agent-ready:status:validate-report": "bun scripts/agent-ready-status-report-validate.ts",
  "agent-ready:completion-audit": "bun scripts/agent-ready-completion-audit.ts",
  "agent-ready:completion-audit:json": "bun scripts/agent-ready-completion-audit.ts --json",
  "agent-ready:completion-audit:validate-report":
    "bun scripts/agent-ready-completion-audit-report-validate.ts",
  "agent-ready:production:validate-report": "bun scripts/agent-ready-production-report-validate.ts",
  "agent-ready:live:validate-report": "bun scripts/agent-ready-live-report-validate.ts",
  "agent-ready:audit:check":
    "bun run agent-ready:production:validate-report agent-ready-production-report.json && bun run agent-ready:live:validate-report agent-ready-live-report.json && bun run agent-ready:status:validate-report agent-ready-status.json && bun run agent-ready:completion-audit:validate-report agent-ready-completion-audit-report.json && bun run agent-ready:sync-audit:check agent-ready-production-report.json",
} as const;

export const agentReadyTurboGlobalDependencies = [
  "docs/agent-ready-production-report.schema.json",
  "docs/agent-ready-live-report.schema.json",
  "docs/agent-ready-status-report.schema.json",
  "docs/agent-ready-completion-audit-report.schema.json",
] as const;
