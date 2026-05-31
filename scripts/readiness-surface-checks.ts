import {
  add,
  agentReadyTest,
  aiCrawlerNames,
  docsCompletionAuditReportSchemaRoute,
  docsHomeRoute,
  docsLaunchPage,
  docsLlmsFullRoute,
  docsLlmsRoute,
  docsPageRoute,
  docsPackage,
  docsProductionReportSchemaRoute,
  docsRobotsRoute,
  docsSitemapRoute,
  docsLiveReportSchemaRoute,
  docsStatusReportSchemaRoute,
  rootPackage,
  turboConfig,
  webLlms,
  webPackage,
  webRobots,
  webSeo,
  webSitemap,
} from "./readiness-context";

export function runReadinessSurfaceChecks() {
  add(
    "normal dev is portless",
    rootPackage.scripts?.dev === 'WORKTREE_NAME=${WORKTREE_NAME:-$(basename "$PWD")} turbo dev' &&
      turboConfig.globalEnv?.includes("WORKTREE_NAME") === true &&
      webPackage.scripts?.dev === "portless ${WORKTREE_NAME:-amend} vite dev" &&
      docsPackage.scripts?.dev === "portless docs.${WORKTREE_NAME:-amend} next dev",
    "bun dev -> worktree-scoped portless web + docs",
  );
  add(
    "read-only quality gate exists",
    rootPackage.scripts?.check?.includes("format:check") === true,
  );
  add(
    "build size gate exists",
    rootPackage.scripts?.build?.includes("scripts/build-size.ts") === true &&
      rootPackage.scripts?.["build:size"] === "bun scripts/build-size.ts",
  );
  add(
    "agent-ready schema files invalidate cached builds",
    [
      "docs/agent-ready-production-report.schema.json",
      "docs/agent-ready-live-report.schema.json",
      "docs/agent-ready-status-report.schema.json",
      "docs/agent-ready-completion-audit-report.schema.json",
    ].every((path) => turboConfig.globalDependencies?.includes(path)),
  );
  add("runtime smoke gate exists", rootPackage.scripts?.smoke === "bun scripts/smoke.ts");
  add(
    "agent-ready live gate exists",
    rootPackage.scripts?.["agent-ready:live"] === "bun scripts/agent-ready-live.ts",
  );
  add(
    "agent-ready built artifact gate exists",
    rootPackage.scripts?.["agent-ready:built"] === "bun scripts/agent-ready-built.ts",
  );
  add(
    "agent-ready live JSON report gate exists",
    rootPackage.scripts?.["agent-ready:live:json"] === "bun scripts/agent-ready-live.ts --json",
  );
  add(
    "agent-ready status gate exists",
    rootPackage.scripts?.["agent-ready:status"] === "bun scripts/agent-ready-status.ts" &&
      rootPackage.scripts?.["agent-ready:status:json"] ===
        "bun scripts/agent-ready-status.ts --json",
  );
  add(
    "agent-ready local gate exists",
    rootPackage.scripts?.["agent-ready"] ===
      "bun test scripts/agent-ready.test.ts && bun run readiness",
  );
  add(
    "production strict readiness command exists",
    rootPackage.scripts?.["readiness:strict"] === "bun scripts/readiness.ts --strict",
  );
  add(
    "agent-ready production gate exists",
    rootPackage.scripts?.["agent-ready:production"] ===
      "bun run readiness:strict && bun run agent-ready:built && bun run agent-ready:live",
  );
  add(
    "agent-ready production JSON gate exists",
    rootPackage.scripts?.["agent-ready:production:json"] ===
      "bun scripts/agent-ready-production.ts --json" &&
      rootPackage.scripts?.["agent-ready:live:validate-report"] ===
        "bun scripts/agent-ready-live-report-validate.ts" &&
      rootPackage.scripts?.["agent-ready:status:validate-report"] ===
        "bun scripts/agent-ready-status-report-validate.ts" &&
      rootPackage.scripts?.["agent-ready:refresh-report"] ===
        "bun scripts/agent-ready-refresh-report.ts" &&
      rootPackage.scripts?.["agent-ready:completion-audit"] ===
        "bun scripts/agent-ready-completion-audit.ts" &&
      rootPackage.scripts?.["agent-ready:completion-audit:json"] ===
        "bun scripts/agent-ready-completion-audit.ts --json" &&
      rootPackage.scripts?.["agent-ready:completion-audit:validate-report"] ===
        "bun scripts/agent-ready-completion-audit-report-validate.ts" &&
      rootPackage.scripts?.["agent-ready:sync-audit"] === "bun scripts/agent-ready-sync-audit.ts" &&
      rootPackage.scripts?.["agent-ready:sync-audit:check"] ===
        "bun scripts/agent-ready-sync-audit.ts --check" &&
      rootPackage.scripts?.["agent-ready:audit:check"] ===
        "bun run agent-ready:production:validate-report agent-ready-production-report.json && bun run agent-ready:live:validate-report agent-ready-live-report.json && bun run agent-ready:status:validate-report agent-ready-status.json && bun run agent-ready:completion-audit:validate-report agent-ready-completion-audit-report.json && bun run agent-ready:sync-audit:check agent-ready-production-report.json" &&
      rootPackage.scripts?.["agent-ready:production:validate-report"] ===
        "bun scripts/agent-ready-production-report-validate.ts",
  );

  add(
    "web agent-ready robots policy is maximum visibility",
    webRobots.includes("User-agent: *") &&
      webRobots.includes("Allow: /") &&
      webRobots.includes("Sitemap: https://amend.sh/sitemap.xml") &&
      !webRobots.includes("Disallow:") &&
      aiCrawlerNames.every((crawler) => !webRobots.includes(crawler)),
  );
  add(
    "web agent-ready sitemap names public routes",
    ["/", "/brand", "/embed-demo", "/portal/amend-labs"].every((path) =>
      webSitemap.includes(`https://amend.sh${path}`),
    ) &&
      webSitemap.includes("<lastmod>") &&
      webSitemap.includes("<changefreq>") &&
      webSitemap.includes("<priority>"),
  );
  add(
    "web agent-ready llms.txt names canonical resources",
    webLlms.includes("https://amend.sh/") &&
      webLlms.includes("https://docs.amend.sh") &&
      webLlms.includes("https://docs.amend.sh/docs") &&
      webLlms.includes("https://docs.amend.sh/schemas/agent-ready-production-report.schema.json") &&
      webLlms.includes("https://docs.amend.sh/schemas/agent-ready-live-report.schema.json") &&
      webLlms.includes("https://docs.amend.sh/schemas/agent-ready-status-report.schema.json") &&
      webLlms.includes(
        "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json",
      ) &&
      webLlms.includes("Authenticated dashboard pages and API/auth routes"),
  );
  add(
    "web agent-ready metadata has structured data and noindex helper",
    webSeo.includes('"@type": "SoftwareApplication"') &&
      webSeo.includes('"@type": "Organization"') &&
      webSeo.includes("noindex, nofollow") &&
      webSeo.includes("twitter:card"),
  );
  add(
    "docs agent-ready robots and sitemap routes exist",
    docsRobotsRoute.includes("User-agent: *") &&
      docsRobotsRoute.includes("Allow: /") &&
      aiCrawlerNames.every((crawler) => !docsRobotsRoute.includes(crawler)) &&
      docsSitemapRoute.includes("{ loc: docsUrl") &&
      docsSitemapRoute.includes("source.getPages()") &&
      docsSitemapRoute.includes("<lastmod>") &&
      docsSitemapRoute.includes("<changefreq>") &&
      docsSitemapRoute.includes("<priority>") &&
      docsSitemapRoute.includes("https://docs.amend.sh"),
  );
  add(
    "docs agent-ready llms routes exist",
    docsLlmsRoute.includes("llms(source).index()") &&
      docsLlmsRoute.includes("/schemas/agent-ready-production-report.schema.json") &&
      docsLlmsRoute.includes("/schemas/agent-ready-live-report.schema.json") &&
      docsLlmsRoute.includes("/schemas/agent-ready-status-report.schema.json") &&
      docsLlmsRoute.includes("/schemas/agent-ready-completion-audit-report.schema.json") &&
      docsLlmsRoute.includes("text/plain") &&
      docsLlmsFullRoute.includes("source.getPages().map(getLLMText)") &&
      docsLlmsFullRoute.includes("text/plain"),
  );
  add(
    "docs agent-ready report schema routes exist",
    docsProductionReportSchemaRoute.includes("application/schema+json") &&
      docsProductionReportSchemaRoute.includes("agent-ready-production-report.schema.json") &&
      docsProductionReportSchemaRoute.includes("JSON.stringify(schema, null, 2)") &&
      docsLiveReportSchemaRoute.includes("application/schema+json") &&
      docsLiveReportSchemaRoute.includes("agent-ready-live-report.schema.json") &&
      docsLiveReportSchemaRoute.includes("JSON.stringify(schema, null, 2)") &&
      docsStatusReportSchemaRoute.includes("application/schema+json") &&
      docsStatusReportSchemaRoute.includes("agent-ready-status-report.schema.json") &&
      docsStatusReportSchemaRoute.includes("JSON.stringify(schema, null, 2)") &&
      docsCompletionAuditReportSchemaRoute.includes("application/schema+json") &&
      docsCompletionAuditReportSchemaRoute.includes(
        "agent-ready-completion-audit-report.schema.json",
      ) &&
      docsCompletionAuditReportSchemaRoute.includes("JSON.stringify(schema, null, 2)"),
  );
  add(
    "docs launch page names agent-ready live gate",
    docsLaunchPage.includes("bun run agent-ready:built") &&
      docsLaunchPage.includes("bun run agent-ready:live") &&
      docsLaunchPage.includes("A/AAAA or CNAME DNS records"),
  );
  add(
    "docs launch page names canonical docs host and main-site proxy",
    docsLaunchPage.includes("Use the dedicated docs host for this launch") &&
      docsLaunchPage.includes("https://docs.amend.sh/docs") &&
      docsLaunchPage.includes("https://amend.sh/docs"),
  );
  add(
    "docs agent-ready structured data exists",
    docsHomeRoute.includes('"@type": "WebSite"') &&
      docsHomeRoute.includes('"@type": "Organization"') &&
      docsHomeRoute.includes('type="application/ld+json"') &&
      docsPageRoute.includes('"@type": "TechArticle"') &&
      docsPageRoute.includes('"@type": "WebSite"') &&
      docsPageRoute.includes('type="application/ld+json"'),
  );
  add(
    "agent-ready regression tests cover source surfaces",
    agentReadyTest.includes("Agent-ready public surfaces") &&
      agentReadyTest.includes("shared crawler policy covers every named agent once") &&
      agentReadyTest.includes("aiAccessUserAgents") &&
      agentReadyTest.includes("web robots and sitemap") &&
      agentReadyTest.includes("docs host") &&
      agentReadyTest.includes('DEFAULT_PRODUCTION_DOCS_URL = "https://amend.sh/docs"'),
  );
}
