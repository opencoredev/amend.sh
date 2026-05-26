import {
  add,
  agentReadyBuilt,
  agentReadyLive,
  agentReadyPolicy,
  aiCrawlerNames,
} from "./readiness-context";

export function runReadinessAgentLiveBuiltChecks() {
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
      agentReadyBuilt.includes(
        "built docs production report schema endpoint exposes JSON Schema",
      ) &&
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
}
