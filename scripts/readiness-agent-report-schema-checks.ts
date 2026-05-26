import {
  add,
  agentReadyCompletionAuditReportSchema,
  agentReadyLiveReportSchema,
  agentReadyProductionReportSchema,
  agentReadyStatusReportSchema,
} from "./readiness-context";

export function runReadinessAgentReportSchemaChecks() {
  add(
    "agent-ready production JSON report schema exists",
    agentReadyProductionReportSchema.includes(
      '"$id": "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json"',
    ) &&
      agentReadyProductionReportSchema.includes(
        '"required": ["$schema", "blockers", "checkedAt", "ok", "steps"]',
      ) &&
      agentReadyProductionReportSchema.includes(
        '"const": "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json"',
      ) &&
      agentReadyProductionReportSchema.includes(
        '"required": ["built", "live", "readinessStrict", "status"]',
      ) &&
      agentReadyProductionReportSchema.includes('"summaryStep"') &&
      agentReadyProductionReportSchema.includes('"liveReport"') &&
      agentReadyProductionReportSchema.includes(
        '"const": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
      ) &&
      agentReadyProductionReportSchema.includes('"statusReport"') &&
      agentReadyProductionReportSchema.includes(
        '"const": "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json"',
      ) &&
      agentReadyProductionReportSchema.includes('"nextGates"') &&
      agentReadyProductionReportSchema.includes('"prefixItems"') &&
      agentReadyProductionReportSchema.includes('"liveStep"') &&
      agentReadyProductionReportSchema.includes('"statusStep"') &&
      agentReadyProductionReportSchema.includes('"format": "date-time"') &&
      agentReadyProductionReportSchema.includes('"additionalProperties": false'),
  );
  add(
    "agent-ready live JSON report schema exists",
    agentReadyLiveReportSchema.includes(
      '"$id": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
    ) &&
      agentReadyLiveReportSchema.includes(
        '"required": ["$schema", "blockers", "checkedAt", "checks", "ok", "origins", "passed", "total"]',
      ) &&
      agentReadyLiveReportSchema.includes(
        '"const": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
      ) &&
      agentReadyLiveReportSchema.includes('"checks"') &&
      agentReadyLiveReportSchema.includes('"origins"') &&
      agentReadyLiveReportSchema.includes('"passed"') &&
      agentReadyLiveReportSchema.includes('"total"') &&
      agentReadyLiveReportSchema.includes('"additionalProperties": false'),
  );
  add(
    "agent-ready completion audit JSON report schema exists",
    agentReadyCompletionAuditReportSchema.includes(
      '"$id": "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json"',
    ) &&
      agentReadyCompletionAuditReportSchema.includes('"allowProductionBlockers"') &&
      agentReadyCompletionAuditReportSchema.includes('"completionOk"') &&
      agentReadyCompletionAuditReportSchema.includes('"missingOrBlocked"') &&
      agentReadyCompletionAuditReportSchema.includes('"productionBlockersOnly"') &&
      agentReadyCompletionAuditReportSchema.includes('"productionReportPath"') &&
      agentReadyCompletionAuditReportSchema.includes('"summary"') &&
      agentReadyCompletionAuditReportSchema.includes('"failed"') &&
      agentReadyCompletionAuditReportSchema.includes('"passed"') &&
      agentReadyCompletionAuditReportSchema.includes('"total"') &&
      agentReadyCompletionAuditReportSchema.includes('"additionalProperties": false'),
  );
  add(
    "agent-ready status JSON report schema exists",
    agentReadyStatusReportSchema.includes(
      '"$id": "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json"',
    ) &&
      agentReadyStatusReportSchema.includes('"$schema"') &&
      agentReadyStatusReportSchema.includes(
        '"const": "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json"',
      ) &&
      agentReadyStatusReportSchema.includes('"nextGates"') &&
      agentReadyStatusReportSchema.includes('"prefixItems"') &&
      agentReadyStatusReportSchema.includes('"dnsHost"') &&
      agentReadyStatusReportSchema.includes('"additionalProperties": false'),
  );
}
