import { read, readMeta } from "./agent-ready-built-utils";

export type BuiltDocsArtifacts = Awaited<ReturnType<typeof loadBuiltDocsArtifacts>>;

export async function loadBuiltDocsArtifacts() {
  return {
    appPathRoutesManifest: await read("apps/fumadocs/.next/app-path-routes-manifest.json"),
    docsCompletionAuditReportSchema: await read(
      "apps/fumadocs/.next/server/app/schemas/agent-ready-completion-audit-report.schema.json.body",
    ),
    docsCompletionAuditReportSchemaMeta: await readMeta(
      "apps/fumadocs/.next/server/app/schemas/agent-ready-completion-audit-report.schema.json.meta",
    ),
    docsHome: await read("apps/fumadocs/.next/server/app/index.html"),
    docsLiveReportSchema: await read(
      "apps/fumadocs/.next/server/app/schemas/agent-ready-live-report.schema.json.body",
    ),
    docsLiveReportSchemaMeta: await readMeta(
      "apps/fumadocs/.next/server/app/schemas/agent-ready-live-report.schema.json.meta",
    ),
    docsLlms: await read("apps/fumadocs/.next/server/app/llms.txt.body"),
    docsLlmsFull: await read("apps/fumadocs/.next/server/app/llms-full.txt.body"),
    docsLlmsFullMeta: await readMeta("apps/fumadocs/.next/server/app/llms-full.txt.meta"),
    docsLlmsMeta: await readMeta("apps/fumadocs/.next/server/app/llms.txt.meta"),
    docsProductionReportSchema: await read(
      "apps/fumadocs/.next/server/app/schemas/agent-ready-production-report.schema.json.body",
    ),
    docsProductionReportSchemaMeta: await readMeta(
      "apps/fumadocs/.next/server/app/schemas/agent-ready-production-report.schema.json.meta",
    ),
    docsRobots: await read("apps/fumadocs/.next/server/app/robots.txt.body"),
    docsRobotsMeta: await readMeta("apps/fumadocs/.next/server/app/robots.txt.meta"),
    docsSitemap: await read("apps/fumadocs/.next/server/app/sitemap.xml.body"),
    docsSitemapMeta: await readMeta("apps/fumadocs/.next/server/app/sitemap.xml.meta"),
    docsStatusReportSchema: await read(
      "apps/fumadocs/.next/server/app/schemas/agent-ready-status-report.schema.json.body",
    ),
    docsStatusReportSchemaMeta: await readMeta(
      "apps/fumadocs/.next/server/app/schemas/agent-ready-status-report.schema.json.meta",
    ),
    routesManifest: await read("apps/fumadocs/.next/routes-manifest.json"),
  };
}
