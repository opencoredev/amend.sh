import { textEndpoint, type AddCheck } from "./agent-ready-live-surface-utils";

export async function checkLiveDocsSchemaEndpoints(add: AddCheck, docsOrigin: string) {
  await textEndpoint(add, {
    allowIndexing: true,
    contentTypes: ["application/schema+json", "application/json"],
    includes: [
      '"$schema": "https://json-schema.org/draft/2020-12/schema"',
      '"$id": "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json"',
      '"$schema"',
      '"https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
      '"blockers"',
      '"checkedAt"',
      '"ok"',
      '"steps"',
      '"nextGates"',
      '"const": "bun run agent-ready:production"',
      '"const": "bun run agent-ready:final-gate"',
    ],
    label: "docs",
    origin: docsOrigin,
    parseJsonObject: true,
    path: "/schemas/agent-ready-production-report.schema.json",
  });
  await textEndpoint(add, {
    allowIndexing: true,
    contentTypes: ["application/schema+json", "application/json"],
    includes: [
      '"$schema": "https://json-schema.org/draft/2020-12/schema"',
      '"$id": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
      '"blockers"',
      '"checks"',
      '"origins"',
      '"passed"',
      '"total"',
    ],
    label: "docs",
    origin: docsOrigin,
    parseJsonObject: true,
    path: "/schemas/agent-ready-live-report.schema.json",
  });
  await textEndpoint(add, {
    allowIndexing: true,
    contentTypes: ["application/schema+json", "application/json"],
    includes: [
      '"$schema": "https://json-schema.org/draft/2020-12/schema"',
      '"$id": "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json"',
      '"blockers"',
      '"dns"',
      '"nextGates"',
      '"const": "bun run agent-ready:production"',
      '"const": "bun run agent-ready:final-gate"',
      '"productionEnv"',
    ],
    label: "docs",
    origin: docsOrigin,
    parseJsonObject: true,
    path: "/schemas/agent-ready-status-report.schema.json",
  });
  await textEndpoint(add, {
    allowIndexing: true,
    contentTypes: ["application/schema+json", "application/json"],
    includes: [
      '"$schema": "https://json-schema.org/draft/2020-12/schema"',
      '"$id": "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json"',
      '"allowProductionBlockers"',
      '"checks"',
      '"completionOk"',
      '"missingOrBlocked"',
      '"productionBlockersOnly"',
      '"summary"',
    ],
    label: "docs",
    origin: docsOrigin,
    parseJsonObject: true,
    path: "/schemas/agent-ready-completion-audit-report.schema.json",
  });
}
