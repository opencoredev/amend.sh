import { readFile } from "node:fs/promises";
import { aiCrawlerNames } from "./agent-ready-policy";
import { productionEnvChecks, requiredProductionEnv } from "./agent-ready-production-env";

const strict = process.argv.includes("--strict");

type Check = {
  detail?: string;
  name: string;
  ok: boolean;
};

const checks: Check[] = [];

async function read(path: string) {
  return await readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

async function readOptional(path: string) {
  try {
    return await read(path);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

function add(name: string, ok: boolean, detail?: string) {
  checks.push({ detail, name, ok });
  console.log(`${ok ? "PASS" : "NEEDS"} ${name}${detail ? ` - ${detail}` : ""}`);
}

function hasMeaningfulEnv(key: string) {
  const value = process.env[key]?.trim();
  return Boolean(value && !/replace-with|example\.com|your-|placeholder/i.test(value));
}

function hasLine(content: string, key: string) {
  return new RegExp(`^${key}=`, "m").test(content);
}

function hasNormalizedText(content: string, text: string) {
  return content.replace(/\s+/g, " ").includes(text);
}

const rootPackage = JSON.parse(await read("package.json")) as {
  scripts?: Record<string, string>;
};
const turboConfig = JSON.parse(await read("turbo.json")) as {
  globalDependencies?: string[];
};
const webPackage = JSON.parse(await read("apps/web/package.json")) as {
  scripts?: Record<string, string>;
};
const docsPackage = JSON.parse(await read("apps/fumadocs/package.json")) as {
  scripts?: Record<string, string>;
};
const gitignore = await read(".gitignore");
const productionEnvExample = await read(".env.production.example");
const webEnvExample = await read("apps/web/.env.example");
const backendEnvExample = await read("packages/backend/.env.example");
const backendEnvLocal = await readOptional("packages/backend/.env.local");
const readme = await read("README.md");
const completionAudit = await read("docs/completion-audit.md");
const productionReadiness = await read("docs/production-readiness.md");
const agentReadyAudit = await read("docs/agent-ready-audit.md");
const agentReadyDomainSetup = await read("docs/agent-ready-domain-setup.md");
const agentReadyProductionReportSchema = await read(
  "docs/agent-ready-production-report.schema.json",
);
const agentReadyLiveReportSchema = await read("docs/agent-ready-live-report.schema.json");
const agentReadyStatusReportSchema = await read("docs/agent-ready-status-report.schema.json");
const agentReadyCompletionAuditReportSchema = await read(
  "docs/agent-ready-completion-audit-report.schema.json",
);
const agentReadyPolicy = await read("scripts/agent-ready-policy.ts");
const integrationGuide = await read("docs/integration.md");
const launchRunbook = await read("docs/launch-runbook.md");
const agentReadyBuilt = await read("scripts/agent-ready-built.ts");
const agentReadyLive = await read("scripts/agent-ready-live.ts");
const agentReadyProduction = await read("scripts/agent-ready-production.ts");
const agentReadyRefreshReport = await read("scripts/agent-ready-refresh-report.ts");
const agentReadyCompletionAudit = await read("scripts/agent-ready-completion-audit.ts");
const agentReadyCompletionAuditReportValidate = await read(
  "scripts/agent-ready-completion-audit-report-validate.ts",
);
const agentReadyLiveReportValidate = await read("scripts/agent-ready-live-report-validate.ts");
const agentReadyStatusReportValidate = await read("scripts/agent-ready-status-report-validate.ts");
const agentReadySyncAudit = await read("scripts/agent-ready-sync-audit.ts");
const agentReadyProductionReportValidate = await read(
  "scripts/agent-ready-production-report-validate.ts",
);
const agentReadyStatus = await read("scripts/agent-ready-status.ts");
const agentReadyTest = await read("scripts/agent-ready.test.ts");
const webRobots = await read("apps/web/public/robots.txt");
const webSitemap = await read("apps/web/public/sitemap.xml");
const webLlms = await read("apps/web/public/llms.txt");
const webSeo = await read("apps/web/src/lib/seo.ts");
const docsRobotsRoute = await read("apps/fumadocs/src/app/robots.txt/route.ts");
const docsSitemapRoute = await read("apps/fumadocs/src/app/sitemap.xml/route.ts");
const docsLlmsRoute = await read("apps/fumadocs/src/app/llms.txt/route.ts");
const docsLlmsFullRoute = await read("apps/fumadocs/src/app/llms-full.txt/route.ts");
const docsProductionReportSchemaRoute = await read(
  "apps/fumadocs/src/app/schemas/agent-ready-production-report.schema.json/route.ts",
);
const docsLiveReportSchemaRoute = await read(
  "apps/fumadocs/src/app/schemas/agent-ready-live-report.schema.json/route.ts",
);
const docsStatusReportSchemaRoute = await read(
  "apps/fumadocs/src/app/schemas/agent-ready-status-report.schema.json/route.ts",
);
const docsCompletionAuditReportSchemaRoute = await read(
  "apps/fumadocs/src/app/schemas/agent-ready-completion-audit-report.schema.json/route.ts",
);
const docsLaunchPage = await read("apps/fumadocs/content/docs/launch.mdx");
const docsHomeRoute = await read("apps/fumadocs/src/app/(home)/page.tsx");
const docsPageRoute = await read("apps/fumadocs/src/app/docs/[[...slug]]/page.tsx");

add(
  "normal dev is portless",
  rootPackage.scripts?.dev === "turbo dev" &&
    webPackage.scripts?.dev === "portless amend vite dev" &&
    docsPackage.scripts?.dev === "portless docs.amend next dev",
  "bun dev -> turbo dev -> portless amend + docs.amend",
);
add("read-only quality gate exists", rootPackage.scripts?.check?.includes("format:check") === true);
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
    rootPackage.scripts?.["agent-ready:status:json"] === "bun scripts/agent-ready-status.ts --json",
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
  "docs launch page uses docs.amend.sh as the public docs host",
  docsLaunchPage.includes("Use the dedicated docs host for this launch") &&
    docsLaunchPage.includes("https://docs.amend.sh/docs") &&
    !docsLaunchPage.includes("https://amend.sh/docs` or"),
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
    agentReadyTest.includes('DEFAULT_PRODUCTION_DOCS_URL = "https://docs.amend.sh/docs"'),
);
add(
  "agent-ready live validator checks DNS, public files, content types, metadata, structured data, and noindex",
  agentReadyLive.includes("apex is registered") &&
    agentReadyLive.includes("https://rdap.org/domain/") &&
    agentReadyLive.includes("Register ${apex}.") &&
    agentReadyLive.includes("apex is delegated") &&
    agentReadyLive.includes("DNS resolves") &&
    agentReadyLive.includes("resolveCname") &&
    agentReadyLive.includes("Create A/AAAA or CNAME records") &&
    agentReadyLive.includes("/robots.txt") &&
    agentReadyLive.includes("/sitemap.xml") &&
    agentReadyLive.includes("<lastmod>") &&
    agentReadyLive.includes("<changefreq>") &&
    agentReadyLive.includes("<priority>") &&
    agentReadyLive.includes("extractSitemapLocs") &&
    agentReadyLive.includes("extractMarkdownLinks") &&
    agentReadyLive.includes("duplicateValues") &&
    agentReadyLive.includes("has sitemap loc entries") &&
    agentReadyLive.includes("has no duplicate sitemap locs") &&
    agentReadyLive.includes("sitemap locs stay on expected origin") &&
    agentReadyLive.includes("checkLlmsLinksAgainstSitemaps") &&
    agentReadyLive.includes("web /llms.txt links stay on web or docs origins") &&
    agentReadyLive.includes("web /llms.txt web links appear in web sitemap") &&
    agentReadyLive.includes("web /llms.txt docs links appear in docs sitemap") &&
    agentReadyLive.includes("docs /llms.txt relative links appear in docs sitemap") &&
    agentReadyLive.includes("/brand") &&
    agentReadyLive.includes("/embed-demo") &&
    agentReadyLive.includes("/portal/amend-labs") &&
    agentReadyLive.includes("/llms.txt") &&
    agentReadyLive.includes("/llms-full.txt") &&
    agentReadyLive.includes("/schemas/agent-ready-production-report.schema.json") &&
    agentReadyLive.includes("/schemas/agent-ready-status-report.schema.json") &&
    agentReadyLive.includes("content-type") &&
    agentReadyLive.includes("application/schema+json") &&
    agentReadyLive.includes("parseJsonObject") &&
    agentReadyLive.includes("is parseable JSON object") &&
    agentReadyLive.includes("text/plain") &&
    agentReadyLive.includes("application/xml") &&
    agentReadyLive.includes("text/html") &&
    agentReadyLive.includes("stays on expected origin") &&
    agentReadyLive.includes("finalUrl.origin === origin") &&
    agentReadyLive.includes("x-robots-tag allows indexing") &&
    agentReadyLive.includes("x-robots-tag") &&
    agentReadyLive.includes("extractJsonLdTypes") &&
    agentReadyLive.includes("has valid JSON-LD") &&
    agentReadyLive.includes("structuredDataTypes") &&
    agentReadyLive.includes("excludes") &&
    agentReadyLive.includes("Disallow:") &&
    agentReadyLive.includes("aiCrawlerNames") &&
    agentReadyLive.includes("agent-ready-policy") &&
    aiCrawlerNames.every((crawler) => agentReadyPolicy.includes(crawler)) &&
    agentReadyLive.includes("aiAccessUserAgents") &&
    agentReadyLive.includes("checkAiUserAgentAccess") &&
    agentReadyLive.includes("allows ${userAgent.name}") &&
    agentReadyLive.includes("/dashboard") &&
    agentReadyLive.includes("/api/chat") &&
    agentReadyLive.includes("/api/search") &&
    agentReadyLive.includes('property="og:url"') &&
    agentReadyLive.includes('name="twitter:card"') &&
    agentReadyLive.includes('"@type":"Organization"') &&
    agentReadyLive.includes('"@type":"SoftwareApplication"') &&
    agentReadyLive.includes('"@type":"WebSite"') &&
    agentReadyLive.includes('"@type":"TechArticle"') &&
    agentReadyLive.includes("Source-linked product updates") &&
    agentReadyLive.includes("noindex, nofollow") &&
    agentReadyLive.includes(`href="\${docsOrigin}/docs"`) &&
    agentReadyLive.includes("/docs/quickstart") &&
    agentReadyLive.includes("/docs/integration") &&
    agentReadyLive.includes("/docs/source-trace") &&
    agentReadyLive.includes("/docs/self-hosting") &&
    agentReadyLive.includes("/docs/launch") &&
    agentReadyLive.includes("/schemas/agent-ready-production-report.schema.json") &&
    agentReadyLive.includes("/schemas/agent-ready-status-report.schema.json") &&
    agentReadyLive.includes("/schemas/agent-ready-completion-audit-report.schema.json") &&
    agentReadyLive.includes("--json") &&
    agentReadyLive.includes("jsonOutput") &&
    agentReadyLive.includes("checkedAt") &&
    agentReadyLive.includes("origins") &&
    agentReadyLive.includes("blockers") &&
    agentReadyLive.includes("nextGates") &&
    agentReadyLive.includes('"const": "bun run agent-ready:production"') &&
    agentReadyLive.includes('"const": "bun run agent-ready:final-gate"') &&
    agentReadyLive.includes("Next external steps"),
);
add(
  "agent-ready built artifact validator checks generated web and docs outputs",
  agentReadyBuilt.includes("apps/web/dist/client/robots.txt") &&
    agentReadyBuilt.includes("apps/web/dist/client/sitemap.xml") &&
    agentReadyBuilt.includes("apps/web/dist/client/llms.txt") &&
    agentReadyBuilt.includes("apps/fumadocs/.next/server/app/robots.txt.body") &&
    agentReadyBuilt.includes("apps/fumadocs/.next/server/app/robots.txt.meta") &&
    agentReadyBuilt.includes("apps/fumadocs/.next/server/app/sitemap.xml.body") &&
    agentReadyBuilt.includes("apps/fumadocs/.next/server/app/sitemap.xml.meta") &&
    agentReadyBuilt.includes("apps/fumadocs/.next/server/app/llms.txt.body") &&
    agentReadyBuilt.includes("apps/fumadocs/.next/server/app/llms.txt.meta") &&
    agentReadyBuilt.includes("apps/fumadocs/.next/server/app/llms-full.txt.body") &&
    agentReadyBuilt.includes("apps/fumadocs/.next/server/app/llms-full.txt.meta") &&
    agentReadyBuilt.includes(
      "apps/fumadocs/.next/server/app/schemas/agent-ready-production-report.schema.json.body",
    ) &&
    agentReadyBuilt.includes(
      "apps/fumadocs/.next/server/app/schemas/agent-ready-production-report.schema.json.meta",
    ) &&
    agentReadyBuilt.includes(
      "apps/fumadocs/.next/server/app/schemas/agent-ready-live-report.schema.json.body",
    ) &&
    agentReadyBuilt.includes(
      "apps/fumadocs/.next/server/app/schemas/agent-ready-live-report.schema.json.meta",
    ) &&
    agentReadyBuilt.includes(
      "apps/fumadocs/.next/server/app/schemas/agent-ready-status-report.schema.json.body",
    ) &&
    agentReadyBuilt.includes(
      "apps/fumadocs/.next/server/app/schemas/agent-ready-status-report.schema.json.meta",
    ) &&
    agentReadyBuilt.includes(
      "apps/fumadocs/.next/server/app/schemas/agent-ready-completion-audit-report.schema.json.body",
    ) &&
    agentReadyBuilt.includes(
      "apps/fumadocs/.next/server/app/schemas/agent-ready-completion-audit-report.schema.json.meta",
    ) &&
    agentReadyBuilt.includes("https://docs.amend.sh/api/chat") &&
    agentReadyBuilt.includes("https://docs.amend.sh/api/search") &&
    agentReadyBuilt.includes("metaHasContentType") &&
    agentReadyBuilt.includes("isParseableJsonObject") &&
    agentReadyBuilt.includes("built docs robots has text/plain metadata") &&
    agentReadyBuilt.includes("built docs sitemap has application/xml metadata") &&
    agentReadyBuilt.includes("built docs llms resources have text/plain metadata") &&
    agentReadyBuilt.includes("built docs Markdown mirror has text/markdown metadata") &&
    agentReadyBuilt.includes("built docs production report schema endpoint exposes JSON Schema") &&
    agentReadyBuilt.includes("built docs live report schema endpoint exposes JSON Schema") &&
    agentReadyBuilt.includes("built docs status report schema endpoint exposes JSON Schema") &&
    agentReadyBuilt.includes(
      "built docs completion audit report schema endpoint exposes JSON Schema",
    ) &&
    agentReadyBuilt.includes('"nextGates"') &&
    agentReadyBuilt.includes('"const": "bun run agent-ready:production"') &&
    agentReadyBuilt.includes('"const": "bun run agent-ready:final-gate"') &&
    agentReadyBuilt.includes("application/schema+json") &&
    agentReadyBuilt.includes("built web sitemap has unique on-origin locs") &&
    agentReadyBuilt.includes("built web llms.txt links are unique and on allowed origins") &&
    agentReadyBuilt.includes("built web llms.txt web links appear in web sitemap") &&
    agentReadyBuilt.includes("built web llms.txt docs links appear in docs sitemap") &&
    agentReadyBuilt.includes("built web route bundle exposes crawlable copy") &&
    agentReadyBuilt.includes("Ready to collect feedback") &&
    agentReadyBuilt.includes("built docs sitemap has unique on-origin locs") &&
    agentReadyBuilt.includes(
      "built docs llms.txt links are unique and represented in docs sitemap",
    ) &&
    agentReadyBuilt.includes("agent-ready-policy") &&
    aiCrawlerNames.every((crawler) => agentReadyPolicy.includes(crawler)) &&
    agentReadyBuilt.includes("extractMarkdownLinks") &&
    agentReadyBuilt.includes("hasNoDuplicateValues") &&
    agentReadyBuilt.includes("locsStayOnOrigin") &&
    agentReadyBuilt.includes("apps/fumadocs/.next/server/app/index.html") &&
    agentReadyBuilt.includes("apps/fumadocs/.next/server/app/docs/quickstart.html") &&
    agentReadyBuilt.includes(
      "apps/fumadocs/.next/server/app/llms.mdx/docs/quickstart/content.md.body",
    ) &&
    agentReadyBuilt.includes("Agent-ready built summary") &&
    agentReadyBuilt.includes("bun run build"),
);
add(
  "agent-ready status reports env and DNS blockers without secrets",
  agentReadyStatus.includes("requiredProductionEnv") &&
    agentReadyStatus.includes("./agent-ready-production-env") &&
    agentReadyStatus.includes("writeFile") &&
    agentReadyStatus.includes("--json") &&
    agentReadyStatus.includes("--json-file") &&
    agentReadyStatus.includes("productionEnv") &&
    agentReadyStatus.includes("nextGates") &&
    agentReadyStatus.includes("checkedAt") &&
    agentReadyStatus.includes("blockers") &&
    agentReadyStatus.includes("Blockers:") &&
    agentReadyStatus.includes("Load ${missingEnv.length} missing production environment values.") &&
    agentReadyStatus.includes("Register ${apex}.") &&
    agentReadyStatus.includes("Delegate ${apex} with a DNS provider.") &&
    agentReadyStatus.includes(
      "Create A/AAAA or CNAME records for ${status.host} pointing at the ${label} deployment.",
    ) &&
    agentReadyStatus.includes("missing env") &&
    agentReadyStatus.includes("registered=") &&
    agentReadyStatus.includes("delegated=") &&
    agentReadyStatus.includes("records=") &&
    agentReadyStatus.includes("bun run agent-ready:production") &&
    agentReadyStatus.includes("bun run agent-ready:final-gate") &&
    !agentReadyStatus.includes("console.log(process.env"),
);
add(
  "agent-ready production JSON report preserves blockers when strict readiness fails",
  agentReadyProduction.includes('runCommand(["bun", "scripts/readiness.ts", "--strict"])') &&
    agentReadyProduction.includes('runCommand(["bun", "scripts/agent-ready-built.ts"])') &&
    agentReadyProduction.includes(
      'runCommand(["bun", "scripts/agent-ready-status.ts", "--json"])',
    ) &&
    agentReadyProduction.includes('runCommand(["bun", "scripts/agent-ready-live.ts", "--json"])') &&
    agentReadyProduction.includes("parseReadinessSummary") &&
    agentReadyProduction.includes("parseBuiltSummary") &&
    agentReadyProduction.includes("blockersFrom") &&
    agentReadyProduction.includes("reportSchemaUrl") &&
    agentReadyProduction.includes("readinessStrict") &&
    agentReadyProduction.includes(
      "Pass strict readiness with production environment values loaded.",
    ) &&
    agentReadyProduction.includes(
      "Pass the live agent-ready validator against amend.sh and docs.amend.sh.",
    ) &&
    agentReadyProduction.includes("--json-file") &&
    agentReadyProduction.includes("writeFile"),
);
add(
  "agent-ready production report refresh preserves blockers and syncs audits",
  agentReadyRefreshReport.includes("scripts/agent-ready-production.ts") &&
    agentReadyRefreshReport.includes("--json-file") &&
    agentReadyRefreshReport.includes("scripts/agent-ready-sync-audit.ts") &&
    agentReadyRefreshReport.includes("agent-ready:audit:check") &&
    agentReadyRefreshReport.includes("scripts/agent-ready-live.ts") &&
    agentReadyRefreshReport.includes("agent-ready-live-report.json") &&
    agentReadyRefreshReport.includes("scripts/agent-ready-completion-audit.ts") &&
    agentReadyRefreshReport.includes("scripts/agent-ready-status.ts") &&
    agentReadyRefreshReport.includes("agent-ready-status.json") &&
    agentReadyRefreshReport.includes("--allow-production-blockers") &&
    agentReadyRefreshReport.includes("--json-file") &&
    agentReadyRefreshReport.includes("agent-ready-completion-audit-report.json") &&
    agentReadyRefreshReport.includes("Validate reports and synced audits") &&
    agentReadyRefreshReport.includes("status.exitCode") &&
    agentReadyRefreshReport.includes("production.exitCode") &&
    agentReadyRefreshReport.includes("refreshed with blockers"),
);
add(
  "agent-ready completion audit maps objective to artifacts and production report",
  agentReadyCompletionAudit.includes("Agent-ready completion audit") &&
    agentReadyCompletionAudit.includes("maximum-visibility web robots policy exists") &&
    agentReadyCompletionAudit.includes("web llms.txt maps web and docs resources") &&
    agentReadyCompletionAudit.includes("Agent-ready live report JSON Schema") &&
    agentReadyCompletionAudit.includes(
      "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json",
    ) &&
    agentReadyCompletionAudit.includes("Agent-ready status report JSON Schema") &&
    agentReadyCompletionAudit.includes(
      "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json",
    ) &&
    agentReadyCompletionAudit.includes("canonical and social metadata are wired") &&
    agentReadyCompletionAudit.includes("structured data is wired") &&
    agentReadyCompletionAudit.includes("crawlable public content is verified") &&
    agentReadyCompletionAudit.includes("isParseableJsonObject") &&
    agentReadyCompletionAudit.includes("parseJsonObject") &&
    agentReadyCompletionAudit.includes("is parseable JSON object") &&
    agentReadyCompletionAudit.includes("scripts/agent-ready-production-env.ts") &&
    agentReadyCompletionAudit.includes(
      "production env contract is shared by strict readiness and status",
    ) &&
    agentReadyCompletionAudit.includes("production launch handoff uses Amend.sh origins") &&
    agentReadyCompletionAudit.includes("SITE_URL=https://amend.sh") &&
    agentReadyCompletionAudit.includes("EMAIL_FROM=Amend <updates@amend.sh>") &&
    agentReadyCompletionAudit.includes("saved production report has passing live validator") &&
    agentReadyCompletionAudit.includes("saved production report is complete and blocker-free") &&
    agentReadyCompletionAudit.includes("allowProductionBlockers") &&
    agentReadyCompletionAudit.includes("--json-file") &&
    agentReadyCompletionAudit.includes("writeFile") &&
    agentReadyCompletionAudit.includes("missingOrBlocked") &&
    agentReadyCompletionAudit.includes("Only external production blockers remain.") &&
    agentReadyCompletionAudit.includes("process.exitCode = 1"),
);
add(
  "agent-ready production JSON report schema exists",
  agentReadyProductionReportSchema.includes(
    '"$id": "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json"',
  ) &&
    agentReadyProductionReportSchema.includes(
      '"required": ["$schema", "blockers", "checkedAt", "ok", "steps"]',
    ) &&
    agentReadyProductionReportSchema.includes(
      '"const": "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json"',
    ) &&
    agentReadyProductionReportSchema.includes(
      '"required": ["built", "live", "readinessStrict", "status"]',
    ) &&
    agentReadyProductionReportSchema.includes('"summaryStep"') &&
    agentReadyProductionReportSchema.includes('"liveReport"') &&
    agentReadyProductionReportSchema.includes(
      '"const": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
    ) &&
    agentReadyProductionReportSchema.includes('"statusReport"') &&
    agentReadyProductionReportSchema.includes(
      '"const": "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json"',
    ) &&
    agentReadyProductionReportSchema.includes('"nextGates"') &&
    agentReadyProductionReportSchema.includes('"prefixItems"') &&
    agentReadyProductionReportSchema.includes('"liveStep"') &&
    agentReadyProductionReportSchema.includes('"statusStep"') &&
    agentReadyProductionReportSchema.includes('"format": "date-time"') &&
    agentReadyProductionReportSchema.includes('"additionalProperties": false'),
);
add(
  "agent-ready live JSON report schema exists",
  agentReadyLiveReportSchema.includes(
    '"$id": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
  ) &&
    agentReadyLiveReportSchema.includes(
      '"required": ["$schema", "blockers", "checkedAt", "checks", "ok", "origins", "passed", "total"]',
    ) &&
    agentReadyLiveReportSchema.includes(
      '"const": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
    ) &&
    agentReadyLiveReportSchema.includes('"checks"') &&
    agentReadyLiveReportSchema.includes('"origins"') &&
    agentReadyLiveReportSchema.includes('"passed"') &&
    agentReadyLiveReportSchema.includes('"total"') &&
    agentReadyLiveReportSchema.includes('"additionalProperties": false'),
);
add(
  "agent-ready completion audit JSON report schema exists",
  agentReadyCompletionAuditReportSchema.includes(
    '"$id": "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json"',
  ) &&
    agentReadyCompletionAuditReportSchema.includes('"allowProductionBlockers"') &&
    agentReadyCompletionAuditReportSchema.includes('"completionOk"') &&
    agentReadyCompletionAuditReportSchema.includes('"missingOrBlocked"') &&
    agentReadyCompletionAuditReportSchema.includes('"productionBlockersOnly"') &&
    agentReadyCompletionAuditReportSchema.includes('"productionReportPath"') &&
    agentReadyCompletionAuditReportSchema.includes('"summary"') &&
    agentReadyCompletionAuditReportSchema.includes('"failed"') &&
    agentReadyCompletionAuditReportSchema.includes('"passed"') &&
    agentReadyCompletionAuditReportSchema.includes('"total"') &&
    agentReadyCompletionAuditReportSchema.includes('"additionalProperties": false'),
);
add(
  "agent-ready status JSON report schema exists",
  agentReadyStatusReportSchema.includes(
    '"$id": "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json"',
  ) &&
    agentReadyStatusReportSchema.includes('"$schema"') &&
    agentReadyStatusReportSchema.includes(
      '"const": "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json"',
    ) &&
    agentReadyStatusReportSchema.includes('"nextGates"') &&
    agentReadyStatusReportSchema.includes('"prefixItems"') &&
    agentReadyStatusReportSchema.includes('"dnsHost"') &&
    agentReadyStatusReportSchema.includes('"additionalProperties": false'),
);
add(
  "agent-ready live JSON report validator exists",
  agentReadyLiveReportValidate.includes("agent-ready-live-report.json") &&
    agentReadyLiveReportValidate.includes("reportSchemaUrl") &&
    agentReadyLiveReportValidate.includes("$.$schema") &&
    agentReadyLiveReportValidate.includes("--require-ok") &&
    agentReadyLiveReportValidate.includes("validateConsistency") &&
    agentReadyLiveReportValidate.includes("must equal the number of passing checks") &&
    agentReadyLiveReportValidate.includes("must equal whether passed equals total") &&
    agentReadyLiveReportValidate.includes("must be true when --require-ok is used") &&
    agentReadyLiveReportValidate.includes("Valid agent-ready live report") &&
    agentReadyLiveReportValidate.includes("Invalid agent-ready live report"),
);
add(
  "agent-ready status JSON report validator exists",
  agentReadyStatusReportValidate.includes("agent-ready-status.json") &&
    agentReadyStatusReportValidate.includes("reportSchemaUrl") &&
    agentReadyStatusReportValidate.includes("$.$schema") &&
    agentReadyStatusReportValidate.includes("--require-ok") &&
    agentReadyStatusReportValidate.includes("requiredNextGates") &&
    agentReadyStatusReportValidate.includes("validateExactStringArray") &&
    agentReadyStatusReportValidate.includes("must account for total minus passed") &&
    agentReadyStatusReportValidate.includes("must be true when --require-ok is used") &&
    agentReadyStatusReportValidate.includes("must be empty when --require-ok is used") &&
    agentReadyStatusReportValidate.includes("must equal total when --require-ok is used") &&
    agentReadyStatusReportValidate.includes("must not be empty when --require-ok is used") &&
    agentReadyStatusReportValidate.includes("Valid agent-ready status report") &&
    agentReadyStatusReportValidate.includes("Invalid agent-ready status report"),
);
add(
  "agent-ready production JSON report validator exists",
  agentReadyProductionReportValidate.includes("agent-ready-production-report.json") &&
    agentReadyProductionReportValidate.includes("reportSchemaUrl") &&
    agentReadyProductionReportValidate.includes("$.$schema") &&
    agentReadyProductionReportValidate.includes("--require-ok") &&
    agentReadyProductionReportValidate.includes("$.blockers") &&
    agentReadyProductionReportValidate.includes("$.checkedAt") &&
    agentReadyProductionReportValidate.includes("$.steps") &&
    agentReadyProductionReportValidate.includes("liveReportSchemaUrl") &&
    agentReadyProductionReportValidate.includes("statusReportSchemaUrl") &&
    agentReadyProductionReportValidate.includes("requiredNextGates") &&
    agentReadyProductionReportValidate.includes("validateExactStringArray") &&
    agentReadyProductionReportValidate.includes("validateReportConsistency") &&
    agentReadyProductionReportValidate.includes("must equal whether exitCode is zero") &&
    agentReadyProductionReportValidate.includes("must equal whether every step is ok") &&
    agentReadyProductionReportValidate.includes("must equal the number of passing checks") &&
    agentReadyProductionReportValidate.includes("built") &&
    agentReadyProductionReportValidate.includes("live") &&
    agentReadyProductionReportValidate.includes("readinessStrict") &&
    agentReadyProductionReportValidate.includes("status") &&
    agentReadyProductionReportValidate.includes("Valid agent-ready production report") &&
    agentReadyProductionReportValidate.includes("Invalid agent-ready production report"),
);
add(
  "agent-ready completion audit JSON report validator exists",
  agentReadyCompletionAuditReportValidate.includes("agent-ready-completion-audit-report.json") &&
    agentReadyCompletionAuditReportValidate.includes("reportSchemaUrl") &&
    agentReadyCompletionAuditReportValidate.includes("$.$schema") &&
    agentReadyCompletionAuditReportValidate.includes("--require-ok") &&
    agentReadyCompletionAuditReportValidate.includes("$.completionOk") &&
    agentReadyCompletionAuditReportValidate.includes("$.missingOrBlocked") &&
    agentReadyCompletionAuditReportValidate.includes("$.summary.failed") &&
    agentReadyCompletionAuditReportValidate.includes("validateReportConsistency") &&
    agentReadyCompletionAuditReportValidate.includes("must equal the number of failing checks") &&
    agentReadyCompletionAuditReportValidate.includes("must equal the number of passing checks") &&
    agentReadyCompletionAuditReportValidate.includes(
      "must equal completionOk or allowed production blockers",
    ) &&
    agentReadyCompletionAuditReportValidate.includes("must be true when --require-ok is used") &&
    agentReadyCompletionAuditReportValidate.includes("Valid agent-ready completion audit report") &&
    agentReadyCompletionAuditReportValidate.includes("Invalid agent-ready completion audit report"),
);
add(
  "agent-ready audit evidence sync exists",
  agentReadySyncAudit.includes("agent-ready-production-report.json") &&
    agentReadySyncAudit.includes("docs/agent-ready-audit.md") &&
    agentReadySyncAudit.includes("docs/completion-audit.md") &&
    agentReadySyncAudit.includes("--check") &&
    agentReadySyncAudit.includes("checkOnly") &&
    agentReadySyncAudit.includes("assertSynced") &&
    agentReadySyncAudit.includes("agent-ready-live-report.json") &&
    agentReadySyncAudit.includes("assertStandaloneLiveReportSynced") &&
    agentReadySyncAudit.includes("stableValue") &&
    agentReadySyncAudit.includes("comparableLiveReport") &&
    agentReadySyncAudit.includes("matches the embedded live report") &&
    agentReadySyncAudit.includes("Latest JSON live check") &&
    agentReadySyncAudit.includes("Latest agent-ready status check") &&
    agentReadySyncAudit.includes("Latest agent-ready live check") &&
    agentReadySyncAudit.includes("replaceOnce") &&
    agentReadySyncAudit.includes("productionEnv") &&
    agentReadySyncAudit.includes("live report checkedAt") &&
    agentReadySyncAudit.includes("status report checkedAt"),
);
add(
  "agent-ready audit documents live DNS blocker",
  agentReadyAudit.includes("Prompt-To-Artifact Checklist") &&
    agentReadyAudit.includes("Production docs URL routing") &&
    agentReadyAudit.includes("https://docs.amend.sh/docs") &&
    agentReadyAudit.includes("dig +short NS amend.sh") &&
    agentReadyAudit.includes("dig +short CNAME amend.sh") &&
    agentReadyAudit.includes("dig +short A docs.amend.sh") &&
    agentReadyAudit.includes("dig +short CNAME docs.amend.sh") &&
    agentReadyAudit.includes("A/AAAA/CNAME DNS records") &&
    agentReadyAudit.includes("whois -h whois.nic.sh amend.sh") &&
    agentReadyAudit.includes("Domain not found") &&
    agentReadyAudit.includes("128/149") &&
    agentReadyAudit.includes("15` agent-ready tests with `643` assertions") &&
    agentReadyAudit.includes("38` tests with `713` assertions") &&
    agentReadyAudit.includes("bun run smoke") &&
    agentReadyAudit.includes("bun run agent-ready") &&
    agentReadyAudit.includes("bun run agent-ready:production") &&
    agentReadyAudit.includes("bun --silent run agent-ready:production:json") &&
    hasNormalizedText(agentReadyAudit, "strict readiness, built artifacts") &&
    agentReadyAudit.includes("readiness and built artifact validation") &&
    agentReadyAudit.includes("bun run agent-ready:live"),
);
add(
  "completion audit maps the agent-ready objective",
  completionAudit.includes("Agent-Ready Objective Checklist") &&
    completionAudit.includes("Maximum-visibility crawler policy") &&
    completionAudit.includes("Canonical sitemaps") &&
    completionAudit.includes("LLM-readable maps and mirrors") &&
    completionAudit.includes(
      "machine-readable production, live, status, and completion report schema links",
    ) &&
    completionAudit.includes(
      "web/docs maps link the production, live, status, and completion report schemas",
    ) &&
    completionAudit.includes("Canonical and social metadata") &&
    completionAudit.includes("Structured data") &&
    completionAudit.includes("Crawlable public content") &&
    completionAudit.includes("Private routes noindex") &&
    completionAudit.includes("Source/build validation") &&
    completionAudit.includes("Public production validation") &&
    completionAudit.includes("Complete locally") &&
    completionAudit.includes("Blocked externally") &&
    completionAudit.includes("loading production env/provider inputs") &&
    completionAudit.includes("passing `bun run agent-ready:production`") &&
    completionAudit.includes("bun run agent-ready") &&
    completionAudit.includes("bun test scripts/agent-ready.test.ts") &&
    completionAudit.includes("bun run agent-ready:built") &&
    completionAudit.includes("bun run agent-ready:completion-audit") &&
    completionAudit.includes("agent-ready-completion-audit-report.json") &&
    completionAudit.includes("bun run agent-ready:status") &&
    completionAudit.includes("bun run agent-ready:status:json") &&
    completionAudit.includes("bun run agent-ready:status:validate-report") &&
    completionAudit.includes("bun run agent-ready:live:validate-report") &&
    completionAudit.includes("docs/agent-ready-live-report.schema.json") &&
    completionAudit.includes("docs/agent-ready-status-report.schema.json") &&
    completionAudit.includes("bun run agent-ready:final-gate") &&
    completionAudit.includes("no-secret env/deployment/DNS blocker summaries") &&
    hasNormalizedText(completionAudit, "without printing secret values") &&
    completionAudit.includes("bun run agent-ready:production") &&
    completionAudit.includes("bun --silent run agent-ready:production:json") &&
    completionAudit.includes("bun run agent-ready:production:validate-report") &&
    completionAudit.includes("bun run agent-ready:completion-audit:validate-report") &&
    completionAudit.includes("bun run agent-ready:audit:check") &&
    completionAudit.includes("bun --silent run agent-ready:live:json") &&
    completionAudit.includes("not registered/delegated") &&
    completionAudit.includes("docs.amend.sh"),
);
add(
  "agent-ready domain setup handoff exists",
  agentReadyDomainSetup.includes("Register `amend.sh`") &&
    agentReadyDomainSetup.includes("bun run agent-ready:completion-audit") &&
    agentReadyDomainSetup.includes("Delegate `amend.sh`") &&
    agentReadyDomainSetup.includes("docs.amend.sh") &&
    agentReadyDomainSetup.includes("A/AAAA or CNAME DNS records") &&
    agentReadyDomainSetup.includes("ALIAS/ANAME/flattened CNAME") &&
    agentReadyDomainSetup.includes("dig +short NS amend.sh") &&
    agentReadyDomainSetup.includes("dig +short A amend.sh") &&
    agentReadyDomainSetup.includes("dig +short CNAME amend.sh") &&
    agentReadyDomainSetup.includes("dig +short A docs.amend.sh") &&
    agentReadyDomainSetup.includes("dig +short CNAME docs.amend.sh") &&
    agentReadyDomainSetup.includes("whois -h whois.nic.sh amend.sh") &&
    agentReadyDomainSetup.includes("cloudflare-dns.com/dns-query?name=amend.sh&type=A") &&
    agentReadyDomainSetup.includes("cloudflare-dns.com/dns-query?name=docs.amend.sh&type=A") &&
    agentReadyDomainSetup.includes("Domain not found") &&
    agentReadyDomainSetup.includes("Status: 3") &&
    agentReadyDomainSetup.includes("AMEND_WEB_ORIGIN") &&
    agentReadyDomainSetup.includes("preview-only check") &&
    agentReadyDomainSetup.includes("not a substitute for the required `amend.sh`") &&
    agentReadyDomainSetup.includes("absolute URLs match") &&
    agentReadyDomainSetup.includes("agent-ready:production") &&
    agentReadyDomainSetup.includes("agent-ready:production:json") &&
    agentReadyDomainSetup.includes("agent-ready:final-gate") &&
    agentReadyDomainSetup.includes("agent-ready:live:validate-report") &&
    agentReadyDomainSetup.includes("agent-ready:status:validate-report") &&
    agentReadyDomainSetup.includes("agent-ready:production:validate-report") &&
    agentReadyDomainSetup.includes("agent-ready:sync-audit") &&
    agentReadyDomainSetup.includes("agent-ready:audit:check") &&
    agentReadyDomainSetup.includes(
      "The normal validator checks the report schema plus internal consistency",
    ) &&
    agentReadyDomainSetup.includes("step `ok` values must") &&
    agentReadyDomainSetup.includes("live `passed`/`total` counts") &&
    agentReadyDomainSetup.includes("top-level `ok` must") &&
    agentReadyDomainSetup.includes("agent-ready:built") &&
    agentReadyDomainSetup.includes("readiness:strict") &&
    agentReadyDomainSetup.includes("agent-ready:status") &&
    agentReadyDomainSetup.includes("agent-ready:status:json") &&
    agentReadyDomainSetup.includes("agent-ready:live:json") &&
    agentReadyDomainSetup.includes(
      "Treat the combined production JSON report as passing only when",
    ) &&
    agentReadyDomainSetup.includes("`ok` is `true`") &&
    agentReadyDomainSetup.includes("Every entry in `steps` has `ok: true`") &&
    agentReadyDomainSetup.includes("For the nested live report") &&
    agentReadyDomainSetup.includes("`passed` must equal `total`") &&
    agentReadyDomainSetup.includes("every entry in `checks` must have") &&
    agentReadyDomainSetup.includes("`blockers` is empty") &&
    agentReadyDomainSetup.includes("bun run agent-ready:live"),
);
add(
  "agent-ready launch docs name A/AAAA/CNAME DNS records",
  readme.includes("A/AAAA/CNAME DNS records") &&
    productionReadiness.includes("A/AAAA/CNAME DNS records") &&
    productionReadiness.includes("Alternate origins are useful for preview deployments only") &&
    productionReadiness.includes("final-response") &&
    launchRunbook.includes("A/AAAA/CNAME DNS records") &&
    launchRunbook.includes("Alternate-origin live checks are allowed for previews") &&
    launchRunbook.includes("do not replace the production gate"),
);
add(
  "agent-ready launch docs name the production gate",
  readme.includes("bun run agent-ready:production") &&
    readme.includes("bun --silent run agent-ready:production:json") &&
    readme.includes("bun run agent-ready:production:validate-report") &&
    readme.includes("bun run agent-ready:completion-audit:validate-report") &&
    readme.includes("bun run agent-ready:completion-audit") &&
    readme.includes("agent-ready-completion-audit-report.json") &&
    readme.includes("bun run agent-ready:sync-audit") &&
    readme.includes("bun run agent-ready:audit:check") &&
    readme.includes("bun run agent-ready:status") &&
    readme.includes("bun --silent run agent-ready:status:json") &&
    readme.includes("agent-ready-status.ts --json --json-file") &&
    readme.includes("agent-ready:status:validate-report") &&
    readme.includes("agent-ready-production.ts --json --json-file") &&
    launchRunbook.includes("bun run agent-ready:production") &&
    launchRunbook.includes("bun --silent run agent-ready:production:json") &&
    launchRunbook.includes("bun run agent-ready:production:validate-report") &&
    launchRunbook.includes("bun run agent-ready:completion-audit:validate-report") &&
    launchRunbook.includes("bun run agent-ready:completion-audit") &&
    launchRunbook.includes("agent-ready-completion-audit-report.json") &&
    launchRunbook.includes("bun run agent-ready:status") &&
    launchRunbook.includes("bun --silent run agent-ready:status:json") &&
    launchRunbook.includes("agent-ready-status.ts --json --json-file") &&
    launchRunbook.includes("agent-ready:status:validate-report") &&
    launchRunbook.includes("agent-ready-production.ts --json --json-file") &&
    productionReadiness.includes("bun --silent run agent-ready:production:json") &&
    productionReadiness.includes("bun run agent-ready:production:validate-report") &&
    productionReadiness.includes("bun run agent-ready:completion-audit:validate-report") &&
    productionReadiness.includes("bun run agent-ready:completion-audit") &&
    productionReadiness.includes("agent-ready-completion-audit-report.json") &&
    productionReadiness.includes("bun run agent-ready:status") &&
    productionReadiness.includes("bun --silent run agent-ready:status:json") &&
    productionReadiness.includes("agent-ready-status.ts --json --json-file") &&
    productionReadiness.includes("agent-ready:status:validate-report") &&
    productionReadiness.includes("agent-ready-production.ts --json --json-file") &&
    agentReadyDomainSetup.includes("bun run agent-ready:production") &&
    agentReadyDomainSetup.includes("bun --silent run agent-ready:production:json"),
);
add(
  "agent-ready launch docs name docs Open Graph checks",
  hasNormalizedText(readme, "docs index canonical/Open Graph/parseable TechArticle JSON-LD HTML") &&
    hasNormalizedText(
      productionReadiness,
      "docs index canonical/Open Graph/parseable TechArticle JSON-LD HTML",
    ) &&
    hasNormalizedText(
      launchRunbook,
      "docs index canonical/Open Graph/parseable TechArticle JSON-LD HTML",
    ),
);
add(
  "agent-ready docs name full crawler/fetcher policy",
  [
    readme,
    productionReadiness,
    launchRunbook,
    agentReadyDomainSetup,
    agentReadyAudit,
    completionAudit,
  ].every((doc) => aiCrawlerNames.every((crawler) => doc.includes(crawler))),
);
add(
  "agent-ready docs name JSON artifact output",
  [agentReadyDomainSetup, productionReadiness, launchRunbook].every((doc) =>
    doc.includes("--json-file"),
  ) &&
    agentReadyAudit.includes("--json-file") &&
    readme.includes("agent-ready-status.json") &&
    readme.includes("agent-ready-live-report.json") &&
    readme.includes("`nextGates`") &&
    readme.includes("agent-ready-production-report.json") &&
    readme.includes("agent-ready-completion-audit-report.json") &&
    readme.includes("`$schema` field") &&
    readme.includes("docs/agent-ready-production-report.schema.json") &&
    readme.includes("docs/agent-ready-live-report.schema.json") &&
    readme.includes("docs/agent-ready-status-report.schema.json") &&
    readme.includes("docs/agent-ready-completion-audit-report.schema.json") &&
    readme.includes("agent-ready:completion-audit:validate-report") &&
    hasNormalizedText(readme, "completion audit report schema endpoint") &&
    productionReadiness.includes("`$schema` field") &&
    productionReadiness.includes("`nextGates`") &&
    productionReadiness.includes("docs/agent-ready-production-report.schema.json") &&
    productionReadiness.includes("docs/agent-ready-live-report.schema.json") &&
    productionReadiness.includes("docs/agent-ready-status-report.schema.json") &&
    productionReadiness.includes("docs/agent-ready-completion-audit-report.schema.json") &&
    productionReadiness.includes("agent-ready:completion-audit:validate-report") &&
    hasNormalizedText(productionReadiness, "production report schema endpoint") &&
    hasNormalizedText(productionReadiness, "completion audit report schema endpoint") &&
    launchRunbook.includes("`$schema` field") &&
    launchRunbook.includes("`nextGates`") &&
    launchRunbook.includes("docs/agent-ready-production-report.schema.json") &&
    launchRunbook.includes("docs/agent-ready-live-report.schema.json") &&
    launchRunbook.includes("docs/agent-ready-status-report.schema.json") &&
    launchRunbook.includes("docs/agent-ready-completion-audit-report.schema.json") &&
    launchRunbook.includes("agent-ready:completion-audit:validate-report") &&
    hasNormalizedText(launchRunbook, "production report schema endpoint") &&
    hasNormalizedText(launchRunbook, "completion audit report schema endpoint") &&
    agentReadyDomainSetup.includes("agent-ready-status.json") &&
    agentReadyDomainSetup.includes("agent-ready-live-report.json") &&
    agentReadyDomainSetup.includes("`nextGates`") &&
    agentReadyDomainSetup.includes("agent-ready-production-report.json") &&
    agentReadyDomainSetup.includes("agent-ready-completion-audit-report.json") &&
    agentReadyDomainSetup.includes("`$schema` field") &&
    agentReadyDomainSetup.includes("docs/agent-ready-production-report.schema.json") &&
    agentReadyDomainSetup.includes("docs/agent-ready-live-report.schema.json") &&
    agentReadyDomainSetup.includes("docs/agent-ready-status-report.schema.json") &&
    agentReadyDomainSetup.includes("docs/agent-ready-completion-audit-report.schema.json") &&
    agentReadyDomainSetup.includes("agent-ready:completion-audit:validate-report") &&
    hasNormalizedText(agentReadyDomainSetup, "production report schema endpoint") &&
    hasNormalizedText(agentReadyDomainSetup, "completion audit report schema endpoint"),
);
add(
  "agent-ready JSON artifacts are ignored",
  gitignore.includes("agent-ready-live-report.json") &&
    gitignore.includes("agent-ready-production-report.json") &&
    gitignore.includes("agent-ready-status.json") &&
    gitignore.includes("agent-ready-completion-audit-report.json"),
);

for (const key of ["VITE_CONVEX_URL", "VITE_CONVEX_SITE_URL", "VITE_DOCS_URL"]) {
  add(`web env example includes ${key}`, hasLine(webEnvExample, key));
}

add(
  "production env example includes VITE_DOCS_URL",
  hasLine(productionEnvExample, "VITE_DOCS_URL"),
);
add(
  "production docs URL points to docs.amend.sh",
  productionEnvExample.includes("VITE_DOCS_URL=https://docs.amend.sh/docs") &&
    (await read("apps/web/src/lib/docs-url.ts")).includes(
      'DEFAULT_PRODUCTION_DOCS_URL = "https://docs.amend.sh/docs"',
    ) &&
    readme.includes("https://docs.amend.sh/docs") &&
    productionReadiness.includes("https://docs.amend.sh/docs"),
);
add(
  "production handoff uses Amend.sh launch origins",
  productionEnvExample.includes("SITE_URL=https://amend.sh") &&
    productionEnvExample.includes("EMAIL_FROM=Amend <updates@amend.sh>") &&
    launchRunbook.includes('bunx convex env set SITE_URL "https://amend.sh"') &&
    launchRunbook.includes('bunx convex env set EMAIL_FROM "Amend <updates@amend.sh>"') &&
    launchRunbook.includes("VITE_DOCS_URL=https://docs.amend.sh/docs") &&
    docsLaunchPage.includes("bunx convex env set SITE_URL https://amend.sh") &&
    docsLaunchPage.includes("https://amend.sh/portal/acme") &&
    !productionEnvExample.includes("SITE_URL=https://updates.example.com"),
);

add(
  "local Better Auth secret is generated",
  /^BETTER_AUTH_SECRET=(?!.*(?:replace-with|your-|placeholder)).{24,}$/im.test(backendEnvLocal),
  "packages/backend/.env.local",
);

for (const key of requiredProductionEnv) {
  add(`production env example includes ${key}`, hasLine(productionEnvExample, key));
}

add(
  "agent-ready domain setup names strict production env inputs",
  requiredProductionEnv.every((key) => agentReadyDomainSetup.includes(key)),
);

for (const key of requiredProductionEnv.filter((key) => !key.startsWith("VITE_"))) {
  add(`backend env example includes ${key}`, hasLine(backendEnvExample, key));
}

for (const [key, purpose] of productionEnvChecks) {
  add(`production env ${key}`, hasMeaningfulEnv(key), purpose);
}

for (const item of [
  "GitHub App or OAuth app slug/credentials",
  "OpenAI or alternate AI provider key",
  "Resend API key plus verified sender/domain",
  "Stripe credentials and verified billing webhooks",
  "A/AAAA/CNAME DNS records and host-based routing for custom portal/embed/API domains",
  "ALIAS/ANAME/flattened CNAME records should resolve as A/AAAA answers",
  "whois -h whois.nic.sh amend.sh",
  "Deployment target and production Convex deployment credentials",
  "bun run agent-ready:production",
  "bun --silent run agent-ready:production:json",
  "bun run agent-ready:production:validate-report",
  "bun run readiness:strict",
]) {
  add(`audit names deferred launch input: ${item}`, completionAudit.includes(item));
}

for (const item of [
  "GitHub Setup",
  "SDK Install",
  "Side Panel / Embed",
  "Notification Rules",
  "Automation Rules",
  "Proactive Agent Provider",
  "Self-Hosting",
  "Bring Your Own AI Key",
]) {
  add(`integration guide covers ${item}`, integrationGuide.includes(`## ${item}`));
}

for (const item of [
  "Preflight",
  "Provider Inputs",
  "Convex Environment",
  "GitHub App",
  "Email And Billing",
  "Custom Domains",
  "Agent-Ready Live Gate",
  "Launch Gate",
]) {
  add(`launch runbook covers ${item}`, launchRunbook.includes(`## ${item}`));
}

for (const item of [
  "CROF_API_KEY",
  "CROF_MODEL",
  "CROF_BASE_URL",
  "runProactiveAgentForWorkspace",
  "Agent command center",
]) {
  add(
    `audit covers proactive agent readiness: ${item}`,
    completionAudit.includes(item) || launchRunbook.includes(item),
  );
}

const failed = checks.filter((check) => !check.ok);
const localFailures = failed.filter((check) => !check.name.startsWith("production env "));
const productionEnvFailures = failed.filter((check) => check.name.startsWith("production env "));

console.log("");
console.log(`Readiness summary: ${checks.length - failed.length}/${checks.length} checks passing.`);
if (productionEnvFailures.length > 0) {
  console.log(
    `${productionEnvFailures.length} production env checks need real deployment secrets or provider setup.`,
  );
}

if (localFailures.length > 0 || (strict && failed.length > 0)) {
  process.exitCode = 1;
  if (strict) {
    console.error("Strict readiness failed.");
  } else {
    console.error("Local readiness failed.");
  }
}
