import { registerSyncAuditDriftTest } from "./agent-ready-sync-audit-drift-test";
import { registerSyncAuditReorderedTest } from "./agent-ready-sync-audit-reordered-test";

export function registerAgentReadySyncAuditTests(root: URL) {
  registerSyncAuditDriftTest(root);
  registerSyncAuditReorderedTest(root);
}
