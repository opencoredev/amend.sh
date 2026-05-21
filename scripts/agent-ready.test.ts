import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";
import { aiCrawlerNames } from "./agent-ready-policy";
import { aiAccessUserAgents } from "./agent-ready-policy";
import {
  productionEnvChecks,
  requiredProductionEnv,
  webProductionEnvKeys,
} from "./agent-ready-production-env";

const root = new URL("../", import.meta.url);

async function read(path: string) {
  return await readFile(new URL(path, root), "utf8");
}

describe("Agent-ready public surfaces", () => {
  test("shared crawler policy covers every named agent once", () => {
    const expectedCrawlerNames = [
      "GPTBot",
      "ChatGPT-User",
      "OAI-SearchBot",
      "ClaudeBot",
      "Claude-User",
      "Claude-SearchBot",
      "PerplexityBot",
      "Perplexity-User",
      "Googlebot",
      "Google-Extended",
      "Bingbot",
      "CCBot",
    ];
    const accessAgentNames = aiAccessUserAgents.map((agent) => agent.name);

    expect(aiCrawlerNames).toEqual(expectedCrawlerNames);
    expect(new Set(aiCrawlerNames).size).toBe(aiCrawlerNames.length);
    expect(accessAgentNames.toSorted()).toEqual([...aiCrawlerNames].toSorted());
    for (const agent of aiAccessUserAgents) {
      expect(agent.value.toLowerCase()).toContain(agent.name.toLowerCase());
    }
  });

  test("shared production env contract covers every launch key once", () => {
    const expectedProductionEnv = [
      "VITE_CONVEX_URL",
      "VITE_CONVEX_SITE_URL",
      "VITE_DOCS_URL",
      "SITE_URL",
      "BETTER_AUTH_SECRET",
      "GITHUB_WEBHOOK_SECRET",
      "GITHUB_APP_ID",
      "GITHUB_APP_SLUG",
      "GITHUB_APP_CLIENT_ID",
      "GITHUB_APP_CLIENT_SECRET",
      "GITHUB_APP_PRIVATE_KEY",
      "AMEND_API_TOKEN",
      "OPENAI_API_KEY",
      "OPENAI_MODEL",
      "CROF_API_KEY",
      "CROF_MODEL",
      "CROF_BASE_URL",
      "RESEND_API_KEY",
      "EMAIL_FROM",
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
    ];
    const envKeys = productionEnvChecks.map(([key]) => key);

    expect(requiredProductionEnv).toEqual(expectedProductionEnv);
    expect(envKeys).toEqual(expectedProductionEnv);
    expect(new Set(requiredProductionEnv).size).toBe(requiredProductionEnv.length);
    expect(new Set(envKeys).size).toBe(envKeys.length);
    expect([...webProductionEnvKeys]).toEqual([
      "VITE_CONVEX_URL",
      "VITE_CONVEX_SITE_URL",
      "VITE_DOCS_URL",
    ]);
    expect([...webProductionEnvKeys].every((key) => requiredProductionEnv.includes(key))).toBe(
      true,
    );
    for (const [, purpose] of productionEnvChecks) {
      expect(purpose.length).toBeGreaterThan(0);
    }
  });

  test("web robots and sitemap use maximum-visibility policy on amend.sh", async () => {
    const robots = await read("apps/web/public/robots.txt");
    const sitemap = await read("apps/web/public/sitemap.xml");
    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
    expect(robots).toContain("Sitemap: https://amend.sh/sitemap.xml");
    expect(robots).not.toContain("Disallow:");
    for (const crawler of aiCrawlerNames) {
      expect(robots).not.toContain(crawler);
    }

    for (const path of ["/", "/brand", "/embed-demo", "/portal/amend-labs"]) {
      const suffix = path === "/" ? "/" : path;
      expect(sitemap).toContain(`<loc>https://amend.sh${suffix}</loc>`);
    }
    expect(sitemap.match(/<lastmod>/g)?.length).toBe(4);
    expect(sitemap.match(/<changefreq>/g)?.length).toBe(4);
    expect(sitemap.match(/<priority>/g)?.length).toBe(4);

    for (const privatePath of ["/dashboard", "/sign-in", "/sign-up", "/api/auth"]) {
      expect(sitemap).not.toContain(`https://amend.sh${privatePath}`);
    }
  });

  test("web llms.txt points agents at canonical public resources", async () => {
    const llms = await read("apps/web/public/llms.txt");

    for (const url of [
      "https://amend.sh/",
      "https://amend.sh/brand",
      "https://amend.sh/embed-demo",
      "https://amend.sh/portal/amend-labs",
      "https://docs.amend.sh",
      "https://docs.amend.sh/docs",
      "https://docs.amend.sh/docs/quickstart",
      "https://docs.amend.sh/docs/integration",
      "https://docs.amend.sh/docs/self-hosting",
      "https://docs.amend.sh/docs/source-trace",
      "https://docs.amend.sh/docs/launch",
      "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json",
      "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json",
      "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json",
      "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json",
    ]) {
      expect(llms).toContain(url);
    }

    expect(llms).toContain("Authenticated dashboard pages and API/auth routes");
    expect(llms).toContain("not a guarantee of AI search inclusion");
  });

  test("web metadata exposes canonicals, social metadata, structured data, and private noindex", async () => {
    const seo = await read("apps/web/src/lib/seo.ts");
    const docsUrlHelper = await read("apps/web/src/lib/docs-url.ts");
    const productionEnvExample = await read(".env.production.example");
    const homepage = await read("apps/web/src/routes/index.tsx");
    const publicRoutes = [
      await read("apps/web/src/routes/brand.tsx"),
      await read("apps/web/src/routes/embed-demo.tsx"),
      await read("apps/web/src/routes/portal.$workspaceSlug.tsx"),
    ];
    const privateRoutes = [
      await read("apps/web/src/routes/sign-in.tsx"),
      await read("apps/web/src/routes/sign-up.tsx"),
      await read("apps/web/src/routes/dashboard.tsx"),
      await read("apps/web/src/routes/dashboard.$view.tsx"),
    ];

    expect(seo).toContain('siteUrl = "https://amend.sh"');
    expect(seo).toContain('agentDocsUrl = "https://docs.amend.sh"');
    expect(seo).toContain('"@type": "SoftwareApplication"');
    expect(seo).toContain('"@type": "Organization"');
    expect(seo).toContain('name: "robots", content: "noindex, nofollow"');
    expect(seo).toContain("twitter:card");
    expect(docsUrlHelper).toContain('DEFAULT_PRODUCTION_DOCS_URL = "https://docs.amend.sh/docs"');
    expect(docsUrlHelper).not.toContain('DEFAULT_PRODUCTION_DOCS_URL = "/docs"');
    expect(productionEnvExample).toContain("VITE_DOCS_URL=https://docs.amend.sh/docs");
    expect(productionEnvExample).toContain("SITE_URL=https://amend.sh");
    expect(productionEnvExample).toContain("EMAIL_FROM=Amend <updates@amend.sh>");
    expect(productionEnvExample).not.toContain("VITE_DOCS_URL=/docs");
    expect(productionEnvExample).not.toContain("SITE_URL=https://updates.example.com");

    expect(homepage).toContain('canonicalLink("/")');
    expect(homepage).toContain('type="application/ld+json"');
    expect(homepage).toContain("organizationJsonLd");
    expect(homepage).toContain("productJsonLd");

    for (const route of publicRoutes) {
      expect(route).toContain("canonicalLink(");
      expect(route).toContain("openGraphMeta(");
    }

    for (const route of privateRoutes) {
      expect(route).toContain("noIndexMeta");
    }
  });

  test("docs host has maximum-visibility robots, generated sitemap, llms routes, and canonical metadata", async () => {
    const robotsRoute = await read("apps/fumadocs/src/app/robots.txt/route.ts");
    const sitemapRoute = await read("apps/fumadocs/src/app/sitemap.xml/route.ts");
    const layout = await read("apps/fumadocs/src/app/layout.tsx");
    const docsHome = await read("apps/fumadocs/src/app/(home)/page.tsx");
    const docsPage = await read("apps/fumadocs/src/app/docs/[[...slug]]/page.tsx");
    const llmsIndex = await read("apps/fumadocs/src/app/llms.txt/route.ts");
    const llmsFull = await read("apps/fumadocs/src/app/llms-full.txt/route.ts");
    const llmsMarkdown = await read("apps/fumadocs/src/app/llms.mdx/docs/[[...slug]]/route.ts");
    const productionReportSchemaRoute = await read(
      "apps/fumadocs/src/app/schemas/agent-ready-production-report.schema.json/route.ts",
    );
    const liveReportSchemaRoute = await read(
      "apps/fumadocs/src/app/schemas/agent-ready-live-report.schema.json/route.ts",
    );
    const statusReportSchemaRoute = await read(
      "apps/fumadocs/src/app/schemas/agent-ready-status-report.schema.json/route.ts",
    );
    const completionAuditReportSchemaRoute = await read(
      "apps/fumadocs/src/app/schemas/agent-ready-completion-audit-report.schema.json/route.ts",
    );
    expect(robotsRoute).toContain("User-agent: *");
    expect(robotsRoute).toContain("Allow: /");
    expect(robotsRoute).toContain('docsUrl = "https://docs.amend.sh"');
    expect(robotsRoute).toContain("${docsUrl}/sitemap.xml");
    expect(robotsRoute).not.toContain("Disallow:");
    for (const crawler of aiCrawlerNames) {
      expect(robotsRoute).not.toContain(crawler);
    }

    expect(sitemapRoute).toContain('docsUrl = "https://docs.amend.sh"');
    expect(sitemapRoute).toContain("{ loc: docsUrl");
    expect(sitemapRoute).toContain("${docsUrl}/schemas/agent-ready-production-report.schema.json");
    expect(sitemapRoute).toContain("${docsUrl}/schemas/agent-ready-live-report.schema.json");
    expect(sitemapRoute).toContain("${docsUrl}/schemas/agent-ready-status-report.schema.json");
    expect(sitemapRoute).toContain(
      "${docsUrl}/schemas/agent-ready-completion-audit-report.schema.json",
    );
    expect(sitemapRoute).toContain("source.getPages()");
    expect(sitemapRoute).toContain("<urlset");
    expect(sitemapRoute).toContain("<lastmod>");
    expect(sitemapRoute).toContain("<changefreq>");
    expect(sitemapRoute).toContain("<priority>");

    expect(layout).toContain('metadataBase: new URL("https://docs.amend.sh")');
    expect(layout).toContain("canonical");
    expect(layout).toContain("openGraph");
    expect(docsHome).toContain('type="application/ld+json"');
    expect(docsHome).toContain('"@type": "WebSite"');
    expect(docsHome).toContain('"@type": "Organization"');
    expect(docsPage).toContain("canonical: page.url");
    expect(docsPage).toContain("openGraph");
    expect(docsPage).toContain('type="application/ld+json"');
    expect(docsPage).toContain('"@type": "TechArticle"');
    expect(docsPage).toContain('"@type": "WebSite"');

    expect(llmsIndex).toContain("llms(source).index()");
    expect(llmsIndex).toContain("/schemas/agent-ready-production-report.schema.json");
    expect(llmsIndex).toContain("/schemas/agent-ready-live-report.schema.json");
    expect(llmsIndex).toContain("/schemas/agent-ready-status-report.schema.json");
    expect(llmsIndex).toContain("/schemas/agent-ready-completion-audit-report.schema.json");
    expect(llmsIndex).toContain("Content-Type");
    expect(llmsIndex).toContain("text/plain");
    expect(llmsFull).toContain("source.getPages().map(getLLMText)");
    expect(llmsFull).toContain("Content-Type");
    expect(llmsFull).toContain("text/plain");
    expect(llmsMarkdown).toContain("Content-Type");
    expect(llmsMarkdown).toContain("text/markdown");
    expect(productionReportSchemaRoute).toContain("application/schema+json");
    expect(productionReportSchemaRoute).toContain("agent-ready-production-report.schema.json");
    expect(productionReportSchemaRoute).toContain("JSON.stringify(schema, null, 2)");
    expect(liveReportSchemaRoute).toContain("application/schema+json");
    expect(liveReportSchemaRoute).toContain("agent-ready-live-report.schema.json");
    expect(liveReportSchemaRoute).toContain("JSON.stringify(schema, null, 2)");
    expect(statusReportSchemaRoute).toContain("application/schema+json");
    expect(statusReportSchemaRoute).toContain("agent-ready-status-report.schema.json");
    expect(statusReportSchemaRoute).toContain("JSON.stringify(schema, null, 2)");
    expect(completionAuditReportSchemaRoute).toContain("application/schema+json");
    expect(completionAuditReportSchemaRoute).toContain(
      "agent-ready-completion-audit-report.schema.json",
    );
    expect(completionAuditReportSchemaRoute).toContain("JSON.stringify(schema, null, 2)");
  });

  test("live validator covers deployed DNS, files, metadata, structured data, and noindex", async () => {
    const rootPackage = JSON.parse(await read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const turboConfig = JSON.parse(await read("turbo.json")) as {
      globalDependencies?: string[];
    };
    const liveValidator = await read("scripts/agent-ready-live.ts");
    const builtValidator = await read("scripts/agent-ready-built.ts");
    const productionReporter = await read("scripts/agent-ready-production.ts");
    const refreshReporter = await read("scripts/agent-ready-refresh-report.ts");
    const finalGate = await read("scripts/agent-ready-final-gate.ts");
    const completionAuditor = await read("scripts/agent-ready-completion-audit.ts");
    const syncAuditor = await read("scripts/agent-ready-sync-audit.ts");
    const productionReportValidator = await read(
      "scripts/agent-ready-production-report-validate.ts",
    );
    const statusReportValidator = await read("scripts/agent-ready-status-report-validate.ts");
    const liveReportValidator = await read("scripts/agent-ready-live-report-validate.ts");
    const completionAuditReportValidator = await read(
      "scripts/agent-ready-completion-audit-report-validate.ts",
    );
    const productionReportSchema = await read("docs/agent-ready-production-report.schema.json");
    const liveReportSchema = await read("docs/agent-ready-live-report.schema.json");
    const statusReportSchema = await read("docs/agent-ready-status-report.schema.json");
    const completionAuditReportSchema = await read(
      "docs/agent-ready-completion-audit-report.schema.json",
    );

    expect(rootPackage.scripts?.["agent-ready:production"]).toBe(
      "bun run readiness:strict && bun run agent-ready:built && bun run agent-ready:live",
    );
    expect(rootPackage.scripts?.["agent-ready:production:json"]).toBe(
      "bun scripts/agent-ready-production.ts --json",
    );
    expect(rootPackage.scripts?.["agent-ready:refresh-report"]).toBe(
      "bun scripts/agent-ready-refresh-report.ts",
    );
    expect(rootPackage.scripts?.["agent-ready:final-gate"]).toBe(
      "bun scripts/agent-ready-final-gate.ts",
    );
    expect(rootPackage.scripts?.["agent-ready:status:validate-report"]).toBe(
      "bun scripts/agent-ready-status-report-validate.ts",
    );
    expect(rootPackage.scripts?.["agent-ready:completion-audit"]).toBe(
      "bun scripts/agent-ready-completion-audit.ts",
    );
    expect(rootPackage.scripts?.["agent-ready:completion-audit:json"]).toBe(
      "bun scripts/agent-ready-completion-audit.ts --json",
    );
    expect(rootPackage.scripts?.["agent-ready:completion-audit:validate-report"]).toBe(
      "bun scripts/agent-ready-completion-audit-report-validate.ts",
    );
    expect(rootPackage.scripts?.["agent-ready:production:validate-report"]).toBe(
      "bun scripts/agent-ready-production-report-validate.ts",
    );
    expect(rootPackage.scripts?.["agent-ready:live:validate-report"]).toBe(
      "bun scripts/agent-ready-live-report-validate.ts",
    );
    expect(rootPackage.scripts?.["agent-ready:audit:check"]).toBe(
      "bun run agent-ready:production:validate-report agent-ready-production-report.json && bun run agent-ready:live:validate-report agent-ready-live-report.json && bun run agent-ready:status:validate-report agent-ready-status.json && bun run agent-ready:completion-audit:validate-report agent-ready-completion-audit-report.json && bun run agent-ready:sync-audit:check agent-ready-production-report.json",
    );

    expect(turboConfig.globalDependencies).toEqual([
      "docs/agent-ready-production-report.schema.json",
      "docs/agent-ready-live-report.schema.json",
      "docs/agent-ready-status-report.schema.json",
      "docs/agent-ready-completion-audit-report.schema.json",
    ]);

    for (const expected of [
      "apex is registered",
      "https://rdap.org/domain/",
      "Register ${apex}.",
      "apex is delegated",
      "DNS resolves",
      "resolveCname",
      "Create A/AAAA or CNAME records",
      "aiCrawlerNames",
      "/robots.txt",
      "/sitemap.xml",
      "<lastmod>",
      "<changefreq>",
      "<priority>",
      "extractSitemapLocs",
      "extractMarkdownLinks",
      "duplicateValues",
      "has sitemap loc entries",
      "has no duplicate sitemap locs",
      "sitemap locs stay on expected origin",
      "checkLlmsLinksAgainstSitemaps",
      "web /llms.txt links stay on web or docs origins",
      "web /llms.txt web links appear in web sitemap",
      "web /llms.txt docs links appear in docs sitemap",
      "docs /llms.txt relative links appear in docs sitemap",
      "/brand",
      "/embed-demo",
      "/portal/amend-labs",
      "/llms.txt",
      "/llms-full.txt",
      "/schemas/agent-ready-production-report.schema.json",
      "/schemas/agent-ready-live-report.schema.json",
      "/schemas/agent-ready-status-report.schema.json",
      "/schemas/agent-ready-completion-audit-report.schema.json",
      "content-type",
      "parseJsonObject",
      "is parseable JSON object",
      "text/plain",
      "application/xml",
      "text/html",
      "stays on expected origin",
      "finalUrl.origin === origin",
      "x-robots-tag allows indexing",
      "x-robots-tag",
      "extractJsonLdTypes",
      "has valid JSON-LD",
      "structuredDataTypes",
      "excludes",
      "Disallow:",
      "agent-ready-policy",
      "aiAccessUserAgents",
      "checkAiUserAgentAccess",
      "allows ${userAgent.name}",
      "/dashboard",
      "/api/chat",
      "/api/search",
      'property="og:url"',
      'name="twitter:card"',
      '"@type":"Organization"',
      '"@type":"SoftwareApplication"',
      '"@type":"WebSite"',
      '"@type":"TechArticle"',
      "noindex, nofollow",
      "Source-linked product updates",
      'href="${docsOrigin}/docs"',
      "/docs/quickstart",
      "/docs/integration",
      "/docs/source-trace",
      "/docs/self-hosting",
      "/docs/launch",
      "/schemas/agent-ready-production-report.schema.json",
      "/schemas/agent-ready-live-report.schema.json",
      "/schemas/agent-ready-status-report.schema.json",
      "/schemas/agent-ready-completion-audit-report.schema.json",
      "--json",
      "jsonOutput",
      "--json-file",
      "writeFile",
      "checkedAt",
      "reportSchemaUrl",
      '"$schema"',
      "origins",
      "blockers",
      "nextGates",
      '"const": "bun run agent-ready:production"',
      '"const": "bun run agent-ready:final-gate"',
    ]) {
      expect(liveValidator).toContain(expected);
    }

    for (const expected of [
      "apps/web/dist/client/robots.txt",
      "apps/web/dist/client/sitemap.xml",
      "apps/web/dist/client/llms.txt",
      "apps/fumadocs/.next/server/app/robots.txt.body",
      "apps/fumadocs/.next/server/app/robots.txt.meta",
      "apps/fumadocs/.next/server/app/sitemap.xml.body",
      "apps/fumadocs/.next/server/app/sitemap.xml.meta",
      "apps/fumadocs/.next/server/app/llms.txt.body",
      "apps/fumadocs/.next/server/app/llms.txt.meta",
      "apps/fumadocs/.next/server/app/llms-full.txt.body",
      "apps/fumadocs/.next/server/app/llms-full.txt.meta",
      "apps/fumadocs/.next/server/app/schemas/agent-ready-production-report.schema.json.body",
      "apps/fumadocs/.next/server/app/schemas/agent-ready-production-report.schema.json.meta",
      "apps/fumadocs/.next/server/app/schemas/agent-ready-live-report.schema.json.body",
      "apps/fumadocs/.next/server/app/schemas/agent-ready-live-report.schema.json.meta",
      "apps/fumadocs/.next/server/app/schemas/agent-ready-status-report.schema.json.body",
      "apps/fumadocs/.next/server/app/schemas/agent-ready-status-report.schema.json.meta",
      "apps/fumadocs/.next/server/app/schemas/agent-ready-completion-audit-report.schema.json.body",
      "apps/fumadocs/.next/server/app/schemas/agent-ready-completion-audit-report.schema.json.meta",
      "https://docs.amend.sh/api/chat",
      "https://docs.amend.sh/api/search",
      "metaHasContentType",
      "isParseableJsonObject",
      "built docs robots has text/plain metadata",
      "built docs sitemap has application/xml metadata",
      "built docs llms resources have text/plain metadata",
      "built docs Markdown mirror has text/markdown metadata",
      "built docs production report schema endpoint exposes JSON Schema",
      "built docs live report schema endpoint exposes JSON Schema",
      "built docs status report schema endpoint exposes JSON Schema",
      "built docs completion audit report schema endpoint exposes JSON Schema",
      '"nextGates"',
      '"const": "bun run agent-ready:production"',
      '"const": "bun run agent-ready:final-gate"',
      "application/schema+json",
      "built web sitemap has unique on-origin locs",
      "built web llms.txt links are unique and on allowed origins",
      "built web llms.txt web links appear in web sitemap",
      "built web llms.txt docs links appear in docs sitemap",
      "built docs sitemap has unique on-origin locs",
      "built docs llms.txt links are unique and represented in docs sitemap",
      "agent-ready-policy",
      "extractMarkdownLinks",
      "hasNoDuplicateValues",
      "locsStayOnOrigin",
      "apps/fumadocs/.next/server/app/index.html",
      "apps/fumadocs/.next/server/app/docs/quickstart.html",
      "apps/fumadocs/.next/server/app/llms.mdx/docs/quickstart/content.md.body",
      "Agent-ready built summary",
      "bun run build",
    ]) {
      expect(builtValidator).toContain(expected);
    }

    for (const expected of [
      'runCommand(["bun", "scripts/readiness.ts", "--strict"])',
      'runCommand(["bun", "scripts/agent-ready-built.ts"])',
      'runCommand(["bun", "scripts/agent-ready-status.ts", "--json"])',
      'runCommand(["bun", "scripts/agent-ready-live.ts", "--json"])',
      "parseReadinessSummary",
      "parseBuiltSummary",
      "blockersFrom",
      "Pass strict readiness with production environment values loaded.",
      "Build the web and docs apps, then pass built artifact validation.",
      "Pass the live agent-ready validator against amend.sh and docs.amend.sh.",
      "reportSchemaUrl",
      "readinessStrict",
      "checkedAt",
      "--json-file",
      "writeFile",
    ]) {
      expect(productionReporter).toContain(expected);
    }

    for (const expected of [
      "scripts/agent-ready-production.ts",
      "scripts/agent-ready-sync-audit.ts",
      "agent-ready:audit:check",
      "scripts/agent-ready-live.ts",
      "agent-ready-live-report.json",
      "scripts/agent-ready-completion-audit.ts",
      "scripts/agent-ready-status.ts",
      "agent-ready-status.json",
      "--allow-production-blockers",
      "--json-file",
      "agent-ready-completion-audit-report.json",
      "Validate reports and synced audits",
      "status.exitCode",
      "production.exitCode",
      "refreshed with blockers",
    ]) {
      expect(refreshReporter).toContain(expected);
    }
    for (const expected of [
      "Generate strict production report",
      "scripts/agent-ready-production.ts",
      "Generate standalone live report",
      "scripts/agent-ready-live.ts",
      "agent-ready-live-report.json",
      "Validate live report",
      "scripts/agent-ready-live-report-validate.ts",
      "Run strict completion audit",
      "scripts/agent-ready-completion-audit.ts",
      "Generate no-secret status",
      "scripts/agent-ready-status.ts",
      "agent-ready-status.json",
      "Validate status report",
      "scripts/agent-ready-status-report-validate.ts",
      "Require production report to be green",
      "scripts/agent-ready-production-report-validate.ts",
      "Require live report to be green",
      "Require status report to be green",
      "scripts/agent-ready-status-report-validate.ts",
      "Require completion audit report to be green",
      "scripts/agent-ready-completion-audit-report-validate.ts",
      "scripts/agent-ready-sync-audit.ts",
      "--require-ok",
      "Agent-ready final gate passed",
      "Agent-ready final gate failed",
    ]) {
      expect(finalGate).toContain(expected);
    }

    for (const expected of [
      "Agent-ready completion audit",
      "maximum-visibility web robots policy exists",
      "web llms.txt maps web and docs resources",
      "Agent-ready live report JSON Schema",
      "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json",
      "Agent-ready status report JSON Schema",
      "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json",
      "canonical and social metadata are wired",
      "structured data is wired",
      "crawlable public content is verified",
      "isParseableJsonObject",
      "parseJsonObject",
      "is parseable JSON object",
      "production launch handoff uses Amend.sh origins",
      "SITE_URL=https://amend.sh",
      "EMAIL_FROM=Amend <updates@amend.sh>",
      "Require status report to be green",
      "saved production report has passing strict readiness",
      "saved production report has all production env loaded",
      "saved production report has passing live validator",
      "saved production report is complete and blocker-free",
      "allowProductionBlockers",
      "reportSchemaUrl",
      "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json",
      "--json",
      "--json-file",
      "writeFile",
      "missingOrBlocked",
      "Only external production blockers remain.",
      "process.exitCode = 1",
    ]) {
      expect(completionAuditor).toContain(expected);
    }

    for (const expected of [
      "agent-ready-production-report.json",
      "agent-ready-live-report.json",
      "assertStandaloneLiveReportSynced",
      "normalizedLiveReport",
      "stableValue",
      "comparableLiveReport",
      "matches the embedded live report",
      "Latest JSON live check",
      "Latest agent-ready status check",
      "Latest agent-ready live check",
      "live report checkedAt",
      "status report checkedAt",
    ]) {
      expect(syncAuditor).toContain(expected);
    }

    for (const expected of [
      "agent-ready-live-report.json",
      "reportSchemaUrl",
      "$.$schema",
      "--require-ok",
      "validateConsistency",
      "must equal the number of passing checks",
      "must equal whether passed equals total",
      "must be true when --require-ok is used",
      "Valid agent-ready live report",
      "Invalid agent-ready live report",
    ]) {
      expect(liveReportValidator).toContain(expected);
    }

    for (const expected of [
      "agent-ready-production-report.json",
      "reportSchemaUrl",
      "$.$schema",
      "--require-ok",
      "$.blockers",
      "$.checkedAt",
      "$.steps",
      "validateLiveReport",
      "validateStatusReport",
      "validateReportConsistency",
      "requirePassingStep",
      "statusReportSchemaUrl",
      "liveReportSchemaUrl",
      "must equal whether every step is ok",
      "requiredNextGates",
      "validateExactStringArray",
      "must contain exactly",
      "built",
      "live",
      "readinessStrict",
      "status",
      "Valid agent-ready production report",
      "Invalid agent-ready production report",
    ]) {
      expect(productionReportValidator).toContain(expected);
    }

    for (const expected of [
      "agent-ready-status.json",
      "reportSchemaUrl",
      "$.$schema",
      "--require-ok",
      "requiredNextGates",
      "validateExactStringArray",
      "must account for total minus passed",
      "must be true when --require-ok is used",
      "must be empty when --require-ok is used",
      "must equal total when --require-ok is used",
      "must not be empty when --require-ok is used",
      "Valid agent-ready status report",
      "Invalid agent-ready status report",
    ]) {
      expect(statusReportValidator).toContain(expected);
    }

    for (const expected of [
      "agent-ready-completion-audit-report.json",
      "reportSchemaUrl",
      "$.$schema",
      "--require-ok",
      "$.completionOk",
      "$.missingOrBlocked",
      "$.summary.failed",
      "validateReportConsistency",
      "productionBlockerCheckNames",
      "must equal the number of failing checks",
      "must equal the number of passing checks",
      "must equal completionOk or allowed production blockers",
      "must be true when --require-ok is used",
      "must be empty when --require-ok is used",
      "Valid agent-ready completion audit report",
      "Invalid agent-ready completion audit report",
    ]) {
      expect(completionAuditReportValidator).toContain(expected);
    }

    for (const expected of [
      '"$schema": "https://json-schema.org/draft/2020-12/schema"',
      '"$id": "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json"',
      '"required": ["$schema", "blockers", "checkedAt", "ok", "steps"]',
      '"const": "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json"',
      '"required": ["built", "live", "readinessStrict", "status"]',
      '"summaryStep"',
      '"liveReport"',
      '"const": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
      '"statusReport"',
      '"const": "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json"',
      '"nextGates"',
      '"prefixItems"',
      '"const": "bun run agent-ready:production"',
      '"const": "bun run agent-ready:final-gate"',
      '"liveStep"',
      '"statusStep"',
      '"format": "date-time"',
      '"additionalProperties": false',
    ]) {
      expect(productionReportSchema).toContain(expected);
    }

    for (const expected of [
      '"$schema": "https://json-schema.org/draft/2020-12/schema"',
      '"$id": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
      '"required": ["$schema", "blockers", "checkedAt", "checks", "ok", "origins", "passed", "total"]',
      '"const": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
      '"checks"',
      '"origins"',
      '"passed"',
      '"total"',
      '"format": "date-time"',
      '"additionalProperties": false',
    ]) {
      expect(liveReportSchema).toContain(expected);
    }

    for (const expected of [
      '"$schema": "https://json-schema.org/draft/2020-12/schema"',
      '"$id": "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json"',
      '"$schema"',
      '"const": "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json"',
      '"nextGates"',
      '"prefixItems"',
      '"const": "bun run agent-ready:production"',
      '"const": "bun run agent-ready:final-gate"',
      '"dnsHost"',
      '"additionalProperties": false',
    ]) {
      expect(statusReportSchema).toContain(expected);
    }

    for (const expected of [
      '"$schema": "https://json-schema.org/draft/2020-12/schema"',
      '"$id": "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json"',
      '"required": [',
      '"allowProductionBlockers"',
      '"checkedAt"',
      '"checks"',
      '"completionOk"',
      '"missingOrBlocked"',
      '"ok"',
      '"productionBlockersOnly"',
      '"productionReportPath"',
      '"summary"',
      '"const": "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json"',
      '"failed"',
      '"passed"',
      '"total"',
      '"format": "date-time"',
      '"additionalProperties": false',
    ]) {
      expect(completionAuditReportSchema).toContain(expected);
    }
  });

  test("status helper summarizes production blockers without secrets", async () => {
    const rootPackage = JSON.parse(await read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const statusHelper = await read("scripts/agent-ready-status.ts");
    const productionEnvContract = await read("scripts/agent-ready-production-env.ts");
    const productionEnvExample = await read(".env.production.example");

    expect(rootPackage.scripts?.["agent-ready:status"]).toBe("bun scripts/agent-ready-status.ts");
    expect(rootPackage.scripts?.["agent-ready:status:json"]).toBe(
      "bun scripts/agent-ready-status.ts --json",
    );
    for (const key of [
      "VITE_CONVEX_URL",
      "VITE_CONVEX_SITE_URL",
      "SITE_URL",
      "BETTER_AUTH_SECRET",
      "GITHUB_WEBHOOK_SECRET",
      "GITHUB_APP_ID",
      "GITHUB_APP_SLUG",
      "GITHUB_APP_CLIENT_ID",
      "GITHUB_APP_CLIENT_SECRET",
      "GITHUB_APP_PRIVATE_KEY",
      "AMEND_API_TOKEN",
      "OPENAI_API_KEY",
      "OPENAI_MODEL",
      "CROF_API_KEY",
      "CROF_MODEL",
      "CROF_BASE_URL",
      "RESEND_API_KEY",
      "EMAIL_FROM",
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
    ]) {
      expect(productionEnvContract).toContain(`"${key}"`);
      expect(productionEnvExample).toContain(`${key}=`);
    }
    expect(statusHelper).toContain(
      'import { requiredProductionEnv } from "./agent-ready-production-env"',
    );

    for (const expected of [
      "https://rdap.org/domain/",
      "resolveNs",
      "resolve4",
      "resolve6",
      "resolveCname",
      "registered=",
      "delegated=",
      "records=",
      "productionEnv",
      "nextGates",
      "checkedAt",
      "blockers",
      "Blockers:",
      "new Set<string>",
      "Load ${missingEnv.length} missing production environment values.",
      "Register ${apex}.",
      "Delegate ${apex} with a DNS provider.",
      "Create A/AAAA or CNAME records for ${status.host} pointing at the ${label} deployment.",
      "--json",
      "--json-file",
      "writeFile",
      "missing env:",
      "bun run agent-ready:production",
      "bun run agent-ready:final-gate",
      'webOrigin = process.env.AMEND_WEB_ORIGIN ?? "https://amend.sh"',
      'docsOrigin = process.env.AMEND_DOCS_ORIGIN ?? "https://docs.amend.sh"',
    ]) {
      expect(statusHelper).toContain(expected);
    }
    expect(statusHelper).not.toContain("console.log(process.env");
  });

  test("status report validator requires clean env and DNS when requested", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "amend-agent-ready-status-report-"));
    const reportPath = join(tempDir, "agent-ready-status.json");
    try {
      await writeFile(
        reportPath,
        `${JSON.stringify(
          {
            $schema: "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json",
            blockers: [
              "Load 1 missing production environment values.",
              "Create A/AAAA or CNAME records for docs.amend.sh pointing at the docs deployment.",
            ],
            checkedAt: "2026-05-14T00:00:00.000Z",
            dns: {
              docs: {
                delegated: true,
                host: "docs.amend.sh",
                records: [],
                registered: true,
              },
              web: {
                delegated: true,
                host: "amend.sh",
                records: ["A 203.0.113.10"],
                registered: true,
              },
            },
            nextGates: ["bun run agent-ready:production", "bun run agent-ready:final-gate"],
            ok: false,
            origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
            productionEnv: { missing: ["SITE_URL"], passed: 19, total: 20 },
          },
          null,
          2,
        )}\n`,
      );

      const validator = Bun.spawn(
        ["bun", "scripts/agent-ready-status-report-validate.ts", reportPath, "--require-ok"],
        {
          cwd: root.pathname,
          stderr: "pipe",
          stdout: "pipe",
        },
      );
      const [exitCode, stderr] = await Promise.all([
        validator.exited,
        new Response(validator.stderr).text(),
      ]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("$.ok");
      expect(stderr).toContain("$.blockers");
      expect(stderr).toContain("$.productionEnv.missing");
      expect(stderr).toContain("$.productionEnv.passed");
      expect(stderr).toContain("$.dns.docs.records");
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });

  test("production report validator requires every strict launch step to pass", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "amend-agent-ready-report-"));
    const reportPath = join(tempDir, "agent-ready-production-report.json");
    try {
      await writeFile(
        reportPath,
        `${JSON.stringify(
          {
            $schema: "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json",
            blockers: [],
            checkedAt: "2026-05-14T00:00:00.000Z",
            ok: true,
            steps: {
              built: { exitCode: 0, ok: true, summary: { passed: 37, total: 37 } },
              live: {
                exitCode: 1,
                ok: false,
                report: {
                  blockers: ["Create A/AAAA or CNAME records for amend.sh."],
                  checks: [{ name: "web DNS resolves", ok: false }],
                  ok: false,
                  passed: 0,
                  total: 1,
                },
              },
              readinessStrict: { exitCode: 0, ok: true, summary: { passed: 136, total: 136 } },
              status: {
                exitCode: 0,
                ok: true,
                report: {
                  $schema: "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json",
                  blockers: [],
                  checkedAt: "2026-05-14T00:00:00.000Z",
                  dns: {
                    docs: {
                      delegated: true,
                      host: "docs.amend.sh",
                      records: ["CNAME docs.example.com"],
                      registered: true,
                    },
                    web: {
                      delegated: true,
                      host: "amend.sh",
                      records: ["A 203.0.113.10"],
                      registered: true,
                    },
                  },
                  nextGates: ["bun run agent-ready:production", "bun run agent-ready:final-gate"],
                  ok: true,
                  origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
                  productionEnv: { missing: [], passed: 20, total: 20 },
                },
              },
            },
          },
          null,
          2,
        )}\n`,
      );

      const validator = Bun.spawn(
        ["bun", "scripts/agent-ready-production-report-validate.ts", reportPath, "--require-ok"],
        {
          cwd: root.pathname,
          stderr: "pipe",
          stdout: "pipe",
        },
      );
      const [exitCode, stderr] = await Promise.all([
        validator.exited,
        new Response(validator.stderr).text(),
      ]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("$.steps.live.ok");
      expect(stderr).toContain("$.steps.live.report.ok");
      expect(stderr).toContain("$.steps.live.report.blockers");
      expect(stderr).toContain("$.steps.live.report.passed");
      expect(stderr).toContain("$.steps.live.report.checks[0].ok");
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });

  test("production report validator rejects inconsistent saved reports", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "amend-agent-ready-report-"));
    const reportPath = join(tempDir, "agent-ready-production-report.json");
    try {
      await writeFile(
        reportPath,
        `${JSON.stringify(
          {
            $schema: "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json",
            blockers: [],
            checkedAt: "2026-05-14T00:00:00.000Z",
            ok: true,
            steps: {
              built: { exitCode: 0, ok: true, summary: { passed: 37, total: 37 } },
              live: {
                exitCode: 1,
                ok: true,
                report: {
                  $schema: "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json",
                  blockers: [],
                  checkedAt: "2026-05-14T00:00:00.000Z",
                  checks: [{ name: "web DNS resolves", ok: true }],
                  ok: true,
                  origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
                  passed: 2,
                  total: 1,
                },
              },
              readinessStrict: { exitCode: 0, ok: true, summary: { passed: 136, total: 136 } },
              status: {
                exitCode: 0,
                ok: true,
                report: {
                  blockers: [],
                  checkedAt: "2026-05-14T00:00:00.000Z",
                  dns: {
                    docs: {
                      delegated: true,
                      host: "docs.amend.sh",
                      records: ["CNAME docs.example.com"],
                      registered: true,
                    },
                    web: {
                      delegated: true,
                      host: "amend.sh",
                      records: ["203.0.113.10"],
                      registered: true,
                    },
                  },
                  nextGates: ["bun run agent-ready:production", "bun run agent-ready:final-gate"],
                  ok: true,
                  origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
                  productionEnv: { missing: [], passed: 20, total: 20 },
                },
              },
            },
          },
          null,
          2,
        )}\n`,
      );

      const validator = Bun.spawn(
        ["bun", "scripts/agent-ready-production-report-validate.ts", reportPath],
        {
          cwd: root.pathname,
          stderr: "pipe",
          stdout: "pipe",
        },
      );
      const [exitCode, stderr] = await Promise.all([
        validator.exited,
        new Response(validator.stderr).text(),
      ]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("$.steps.live.ok");
      expect(stderr).toContain("must equal whether exitCode is zero");
      expect(stderr).toContain("$.steps.live.report.passed");
      expect(stderr).toContain("must not exceed total");
      expect(stderr).toContain("must equal the number of passing checks");
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });

  test("sync audit rejects standalone live report drift", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "amend-agent-ready-sync-audit-"));
    const productionReportPath = join(tempDir, "agent-ready-production-report.json");
    const liveReportPath = join(tempDir, "agent-ready-live-report.json");
    const auditPath = join(tempDir, "agent-ready-audit.md");
    const completionAuditPath = join(tempDir, "completion-audit.md");
    const embeddedLiveReport = {
      $schema: "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json",
      blockers: ["Register amend.sh."],
      checkedAt: "2026-05-14T00:00:00.000Z",
      checks: [{ detail: "amend.sh", name: "web apex is registered", ok: false }],
      origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
      ok: false,
      passed: 0,
      total: 1,
    };

    try {
      await writeFile(
        productionReportPath,
        `${JSON.stringify(
          {
            $schema: "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json",
            blockers: ["Register amend.sh."],
            checkedAt: "2026-05-14T00:00:02.000Z",
            ok: false,
            steps: {
              built: { exitCode: 0, ok: true, summary: { passed: 45, total: 45 } },
              live: { exitCode: 1, ok: false, report: embeddedLiveReport },
              readinessStrict: { exitCode: 1, ok: false, summary: { passed: 129, total: 150 } },
              status: {
                exitCode: 1,
                ok: false,
                report: {
                  $schema: "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json",
                  blockers: ["Load 1 missing production environment values."],
                  checkedAt: "2026-05-14T00:00:01.000Z",
                  dns: {
                    docs: {
                      delegated: false,
                      host: "docs.amend.sh",
                      records: [],
                      registered: false,
                    },
                    web: {
                      delegated: false,
                      host: "amend.sh",
                      records: [],
                      registered: false,
                    },
                  },
                  nextGates: ["bun run agent-ready:production", "bun run agent-ready:final-gate"],
                  ok: false,
                  origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
                  productionEnv: { missing: ["SITE_URL"], passed: 19, total: 20 },
                },
              },
            },
          },
          null,
          2,
        )}\n`,
      );
      await writeFile(
        liveReportPath,
        `${JSON.stringify(
          {
            ...embeddedLiveReport,
            checkedAt: "2026-05-14T00:00:03.000Z",
            checks: [{ detail: "amend.sh", name: "web DNS resolves", ok: false }],
          },
          null,
          2,
        )}\n`,
      );
      await writeFile(
        auditPath,
        "Latest JSON live check: `2026-05-14T00:00:00.000Z`, `0/1` checks passing.\n",
      );
      await writeFile(
        completionAuditPath,
        [
          "Latest agent-ready status check: `2026-05-14T00:00:01.000Z`, `19/20` production env values loaded,",
          "Latest agent-ready live check: `2026-05-14T00:00:00.000Z`, `0/1` checks passing because",
          "",
        ].join("\n"),
      );

      const validator = Bun.spawn(
        ["bun", "scripts/agent-ready-sync-audit.ts", "--check", productionReportPath],
        {
          cwd: root.pathname,
          env: {
            ...process.env,
            AGENT_READY_AUDIT_PATH: auditPath,
            AGENT_READY_COMPLETION_AUDIT_PATH: completionAuditPath,
            AGENT_READY_LIVE_REPORT_PATH: liveReportPath,
          },
          stderr: "pipe",
          stdout: "pipe",
        },
      );
      const [exitCode, stderr] = await Promise.all([
        validator.exited,
        new Response(validator.stderr).text(),
      ]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("agent-ready-live-report.json");
      expect(stderr).toContain("is not synced");
      expect(stderr).toContain("ignoring checkedAt");
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });

  test("sync audit accepts reordered standalone live report keys", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "amend-agent-ready-sync-audit-"));
    const productionReportPath = join(tempDir, "agent-ready-production-report.json");
    const liveReportPath = join(tempDir, "agent-ready-live-report.json");
    const auditPath = join(tempDir, "agent-ready-audit.md");
    const completionAuditPath = join(tempDir, "completion-audit.md");
    const embeddedLiveReport = {
      $schema: "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json",
      blockers: [],
      checkedAt: "2026-05-14T00:00:00.000Z",
      checks: [{ detail: "200 OK", name: "web /llms.txt returns 2xx", ok: true }],
      origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
      ok: true,
      passed: 1,
      total: 1,
    };

    try {
      await writeFile(
        productionReportPath,
        `${JSON.stringify(
          {
            $schema: "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json",
            blockers: [],
            checkedAt: "2026-05-14T00:00:02.000Z",
            ok: true,
            steps: {
              built: { exitCode: 0, ok: true, summary: { passed: 45, total: 45 } },
              live: { exitCode: 0, ok: true, report: embeddedLiveReport },
              readinessStrict: { exitCode: 0, ok: true, summary: { passed: 150, total: 150 } },
              status: {
                exitCode: 0,
                ok: true,
                report: {
                  $schema: "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json",
                  blockers: [],
                  checkedAt: "2026-05-14T00:00:01.000Z",
                  dns: {
                    docs: {
                      delegated: true,
                      host: "docs.amend.sh",
                      records: ["CNAME docs.example.com"],
                      registered: true,
                    },
                    web: {
                      delegated: true,
                      host: "amend.sh",
                      records: ["A 203.0.113.10"],
                      registered: true,
                    },
                  },
                  nextGates: ["bun run agent-ready:production", "bun run agent-ready:final-gate"],
                  ok: true,
                  origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
                  productionEnv: { missing: [], passed: 21, total: 21 },
                },
              },
            },
          },
          null,
          2,
        )}\n`,
      );
      await writeFile(
        liveReportPath,
        `${JSON.stringify(
          {
            total: 1,
            passed: 1,
            origins: { web: "https://amend.sh", docs: "https://docs.amend.sh" },
            ok: true,
            checks: [{ ok: true, name: "web /llms.txt returns 2xx", detail: "200 OK" }],
            checkedAt: "2026-05-14T00:00:03.000Z",
            blockers: [],
            $schema: "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json",
          },
          null,
          2,
        )}\n`,
      );
      await writeFile(
        auditPath,
        "Latest JSON live check: `2026-05-14T00:00:00.000Z`, `1/1` checks passing.\n",
      );
      await writeFile(
        completionAuditPath,
        [
          "Latest agent-ready status check: `2026-05-14T00:00:01.000Z`, `21/21` production env values loaded,",
          "Latest agent-ready live check: `2026-05-14T00:00:00.000Z`, `1/1` checks passing because",
          "",
        ].join("\n"),
      );

      const validator = Bun.spawn(
        ["bun", "scripts/agent-ready-sync-audit.ts", "--check", productionReportPath],
        {
          cwd: root.pathname,
          env: {
            ...process.env,
            AGENT_READY_AUDIT_PATH: auditPath,
            AGENT_READY_COMPLETION_AUDIT_PATH: completionAuditPath,
            AGENT_READY_LIVE_REPORT_PATH: liveReportPath,
          },
          stderr: "pipe",
          stdout: "pipe",
        },
      );
      const [exitCode, stdout, stderr] = await Promise.all([
        validator.exited,
        new Response(validator.stdout).text(),
        new Response(validator.stderr).text(),
      ]);

      expect(exitCode).toBe(0);
      expect(stdout).toContain("matches the embedded live report");
      expect(stderr).toBe("");
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });

  test("live report validator accepts non-DNS failures without blockers", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "amend-agent-ready-live-report-"));
    const reportPath = join(tempDir, "agent-ready-live-report.json");
    try {
      await writeFile(
        reportPath,
        `${JSON.stringify(
          {
            $schema: "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json",
            blockers: [],
            checkedAt: "2026-05-14T00:00:00.000Z",
            checks: [{ detail: "404 Not Found", name: "web /llms.txt returns 2xx", ok: false }],
            ok: false,
            origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
            passed: 0,
            total: 1,
          },
          null,
          2,
        )}\n`,
      );

      const validator = Bun.spawn(
        ["bun", "scripts/agent-ready-live-report-validate.ts", reportPath],
        {
          cwd: root.pathname,
          stderr: "pipe",
          stdout: "pipe",
        },
      );
      const [exitCode, stdout, stderr] = await Promise.all([
        validator.exited,
        new Response(validator.stdout).text(),
        new Response(validator.stderr).text(),
      ]);

      expect(exitCode).toBe(0);
      expect(stdout).toContain("Valid agent-ready live report");
      expect(stderr).toBe("");
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });

  test("completion audit report validator rejects inconsistent saved reports", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "amend-agent-ready-completion-report-"));
    const reportPath = join(tempDir, "agent-ready-completion-audit-report.json");
    try {
      await writeFile(
        reportPath,
        `${JSON.stringify(
          {
            $schema:
              "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json",
            allowProductionBlockers: true,
            checkedAt: "2026-05-14T00:00:00.000Z",
            checks: [
              { name: "maximum-visibility web robots policy exists", ok: true },
              { name: "saved production report has passing live validator", ok: false },
            ],
            completionOk: true,
            missingOrBlocked: [],
            ok: true,
            productionBlockersOnly: false,
            productionReportPath: "agent-ready-production-report.json",
            summary: { failed: 0, passed: 2, total: 3 },
          },
          null,
          2,
        )}\n`,
      );

      const validator = Bun.spawn(
        ["bun", "scripts/agent-ready-completion-audit-report-validate.ts", reportPath],
        {
          cwd: root.pathname,
          stderr: "pipe",
          stdout: "pipe",
        },
      );
      const [exitCode, stderr] = await Promise.all([
        validator.exited,
        new Response(validator.stderr).text(),
      ]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("$.summary.failed");
      expect(stderr).toContain("$.summary.passed");
      expect(stderr).toContain("$.summary.total");
      expect(stderr).toContain("$.missingOrBlocked");
      expect(stderr).toContain("$.completionOk");
      expect(stderr).toContain("$.productionBlockersOnly");
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });
});
