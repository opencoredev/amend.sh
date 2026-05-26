import { runReadinessAgentReportAuditChecks } from "./readiness-agent-report-audit-checks";
import { runReadinessAgentReportCommandChecks } from "./readiness-agent-report-command-checks";
import { runReadinessAgentReportSchemaChecks } from "./readiness-agent-report-schema-checks";
import { runReadinessAgentReportValidatorChecks } from "./readiness-agent-report-validator-checks";

export function runReadinessAgentReportChecks() {
  runReadinessAgentReportCommandChecks();
  runReadinessAgentReportSchemaChecks();
  runReadinessAgentReportValidatorChecks();
  runReadinessAgentReportAuditChecks();
}
