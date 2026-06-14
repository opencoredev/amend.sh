import { expect, test } from "bun:test";
import { aiCrawlerNames } from "./agent-ready-policy";

type ReadText = (path: string) => Promise<string>;

export function registerAgentReadyDocsSurfaceTests(read: ReadText) {
  test("docs host has maximum-visibility robots, generated sitemap, llms routes, and canonical metadata", async () => {
    // The docs app runs on TanStack Start (SPA mode); server surfaces are file
    // routes under apps/fumadocs/src/routes, with the docs origin in lib/shared.
    const shared = await read("apps/fumadocs/src/lib/shared.ts");
    const robotsRoute = await read("apps/fumadocs/src/routes/robots[.]txt.ts");
    const sitemapRoute = await read("apps/fumadocs/src/routes/sitemap[.]xml.ts");
    const rootRoute = await read("apps/fumadocs/src/routes/__root.tsx");
    const docsHome = await read("apps/fumadocs/src/routes/index.tsx");
    const docsPage = await read("apps/fumadocs/src/routes/docs/$.tsx");
    const llmsIndex = await read("apps/fumadocs/src/routes/llms[.]txt.ts");
    const llmsFull = await read("apps/fumadocs/src/routes/llms-full[.]txt.ts");
    const llmsMarkdown = await read("apps/fumadocs/src/routes/llms[.]mdx/docs/$.ts");
    const schemaRoute = await read("apps/fumadocs/src/routes/schemas/$.ts");

    // Docs origin lives in one shared module.
    expect(shared).toContain('docsUrl = "https://docs.amend.sh"');

    // robots: maximum visibility, no AI-crawler blocks, points at the sitemap.
    expect(robotsRoute).toContain("User-agent: *");
    expect(robotsRoute).toContain("Allow: /");
    expect(robotsRoute).toContain("${docsUrl}/sitemap.xml");
    expect(robotsRoute).not.toContain("Disallow:");
    for (const crawler of aiCrawlerNames) {
      expect(robotsRoute).not.toContain(crawler);
    }

    // sitemap: docs origin, generated pages, schema contracts, well-formed xml.
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

    // canonical + Open Graph metadata on the root document, home, and docs pages.
    expect(rootRoute).toContain("Amend.sh Docs");
    expect(rootRoute).toContain('name: "description"');
    expect(docsHome).toContain('rel: "canonical"');
    expect(docsHome).toContain("og:title");
    expect(docsHome).toContain('type="application/ld+json"');
    expect(docsHome).toContain('"@type": "WebSite"');
    expect(docsHome).toContain('"@type": "Organization"');
    expect(docsPage).toContain('rel: "canonical"');
    expect(docsPage).toContain("og:title");
    expect(docsPage).toContain('type="application/ld+json"');
    expect(docsPage).toContain('"@type": "TechArticle"');
    expect(docsPage).toContain('"@type": "WebSite"');

    // llms.txt index, full corpus, and per-page markdown negotiation.
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

    // machine-readable JSON Schemas served with the schema content type.
    expect(schemaRoute).toContain("application/schema+json");
    expect(schemaRoute).toContain("agent-ready-production-report.schema.json");
    expect(schemaRoute).toContain("agent-ready-live-report.schema.json");
    expect(schemaRoute).toContain("agent-ready-status-report.schema.json");
    expect(schemaRoute).toContain("agent-ready-completion-audit-report.schema.json");
    expect(schemaRoute).toContain("JSON.stringify(schema, null, 2)");
  });
}
