import { expect, test } from "bun:test";
import { aiCrawlerNames } from "./agent-ready-policy";

type ReadText = (path: string) => Promise<string>;

export function registerAgentReadyDocsSurfaceTests(read: ReadText) {
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
}
