import { readCompletionAuditContextFiles } from "./agent-ready-completion-audit-context-files";
import type { ProductionReport } from "./agent-ready-completion-audit-context-types";

export type { Check, ProductionReport } from "./agent-ready-completion-audit-context-types";
export { parseCompletionAuditArgs } from "./agent-ready-completion-audit-args";

export async function loadCompletionAuditContext(reportPath: string) {
  const files = await readCompletionAuditContextFiles(reportPath);

  return {
    agentReadyAudit: files.agentReadyAudit,
    builtValidator: [
      files.builtValidator,
      files.builtWebValidator,
      files.builtDocsValidator,
      files.builtDocsArtifacts,
      files.builtDocsCoreChecks,
      files.builtDocsPageChecks,
      files.builtDocsSchemaChecks,
      files.builtValidatorUtils,
    ].join("\n"),
    completionAudit: files.completionAudit,
    completionReportValidator: [
      files.completionReportValidator,
      files.completionReportValidatorCore,
    ].join("\n"),
    docsHomeRoute: files.docsHomeRoute,
    docsLaunchPage: files.docsLaunchPage,
    docsLayoutRoute: files.docsLayoutRoute,
    docsLlmsFullRoute: files.docsLlmsFullRoute,
    docsLlmsRoute: files.docsLlmsRoute,
    docsMarkdownRoute: files.docsMarkdownRoute,
    docsPageRoute: files.docsPageRoute,
    docsRobotsRoute: files.docsRobotsRoute,
    docsSitemapRoute: files.docsSitemapRoute,
    finalGate: files.finalGate,
    launchRunbook: files.launchRunbook,
    liveReportValidator: files.liveReportValidator,
    liveValidator: [
      files.liveValidator,
      files.liveValidatorSurfaces,
      files.liveValidatorWebSurface,
      files.liveValidatorDocsSurface,
      files.liveValidatorDocsSchemas,
      files.liveValidatorSurfaceUtils,
      files.liveValidatorChecks,
      files.liveValidatorDns,
      files.liveValidatorFetchChecks,
      files.liveValidatorFetchClient,
      files.liveValidatorTextEndpointChecks,
      files.liveValidatorAiAccessChecks,
      files.liveValidatorLlmsCrossChecks,
      files.liveValidatorParsing,
      files.liveValidatorTypes,
    ].join("\n"),
    packageJson: files.packageJson,
    productionEnvContract: files.productionEnvContract,
    productionEnvExample: files.productionEnvExample,
    productionReport: JSON.parse(files.productionReportContent) as ProductionReport,
    productionReporter: files.productionReporter,
    statusReporter: files.statusReporter,
    webBrandRoute: files.webBrandRoute,
    webEmbedDemoRoute: files.webEmbedDemoRoute,
    webIndexRoute: files.webIndexRoute,
    webLlms: files.webLlms,
    webPortalRoute: files.webPortalRoute,
    webRobots: files.webRobots,
    webSeo: files.webSeo,
    webSitemap: files.webSitemap,
  };
}
