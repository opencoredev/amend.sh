import { expect } from "bun:test";

export function assertAgentReadyReportSchemas({
  completionAuditReportSchema,
  liveReportSchema,
  productionReportSchema,
  statusReportSchema,
}: {
  completionAuditReportSchema: string;
  liveReportSchema: string;
  productionReportSchema: string;
  statusReportSchema: string;
}) {
  for (const expected of [
    '"$schema": "https://json-schema.org/draft/2020-12/schema"',
    '"$id": "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json"',
    '"required": ["$schema", "blockers", "checkedAt", "ok", "steps"]',
    '"const": "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json"',
    '"required": ["built", "live", "readinessStrict", "status"]',
    '"summaryStep"',
    '"liveReport"',
    '"const": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
    '"statusReport"',
    '"const": "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json"',
    '"nextGates"',
    '"prefixItems"',
    '"const": "bun run agent-ready:production"',
    '"const": "bun run agent-ready:final-gate"',
    '"liveStep"',
    '"statusStep"',
    '"format": "date-time"',
    '"additionalProperties": false',
  ]) {
    expect(productionReportSchema).toContain(expected);
  }

  for (const expected of [
    '"$schema": "https://json-schema.org/draft/2020-12/schema"',
    '"$id": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
    '"required": ["$schema", "blockers", "checkedAt", "checks", "ok", "origins", "passed", "total"]',
    '"const": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
    '"checks"',
    '"origins"',
    '"passed"',
    '"total"',
    '"format": "date-time"',
    '"additionalProperties": false',
  ]) {
    expect(liveReportSchema).toContain(expected);
  }

  for (const expected of [
    '"$schema": "https://json-schema.org/draft/2020-12/schema"',
    '"$id": "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json"',
    '"$schema"',
    '"const": "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json"',
    '"nextGates"',
    '"prefixItems"',
    '"const": "bun run agent-ready:production"',
    '"const": "bun run agent-ready:final-gate"',
    '"dnsHost"',
    '"additionalProperties": false',
  ]) {
    expect(statusReportSchema).toContain(expected);
  }

  for (const expected of [
    '"$schema": "https://json-schema.org/draft/2020-12/schema"',
    '"$id": "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json"',
    '"required": [',
    '"allowProductionBlockers"',
    '"checkedAt"',
    '"checks"',
    '"completionOk"',
    '"missingOrBlocked"',
    '"ok"',
    '"productionBlockersOnly"',
    '"productionReportPath"',
    '"summary"',
    '"const": "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json"',
    '"failed"',
    '"passed"',
    '"total"',
    '"format": "date-time"',
    '"additionalProperties": false',
  ]) {
    expect(completionAuditReportSchema).toContain(expected);
  }
}
