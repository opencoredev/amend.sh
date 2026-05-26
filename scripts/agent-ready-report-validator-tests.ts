import { registerAgentReadyLiveCompletionReportValidatorTests } from "./agent-ready-live-completion-report-validator-tests";
import { registerAgentReadyProductionReportValidatorTests } from "./agent-ready-production-report-validator-tests";
import { registerAgentReadyStatusReportValidatorTests } from "./agent-ready-status-report-validator-tests";
import { registerAgentReadySyncAuditTests } from "./agent-ready-sync-audit-tests";

type ReadProjectFile = (path: string) => Promise<string>;

export function registerAgentReadyReportValidatorTests(read: ReadProjectFile, root: URL) {
  registerAgentReadyStatusReportValidatorTests(read, root);
  registerAgentReadyProductionReportValidatorTests(root);
  registerAgentReadySyncAuditTests(root);
  registerAgentReadyLiveCompletionReportValidatorTests(root);
}
