import { expect, test } from "bun:test";
import {
  agentReadyPackageScripts,
  agentReadyTurboGlobalDependencies,
  builtValidatorExpectedSnippets,
  completionAuditReportValidatorExpectedSnippets,
  completionAuditorExpectedSnippets,
  finalGateExpectedSnippets,
  liveReportValidatorExpectedSnippets,
  liveValidatorExpectedSnippets,
  productionReporterExpectedSnippets,
  productionReportValidatorExpectedSnippets,
  refreshReporterExpectedSnippets,
  statusReportValidatorExpectedSnippets,
  syncAuditorExpectedSnippets,
} from "./agent-ready-report-expectations";
import { assertAgentReadyReportSchemas } from "./agent-ready-report-schema-assertions";
import { registerAgentReadyReportValidatorTests } from "./agent-ready-report-validator-tests";

type ReadProjectFile = (path: string) => Promise<string>;

function expectContainsAll(content: string, snippets: readonly string[]) {
  for (const snippet of snippets) {
    expect(content).toContain(snippet);
  }
}

export function registerAgentReadyReportTests(read: ReadProjectFile, root: URL) {
  test("live validator covers deployed DNS, files, metadata, structured data, and noindex", async () => {
    const rootPackage = JSON.parse(await read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const turboConfig = JSON.parse(await read("turbo.json")) as {
      globalDependencies?: string[];
    };
    const liveValidator = [
      await read("scripts/agent-ready-live.ts"),
      await read("scripts/agent-ready-live-surfaces.ts"),
      await read("scripts/agent-ready-live-web-surface.ts"),
      await read("scripts/agent-ready-live-docs-surface.ts"),
      await read("scripts/agent-ready-live-docs-schemas.ts"),
      await read("scripts/agent-ready-live-surface-utils.ts"),
      await read("scripts/agent-ready-live-checks.ts"),
      await read("scripts/agent-ready-live-dns.ts"),
      await read("scripts/agent-ready-live-fetch-checks.ts"),
      await read("scripts/agent-ready-live-fetch-client.ts"),
      await read("scripts/agent-ready-live-text-endpoint-checks.ts"),
      await read("scripts/agent-ready-live-ai-access-checks.ts"),
      await read("scripts/agent-ready-live-llms-cross-checks.ts"),
      await read("scripts/agent-ready-live-parsing.ts"),
      await read("scripts/agent-ready-live-types.ts"),
    ].join("\n");
    const builtValidator = [
      await read("scripts/agent-ready-built.ts"),
      await read("scripts/agent-ready-built-web.ts"),
      await read("scripts/agent-ready-built-docs.ts"),
      await read("scripts/agent-ready-built-docs-artifacts.ts"),
      await read("scripts/agent-ready-built-docs-core-checks.ts"),
      await read("scripts/agent-ready-built-docs-page-checks.ts"),
      await read("scripts/agent-ready-built-docs-schema-checks.ts"),
      await read("scripts/agent-ready-built-utils.ts"),
    ].join("\n");
    const productionReporter = await read("scripts/agent-ready-production.ts");
    const refreshReporter = await read("scripts/agent-ready-refresh-report.ts");
    const finalGate = await read("scripts/agent-ready-final-gate.ts");
    const completionAuditor = [
      await read("scripts/agent-ready-completion-audit.ts"),
      await read("scripts/agent-ready-completion-audit-args.ts"),
      await read("scripts/agent-ready-completion-audit-artifact-checks.ts"),
      await read("scripts/agent-ready-completion-audit-artifact-types.ts"),
      await read("scripts/agent-ready-completion-audit-crawler-artifact-checks.ts"),
      await read("scripts/agent-ready-completion-audit-docs-artifact-checks.ts"),
      await read("scripts/agent-ready-completion-audit-production-artifact-checks.ts"),
      await read("scripts/agent-ready-completion-audit-context-files.ts"),
      await read("scripts/agent-ready-completion-audit-context-types.ts"),
      await read("scripts/agent-ready-completion-audit-helpers.ts"),
      await read("scripts/agent-ready-completion-audit-runner.ts"),
      await read("scripts/agent-ready-completion-audit-context.ts"),
    ].join("\n");
    const syncAuditor = await read("scripts/agent-ready-sync-audit.ts");
    const productionReportValidator = [
      await read("scripts/agent-ready-production-report-validate.ts"),
      await read("scripts/agent-ready-production-report-validator-core.ts"),
      await read("scripts/agent-ready-embedded-report-validators.ts"),
      await read("scripts/report-validator-utils.ts"),
    ].join("\n");
    const statusReportValidator = await read("scripts/agent-ready-status-report-validate.ts");
    const liveReportValidator = await read("scripts/agent-ready-live-report-validate.ts");
    const completionAuditReportValidator = [
      await read("scripts/agent-ready-completion-audit-report-validate.ts"),
      await read("scripts/agent-ready-completion-audit-report-validator-core.ts"),
    ].join("\n");
    const productionReportSchema = await read("docs/agent-ready-production-report.schema.json");
    const liveReportSchema = await read("docs/agent-ready-live-report.schema.json");
    const statusReportSchema = await read("docs/agent-ready-status-report.schema.json");
    const completionAuditReportSchema = await read(
      "docs/agent-ready-completion-audit-report.schema.json",
    );

    for (const [script, command] of Object.entries(agentReadyPackageScripts)) {
      expect(rootPackage.scripts?.[script]).toBe(command);
    }
    expect(turboConfig.globalDependencies).toEqual(agentReadyTurboGlobalDependencies);

    expectContainsAll(liveValidator, liveValidatorExpectedSnippets);
    expectContainsAll(builtValidator, builtValidatorExpectedSnippets);
    expectContainsAll(productionReporter, productionReporterExpectedSnippets);
    expectContainsAll(refreshReporter, refreshReporterExpectedSnippets);
    expectContainsAll(finalGate, finalGateExpectedSnippets);
    expectContainsAll(completionAuditor, completionAuditorExpectedSnippets);
    expectContainsAll(syncAuditor, syncAuditorExpectedSnippets);
    expectContainsAll(liveReportValidator, liveReportValidatorExpectedSnippets);
    expectContainsAll(productionReportValidator, productionReportValidatorExpectedSnippets);
    expectContainsAll(statusReportValidator, statusReportValidatorExpectedSnippets);
    expectContainsAll(
      completionAuditReportValidator,
      completionAuditReportValidatorExpectedSnippets,
    );

    assertAgentReadyReportSchemas({
      completionAuditReportSchema,
      liveReportSchema,
      productionReportSchema,
      statusReportSchema,
    });
  });

  registerAgentReadyReportValidatorTests(read, root);
}
