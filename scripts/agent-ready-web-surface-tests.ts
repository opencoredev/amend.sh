import { expect, test } from "bun:test";
import { aiCrawlerNames } from "./agent-ready-policy";

type ReadText = (path: string) => Promise<string>;

export function registerAgentReadyWebSurfaceTests(read: ReadText) {
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
      "https://docs.amend.sh/docs/customer-surfaces",
      "https://docs.amend.sh/docs/source-events",
      "https://docs.amend.sh/docs/automation",
      "https://docs.amend.sh/docs/api-reference",
      "https://docs.amend.sh/docs/self-hosting",
      "https://docs.amend.sh/docs/source-trace",
      "https://docs.amend.sh/docs/production-routing",
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
    expect(docsUrlHelper).toContain('DEFAULT_PRODUCTION_DOCS_URL = "https://amend.sh/docs"');
    expect(docsUrlHelper).not.toContain('DEFAULT_PRODUCTION_DOCS_URL = "/docs"');
    expect(productionEnvExample).toContain("VITE_DOCS_URL=https://amend.sh/docs");
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
}
