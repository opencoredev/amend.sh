import { aiCrawlerNames } from "./agent-ready-live-checks";
import {
  aiUserAgentAccess,
  textEndpoint,
  type LiveSurfaceContext,
} from "./agent-ready-live-surface-utils";

export async function checkLiveWebSurface({ add, docsOrigin, webOrigin }: LiveSurfaceContext) {
  await textEndpoint(add, {
    allowIndexing: true,
    contentTypes: ["text/plain"],
    excludes: ["Disallow:", ...aiCrawlerNames],
    includes: ["User-agent: *", "Allow: /", `Sitemap: ${webOrigin}/sitemap.xml`],
    label: "web",
    origin: webOrigin,
    path: "/robots.txt",
  });
  await textEndpoint(add, {
    allowIndexing: true,
    contentTypes: ["application/xml", "text/xml"],
    excludes: [
      `${webOrigin}/dashboard`,
      `${webOrigin}/sign-in`,
      `${webOrigin}/sign-up`,
      `${webOrigin}/api/auth`,
    ],
    includes: [
      `<loc>${webOrigin}/</loc>`,
      `<loc>${webOrigin}/brand</loc>`,
      `<loc>${webOrigin}/embed-demo</loc>`,
      `<loc>${webOrigin}/portal/amend-labs</loc>`,
      "<lastmod>",
      "<changefreq>",
      "<priority>",
    ],
    label: "web",
    origin: webOrigin,
    path: "/sitemap.xml",
  });
  await textEndpoint(add, {
    allowIndexing: true,
    contentTypes: ["text/plain", "text/markdown"],
    includes: [
      `[Docs landing](${docsOrigin})`,
      `[Docs index](${docsOrigin}/docs)`,
      `[Agent-ready production report JSON Schema](${docsOrigin}/schemas/agent-ready-production-report.schema.json)`,
      `[Agent-ready status report JSON Schema](${docsOrigin}/schemas/agent-ready-status-report.schema.json)`,
      `[Agent-ready completion audit report JSON Schema](${docsOrigin}/schemas/agent-ready-completion-audit-report.schema.json)`,
      "Authenticated dashboard pages and API/auth routes",
    ],
    label: "web",
    origin: webOrigin,
    path: "/llms.txt",
  });
  await textEndpoint(add, {
    allowIndexing: true,
    contentTypes: ["text/html"],
    excludes: ["noindex"],
    includes: [
      `href="${webOrigin}/"`,
      `property="og:url"`,
      `content="${webOrigin}/"`,
      `name="twitter:card"`,
      `"@type":"Organization"`,
      `"@type":"SoftwareApplication"`,
      "Amend.sh connects customer feedback",
    ],
    label: "web",
    origin: webOrigin,
    path: "/",
    structuredDataTypes: ["Organization", "SoftwareApplication"],
  });
  await aiUserAgentAccess(add, {
    includes: ["Amend.sh connects customer feedback"],
    label: "web",
    origin: webOrigin,
    path: "/",
  });
  for (const page of [
    {
      copy: "Brand guidelines",
      path: "/brand",
    },
    {
      copy: "The portal inside your app",
      path: "/embed-demo",
    },
    {
      copy: "Amend public portal",
      path: "/portal/amend-labs",
    },
  ]) {
    await textEndpoint(add, {
      allowIndexing: true,
      contentTypes: ["text/html"],
      excludes: ["noindex"],
      includes: [
        `href="${webOrigin}${page.path}"`,
        `property="og:url"`,
        `content="${webOrigin}${page.path}"`,
        page.copy,
      ],
      label: "web",
      origin: webOrigin,
      path: page.path,
    });
  }
  await textEndpoint(add, {
    contentTypes: ["text/html"],
    includes: ["noindex, nofollow"],
    label: "web",
    origin: webOrigin,
    path: "/sign-in",
  });
}
