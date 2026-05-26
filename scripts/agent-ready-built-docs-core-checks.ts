import type { BuiltDocsArtifacts } from "./agent-ready-built-docs-artifacts";
import { aiCrawlerNames } from "./agent-ready-policy";
import {
  add,
  excludesAll,
  extractMarkdownLinks,
  extractSitemapLocs,
  hasNoDuplicateValues,
  includesAll,
  locsStayOnOrigin,
  metaHasContentType,
} from "./agent-ready-built-utils";

export function checkBuiltDocsCoreArtifacts(artifacts: BuiltDocsArtifacts) {
  const docsSitemapLocs = extractSitemapLocs(artifacts.docsSitemap);
  const docsLlmsLinks = extractMarkdownLinks(artifacts.docsLlms);

  add(
    "built docs route manifests expose agent-ready endpoints",
    includesAll(artifacts.appPathRoutesManifest, [
      '"/robots.txt/route": "/robots.txt"',
      '"/sitemap.xml/route": "/sitemap.xml"',
      '"/llms.txt/route": "/llms.txt"',
      '"/llms-full.txt/route": "/llms-full.txt"',
      '"/llms.mdx/docs/[[...slug]]/route": "/llms.mdx/docs/[[...slug]]"',
      '"/schemas/agent-ready-production-report.schema.json/route": "/schemas/agent-ready-production-report.schema.json"',
      '"/schemas/agent-ready-live-report.schema.json/route": "/schemas/agent-ready-live-report.schema.json"',
      '"/schemas/agent-ready-status-report.schema.json/route": "/schemas/agent-ready-status-report.schema.json"',
      '"/schemas/agent-ready-completion-audit-report.schema.json/route": "/schemas/agent-ready-completion-audit-report.schema.json"',
    ]) &&
      includesAll(artifacts.routesManifest, [
        '"page": "/robots.txt"',
        '"page": "/sitemap.xml"',
        '"page": "/llms.txt"',
        '"page": "/llms-full.txt"',
        '"page": "/llms.mdx/docs/[[...slug]]"',
        '"page": "/schemas/agent-ready-production-report.schema.json"',
        '"page": "/schemas/agent-ready-live-report.schema.json"',
        '"page": "/schemas/agent-ready-status-report.schema.json"',
        '"page": "/schemas/agent-ready-completion-audit-report.schema.json"',
      ]),
  );

  add(
    "built docs robots keeps maximum-visibility policy",
    includesAll(artifacts.docsRobots, [
      "User-agent: *",
      "Allow: /",
      "Sitemap: https://docs.amend.sh/sitemap.xml",
    ]) && excludesAll(artifacts.docsRobots, ["Disallow:", ...aiCrawlerNames]),
  );

  add(
    "built docs robots has text/plain metadata",
    metaHasContentType(artifacts.docsRobotsMeta, "text/plain"),
  );

  add(
    "built docs sitemap includes docs routes and metadata",
    includesAll(artifacts.docsSitemap, [
      "<loc>https://docs.amend.sh</loc>",
      "<loc>https://docs.amend.sh/docs</loc>",
      "<loc>https://docs.amend.sh/docs/quickstart</loc>",
      "<loc>https://docs.amend.sh/docs/integration</loc>",
      "<loc>https://docs.amend.sh/docs/source-trace</loc>",
      "<loc>https://docs.amend.sh/docs/self-hosting</loc>",
      "<loc>https://docs.amend.sh/docs/launch</loc>",
      "<loc>https://docs.amend.sh/schemas/agent-ready-production-report.schema.json</loc>",
      "<loc>https://docs.amend.sh/schemas/agent-ready-live-report.schema.json</loc>",
      "<loc>https://docs.amend.sh/schemas/agent-ready-status-report.schema.json</loc>",
      "<loc>https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json</loc>",
      "<lastmod>",
      "<changefreq>",
      "<priority>",
    ]) &&
      excludesAll(artifacts.docsSitemap, [
        "https://docs.amend.sh/api/chat",
        "https://docs.amend.sh/api/search",
      ]),
  );

  add(
    "built docs sitemap has application/xml metadata",
    metaHasContentType(artifacts.docsSitemapMeta, "application/xml"),
  );

  add(
    "built docs sitemap has unique on-origin locs",
    docsSitemapLocs.length > 0 &&
      hasNoDuplicateValues(docsSitemapLocs) &&
      locsStayOnOrigin(docsSitemapLocs, "https://docs.amend.sh"),
    `${docsSitemapLocs.length} locs`,
  );

  add(
    "built docs llms resources expose docs index and full text",
    includesAll(artifacts.docsLlms, [
      "/docs",
      "/docs/quickstart",
      "/docs/integration",
      "/docs/launch",
    ]) &&
      artifacts.docsLlms.includes("/schemas/agent-ready-production-report.schema.json") &&
      artifacts.docsLlms.includes("/schemas/agent-ready-live-report.schema.json") &&
      artifacts.docsLlms.includes("/schemas/agent-ready-status-report.schema.json") &&
      artifacts.docsLlms.includes("/schemas/agent-ready-completion-audit-report.schema.json") &&
      includesAll(artifacts.docsLlmsFull, [
        "# Amend.sh Docs",
        "# Quickstart",
        "# Integration",
        "# Source Trace",
        "# Self-Hosting",
        "# Launch",
      ]),
  );

  add(
    "built docs llms resources have text/plain metadata",
    metaHasContentType(artifacts.docsLlmsMeta, "text/plain") &&
      metaHasContentType(artifacts.docsLlmsFullMeta, "text/plain"),
  );

  return { docsLlmsLinks, docsSitemapLocs };
}
