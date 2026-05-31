import { describe, expect, test } from "bun:test";

const schemaNames = [
  "agent-ready-completion-audit-report.schema.json",
  "agent-ready-live-report.schema.json",
  "agent-ready-production-report.schema.json",
  "agent-ready-status-report.schema.json",
];

describe("docs schema route copies", () => {
  for (const schemaName of schemaNames) {
    test(`${schemaName} matches the canonical docs schema`, async () => {
      const canonical = await Bun.file(`docs/${schemaName}`).text();
      const routeCopy = await Bun.file(`apps/fumadocs/src/app/schemas/_data/${schemaName}`).text();

      expect(routeCopy).toBe(canonical);
    });
  }
});
