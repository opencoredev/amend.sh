import {
  add,
  agentReadyCompletionAuditReportValidate,
  agentReadyLiveReportValidate,
  agentReadyProductionReportValidate,
  agentReadyStatusReportValidate,
} from "./readiness-context";

export function runReadinessAgentReportValidatorChecks() {
  add(
    "agent-ready live JSON report validator exists",
    agentReadyLiveReportValidate.includes("agent-ready-live-report.json") &&
      agentReadyLiveReportValidate.includes("reportSchemaUrl") &&
      agentReadyLiveReportValidate.includes("$.$schema") &&
      agentReadyLiveReportValidate.includes("--require-ok") &&
      agentReadyLiveReportValidate.includes("validateConsistency") &&
      agentReadyLiveReportValidate.includes("must equal the number of passing checks") &&
      agentReadyLiveReportValidate.includes("must equal whether passed equals total") &&
      agentReadyLiveReportValidate.includes("must be true when --require-ok is used") &&
      agentReadyLiveReportValidate.includes("Valid agent-ready live report") &&
      agentReadyLiveReportValidate.includes("Invalid agent-ready live report"),
  );
  add(
    "agent-ready status JSON report validator exists",
    agentReadyStatusReportValidate.includes("agent-ready-status.json") &&
      agentReadyStatusReportValidate.includes("reportSchemaUrl") &&
      agentReadyStatusReportValidate.includes("$.$schema") &&
      agentReadyStatusReportValidate.includes("--require-ok") &&
      agentReadyStatusReportValidate.includes("requiredNextGates") &&
      agentReadyStatusReportValidate.includes("validateExactStringArray") &&
      agentReadyStatusReportValidate.includes("must account for total minus passed") &&
      agentReadyStatusReportValidate.includes("must be true when --require-ok is used") &&
      agentReadyStatusReportValidate.includes("must be empty when --require-ok is used") &&
      agentReadyStatusReportValidate.includes("must equal total when --require-ok is used") &&
      agentReadyStatusReportValidate.includes("must not be empty when --require-ok is used") &&
      agentReadyStatusReportValidate.includes("Valid agent-ready status report") &&
      agentReadyStatusReportValidate.includes("Invalid agent-ready status report"),
  );
  add(
    "agent-ready production JSON report validator exists",
    agentReadyProductionReportValidate.includes("agent-ready-production-report.json") &&
      agentReadyProductionReportValidate.includes("reportSchemaUrl") &&
      agentReadyProductionReportValidate.includes("$.$schema") &&
      agentReadyProductionReportValidate.includes("--require-ok") &&
      agentReadyProductionReportValidate.includes("$.blockers") &&
      agentReadyProductionReportValidate.includes("$.checkedAt") &&
      agentReadyProductionReportValidate.includes("$.steps") &&
      agentReadyProductionReportValidate.includes("liveReportSchemaUrl") &&
      agentReadyProductionReportValidate.includes("statusReportSchemaUrl") &&
      agentReadyProductionReportValidate.includes("requiredNextGates") &&
      agentReadyProductionReportValidate.includes("validateExactStringArray") &&
      agentReadyProductionReportValidate.includes("validateReportConsistency") &&
      agentReadyProductionReportValidate.includes("must equal whether exitCode is zero") &&
      agentReadyProductionReportValidate.includes("must equal whether every step is ok") &&
      agentReadyProductionReportValidate.includes("must equal the number of passing checks") &&
      agentReadyProductionReportValidate.includes("built") &&
      agentReadyProductionReportValidate.includes("live") &&
      agentReadyProductionReportValidate.includes("readinessStrict") &&
      agentReadyProductionReportValidate.includes("status") &&
      agentReadyProductionReportValidate.includes("Valid agent-ready production report") &&
      agentReadyProductionReportValidate.includes("Invalid agent-ready production report"),
  );
  add(
    "agent-ready completion audit JSON report validator exists",
    agentReadyCompletionAuditReportValidate.includes("agent-ready-completion-audit-report.json") &&
      agentReadyCompletionAuditReportValidate.includes("reportSchemaUrl") &&
      agentReadyCompletionAuditReportValidate.includes("$.$schema") &&
      agentReadyCompletionAuditReportValidate.includes("--require-ok") &&
      agentReadyCompletionAuditReportValidate.includes("$.completionOk") &&
      agentReadyCompletionAuditReportValidate.includes("$.missingOrBlocked") &&
      agentReadyCompletionAuditReportValidate.includes("$.summary.failed") &&
      agentReadyCompletionAuditReportValidate.includes("validateReportConsistency") &&
      agentReadyCompletionAuditReportValidate.includes("must equal the number of failing checks") &&
      agentReadyCompletionAuditReportValidate.includes("must equal the number of passing checks") &&
      agentReadyCompletionAuditReportValidate.includes(
        "must equal completionOk or allowed production blockers",
      ) &&
      agentReadyCompletionAuditReportValidate.includes("must be true when --require-ok is used") &&
      agentReadyCompletionAuditReportValidate.includes(
        "Valid agent-ready completion audit report",
      ) &&
      agentReadyCompletionAuditReportValidate.includes(
        "Invalid agent-ready completion audit report",
      ),
  );
}
