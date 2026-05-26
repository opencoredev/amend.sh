import type { Check } from "./agent-ready-completion-audit-context";
import type { CompletionAuditContext } from "./agent-ready-completion-audit-artifact-types";
import { addCrawlerArtifactChecks } from "./agent-ready-completion-audit-crawler-artifact-checks";
import { addDocsArtifactChecks } from "./agent-ready-completion-audit-docs-artifact-checks";
import { makeCheckAdder } from "./agent-ready-completion-audit-helpers";
import { addProductionArtifactChecks } from "./agent-ready-completion-audit-production-artifact-checks";

export function addCompletionArtifactChecks(
  checks: Check[],
  context: CompletionAuditContext,
  jsonOutput: boolean,
) {
  const add = makeCheckAdder(checks, jsonOutput);
  const rootPackage = JSON.parse(context.packageJson) as { scripts?: Record<string, string> };

  addCrawlerArtifactChecks(add, context);
  addDocsArtifactChecks(add, context);
  addProductionArtifactChecks(add, context, rootPackage);
}
