import { aiCrawlerNames } from "./agent-ready-live-checks";
import { checkLiveDocsSchemaEndpoints } from "./agent-ready-live-docs-schemas";
import {
  aiUserAgentAccess,
  textEndpoint,
  type LiveSurfaceContext,
} from "./agent-ready-live-surface-utils";

export async function checkLiveDocsSurface({ add, docsOrigin }: LiveSurfaceContext) {
  await textEndpoint(add, {
    allowIndexing: true,
    contentTypes: ["text/plain"],
    excludes: ["Disallow:", ...aiCrawlerNames],
    includes: ["User-agent: *", "Allow: /", `Sitemap: ${docsOrigin}/sitemap.xml`],
    label: "docs",
    origin: docsOrigin,
    path: "/robots.txt",
  });
  await textEndpoint(add, {
    allowIndexing: true,
    contentTypes: ["application/xml", "text/xml"],
    excludes: [`${docsOrigin}/api/chat`, `${docsOrigin}/api/search`],
    includes: [
      `<loc>${docsOrigin}</loc>`,
      `<loc>${docsOrigin}/docs</loc>`,
      `<loc>${docsOrigin}/schemas/agent-ready-production-report.schema.json</loc>`,
      `<loc>${docsOrigin}/schemas/agent-ready-live-report.schema.json</loc>`,
      `<loc>${docsOrigin}/schemas/agent-ready-status-report.schema.json</loc>`,
      `<loc>${docsOrigin}/schemas/agent-ready-completion-audit-report.schema.json</loc>`,
      `${docsOrigin}/docs/quickstart`,
      `${docsOrigin}/docs/customer-surfaces`,
      `${docsOrigin}/docs/source-events`,
      `${docsOrigin}/docs/automation`,
      `${docsOrigin}/docs/api-reference`,
      `${docsOrigin}/docs/production-routing`,
      "<lastmod>",
      "<changefreq>",
      "<priority>",
    ],
    label: "docs",
    origin: docsOrigin,
    path: "/sitemap.xml",
  });
  await textEndpoint(add, {
    allowIndexing: true,
    contentTypes: ["text/plain", "text/markdown"],
    includes: [
      "/llms.mdx/docs",
      "Quickstart",
      "/schemas/agent-ready-production-report.schema.json",
      "/schemas/agent-ready-live-report.schema.json",
      "/schemas/agent-ready-status-report.schema.json",
      "/schemas/agent-ready-completion-audit-report.schema.json",
    ],
    label: "docs",
    origin: docsOrigin,
    path: "/llms.txt",
  });
  await textEndpoint(add, {
    allowIndexing: true,
    contentTypes: ["text/plain", "text/markdown"],
    includes: ["# Quickstart", "# Integration"],
    label: "docs",
    origin: docsOrigin,
    path: "/llms-full.txt",
  });
  await checkLiveDocsSchemaEndpoints(add, docsOrigin);
  await textEndpoint(add, {
    allowIndexing: true,
    contentTypes: ["text/html"],
    excludes: ["noindex"],
    includes: [
      `href="${docsOrigin}/docs"`,
      `property="og:url"`,
      `"@type":"TechArticle"`,
      "Quickstart",
    ],
    label: "docs",
    origin: docsOrigin,
    path: "/docs",
    structuredDataTypes: ["TechArticle"],
  });
  for (const page of [
    {
      copy: "Prove one source-linked update loop",
      path: "/docs/quickstart",
    },
    {
      copy: "Choose the right integration path",
      path: "/docs/integration",
    },
    {
      copy: "Wire customer identity",
      path: "/docs/customer-surfaces",
    },
    {
      copy: "Import GitHub",
      path: "/docs/source-events",
    },
    {
      copy: "Configure Mostly Auto rules",
      path: "/docs/automation",
    },
    {
      copy: "Beta REST and SDK contract",
      path: "/docs/api-reference",
    },
    {
      copy: "The evidence chain",
      path: "/docs/source-trace",
    },
    {
      copy: "Run Amend with your own deployment",
      path: "/docs/self-hosting",
    },
    {
      copy: "Make docs work from docs.amend.sh",
      path: "/docs/production-routing",
    },
    {
      copy: "Production launch checklist",
      path: "/docs/launch",
    },
  ]) {
    await textEndpoint(add, {
      allowIndexing: true,
      contentTypes: ["text/html"],
      excludes: ["noindex"],
      includes: [
        `href="${docsOrigin}${page.path}"`,
        `property="og:url"`,
        `"@type":"TechArticle"`,
        page.copy,
      ],
      label: "docs",
      origin: docsOrigin,
      path: page.path,
      structuredDataTypes: ["TechArticle"],
    });
  }
  await textEndpoint(add, {
    allowIndexing: true,
    contentTypes: ["text/html"],
    excludes: ["noindex"],
    includes: [
      `href="${docsOrigin}`,
      `property="og:url"`,
      `"@type":"WebSite"`,
      "Source-linked product updates",
    ],
    label: "docs",
    origin: docsOrigin,
    path: "/",
    structuredDataTypes: ["WebSite"],
  });
  await aiUserAgentAccess(add, {
    includes: ["Source-linked product updates"],
    label: "docs",
    origin: docsOrigin,
    path: "/",
  });
}
