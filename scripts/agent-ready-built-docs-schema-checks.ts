import type { BuiltDocsArtifacts } from "./agent-ready-built-docs-artifacts";
import {
  add,
  includesAll,
  isParseableJsonObject,
  metaHasContentType,
} from "./agent-ready-built-utils";

export function checkBuiltDocsSchemaArtifacts(artifacts: BuiltDocsArtifacts) {
  add(
    "built docs production report schema endpoint exposes JSON Schema",
    includesAll(artifacts.docsProductionReportSchema, [
      '"$schema": "https://json-schema.org/draft/2020-12/schema"',
      '"$id": "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json"',
      '"$schema"',
      '"blockers"',
      '"checkedAt"',
      '"ok"',
      '"steps"',
      '"liveReport"',
      '"const": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
      '"statusReport"',
      '"nextGates"',
      '"const": "bun run agent-ready:production"',
      '"const": "bun run agent-ready:final-gate"',
      '"liveStep"',
      '"statusStep"',
    ]) &&
      isParseableJsonObject(artifacts.docsProductionReportSchema) &&
      metaHasContentType(artifacts.docsProductionReportSchemaMeta, "application/schema+json"),
  );

  add(
    "built docs live report schema endpoint exposes JSON Schema",
    includesAll(artifacts.docsLiveReportSchema, [
      '"$schema": "https://json-schema.org/draft/2020-12/schema"',
      '"$id": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
      '"blockers"',
      '"checks"',
      '"origins"',
      '"passed"',
      '"total"',
    ]) &&
      isParseableJsonObject(artifacts.docsLiveReportSchema) &&
      metaHasContentType(artifacts.docsLiveReportSchemaMeta, "application/schema+json"),
  );

  add(
    "built docs status report schema endpoint exposes JSON Schema",
    includesAll(artifacts.docsStatusReportSchema, [
      '"$schema": "https://json-schema.org/draft/2020-12/schema"',
      '"$id": "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json"',
      '"blockers"',
      '"dns"',
      '"nextGates"',
      '"const": "bun run agent-ready:production"',
      '"const": "bun run agent-ready:final-gate"',
      '"productionEnv"',
    ]) &&
      isParseableJsonObject(artifacts.docsStatusReportSchema) &&
      metaHasContentType(artifacts.docsStatusReportSchemaMeta, "application/schema+json"),
  );

  add(
    "built docs completion audit report schema endpoint exposes JSON Schema",
    includesAll(artifacts.docsCompletionAuditReportSchema, [
      '"$schema": "https://json-schema.org/draft/2020-12/schema"',
      '"$id": "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json"',
      '"allowProductionBlockers"',
      '"checks"',
      '"completionOk"',
      '"missingOrBlocked"',
      '"productionBlockersOnly"',
      '"summary"',
    ]) &&
      isParseableJsonObject(artifacts.docsCompletionAuditReportSchema) &&
      metaHasContentType(artifacts.docsCompletionAuditReportSchemaMeta, "application/schema+json"),
  );
}
