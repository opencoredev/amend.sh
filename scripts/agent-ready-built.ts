import { readdir, readFile } from "node:fs/promises";
import { aiCrawlerNames } from "./agent-ready-policy";

type Check = {
  detail?: string;
  name: string;
  ok: boolean;
};

type BuiltMeta = {
  headers?: Record<string, string>;
  status?: number;
};

const checks: Check[] = [];
const root = new URL("../", import.meta.url);

async function read(path: string) {
  try {
    return await readFile(new URL(path, root), "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new Error(
        `Missing ${path}. Run \`bun run build\` before \`bun run agent-ready:built\`.`,
      );
    }
    throw error;
  }
}

async function readBundleContaining(directory: string, marker: string) {
  const entries = await readdir(new URL(directory, root));
  for (const entry of entries.filter((entry) => entry.endsWith(".js"))) {
    const path = `${directory}/${entry}`;
    const content = await read(path);
    if (content.includes(marker)) {
      return content;
    }
  }
  throw new Error(
    `Missing built bundle in ${directory} containing ${marker}. Run \`bun run build\`.`,
  );
}

async function readMeta(path: string) {
  return JSON.parse(await read(path)) as BuiltMeta;
}

function add(name: string, ok: boolean, detail?: string) {
  checks.push({ detail, name, ok });
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` - ${detail}` : ""}`);
}

function includesAll(content: string, expected: string[]) {
  return expected.every((value) => content.includes(value));
}

function excludesAll(content: string, unexpected: string[]) {
  return unexpected.every((value) => !content.includes(value));
}

function extractSitemapLocs(xml: string) {
  return Array.from(xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g), (match) => match[1].trim());
}

function extractMarkdownLinks(markdown: string) {
  return Array.from(markdown.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g), (match) => match[1].trim());
}

function hasNoDuplicateValues(values: string[]) {
  return new Set(values).size === values.length;
}

function locsStayOnOrigin(locs: string[], origin: string) {
  return locs.every((loc) => loc === origin || loc.startsWith(`${origin}/`));
}

function metaHasContentType(meta: BuiltMeta, expected: string) {
  return meta.status === 200 && meta.headers?.["content-type"]?.includes(expected) === true;
}

function isParseableJsonObject(content: string) {
  try {
    const parsed = JSON.parse(content);
    return Boolean(parsed && typeof parsed === "object" && !Array.isArray(parsed));
  } catch {
    return false;
  }
}

const docsPages = [
  {
    copy: "Build a source-linked product update loop",
    html: "apps/fumadocs/.next/server/app/docs.html",
    markdownCopy: "Amend connects four things teams usually keep apart",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/content.md.body",
    path: "/docs",
  },
  {
    copy: "Prove one source-linked update loop",
    html: "apps/fumadocs/.next/server/app/docs/quickstart.html",
    markdownCopy: "one workspace, one customer request",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/quickstart/content.md.body",
    path: "/docs/quickstart",
  },
  {
    copy: "Connect Amend to your portal",
    html: "apps/fumadocs/.next/server/app/docs/integration.html",
    markdownCopy: "Integrate Amend from the outside in",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/integration/content.md.body",
    path: "/docs/integration",
  },
  {
    copy: "The evidence chain",
    html: "apps/fumadocs/.next/server/app/docs/source-trace.html",
    markdownCopy: "Source trace is the reason Amend exists",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/source-trace/content.md.body",
    path: "/docs/source-trace",
  },
  {
    copy: "Run Amend with your own deployment",
    html: "apps/fumadocs/.next/server/app/docs/self-hosting.html",
    markdownCopy: "Self-hosting keeps the same product loop",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/self-hosting/content.md.body",
    path: "/docs/self-hosting",
  },
  {
    copy: "Production launch checklist",
    html: "apps/fumadocs/.next/server/app/docs/launch.html",
    markdownCopy: "bun run agent-ready:live",
    markdown: "apps/fumadocs/.next/server/app/llms.mdx/docs/launch/content.md.body",
    path: "/docs/launch",
  },
];

const webPublicPages = [
  {
    copy: [
      "Close the loop between",
      "feedback and shipped code.",
      "Collect requests from the channels people already use.",
      "Customer feedback should not die in Slack.",
    ],
    marker: "Close the loop between",
    path: "/",
  },
  {
    copy: [
      "Use the full lockup first.",
      "The symbol is the compact mark.",
      "Lockup for the brand. Mark for the product surface.",
    ],
    marker: "Use the full lockup first.",
    path: "/brand",
  },
  {
    copy: [
      "The portal inside your app.",
      "This route mounts the same side-panel helper customer apps can install.",
      "View hosted portal",
    ],
    marker: "The portal inside your app.",
    path: "/embed-demo",
  },
  {
    copy: [
      "Requests, roadmap moves, and shipped updates with source evidence from Amend.",
      "Ready to collect feedback",
      "Share this portal with users to start collecting source-linked requests.",
    ],
    marker: "Ready to collect feedback",
    path: "/portal/amend-labs",
  },
];

const webRobots = await read("apps/web/dist/client/robots.txt");
const webSitemap = await read("apps/web/dist/client/sitemap.xml");
const webLlms = await read("apps/web/dist/client/llms.txt");
const webSitemapLocs = extractSitemapLocs(webSitemap);
const webLlmsLinks = extractMarkdownLinks(webLlms);
const webSeoBundle = await readBundleContaining(
  "apps/web/dist/server/assets",
  "SoftwareApplication",
);
const webRouterBundle = await readBundleContaining(
  "apps/web/dist/server/assets",
  'canonicalLink("/")',
);

add(
  "built web robots keeps maximum-visibility policy",
  includesAll(webRobots, ["User-agent: *", "Allow: /", "Sitemap: https://amend.sh/sitemap.xml"]) &&
    excludesAll(webRobots, ["Disallow:", ...aiCrawlerNames]),
);

add(
  "built web sitemap includes public canonical routes only",
  includesAll(webSitemap, [
    "<loc>https://amend.sh/</loc>",
    "<loc>https://amend.sh/brand</loc>",
    "<loc>https://amend.sh/embed-demo</loc>",
    "<loc>https://amend.sh/portal/amend-labs</loc>",
    "<lastmod>",
    "<changefreq>",
    "<priority>",
  ]) &&
    excludesAll(webSitemap, [
      "https://amend.sh/dashboard",
      "https://amend.sh/sign-in",
      "https://amend.sh/sign-up",
      "https://amend.sh/api/auth",
    ]),
);

add(
  "built web sitemap has unique on-origin locs",
  webSitemapLocs.length > 0 &&
    hasNoDuplicateValues(webSitemapLocs) &&
    locsStayOnOrigin(webSitemapLocs, "https://amend.sh"),
  `${webSitemapLocs.length} locs`,
);

add(
  "built web llms.txt points to web and docs public resources",
  includesAll(webLlms, [
    "https://amend.sh/",
    "https://amend.sh/brand",
    "https://amend.sh/embed-demo",
    "https://amend.sh/portal/amend-labs",
    "https://docs.amend.sh",
    "https://docs.amend.sh/docs",
    "https://docs.amend.sh/docs/quickstart",
    "Authenticated dashboard pages and API/auth routes",
    "not a guarantee of AI search inclusion",
  ]),
);

add(
  "built web llms.txt links are unique and on allowed origins",
  webLlmsLinks.length > 0 &&
    hasNoDuplicateValues(webLlmsLinks) &&
    webLlmsLinks.every(
      (link) => link.startsWith("https://amend.sh") || link.startsWith("https://docs.amend.sh"),
    ),
  `${webLlmsLinks.length} links`,
);

add(
  "built web llms.txt web links appear in web sitemap",
  webLlmsLinks
    .filter((link) => link.startsWith("https://amend.sh"))
    .every((link) => webSitemapLocs.includes(link)),
);

add(
  "built web server bundle preserves metadata helpers and JSON-LD",
  includesAll(webSeoBundle, [
    "canonicalLink",
    "og:url",
    "twitter:card",
    "noindex, nofollow",
    "SoftwareApplication",
    "Organization",
  ]) && includesAll(webRouterBundle, ['canonicalLink("/")', 'canonicalLink("/brand")']),
);

for (const page of webPublicPages) {
  const bundle = await readBundleContaining("apps/web/dist/server/assets", page.marker);
  add(
    `built web route bundle exposes crawlable copy for ${page.path}`,
    includesAll(bundle, page.copy) && !bundle.includes("noindex, nofollow"),
  );
}

const appPathRoutesManifest = await read("apps/fumadocs/.next/app-path-routes-manifest.json");
const routesManifest = await read("apps/fumadocs/.next/routes-manifest.json");
const docsRobots = await read("apps/fumadocs/.next/server/app/robots.txt.body");
const docsRobotsMeta = await readMeta("apps/fumadocs/.next/server/app/robots.txt.meta");
const docsSitemap = await read("apps/fumadocs/.next/server/app/sitemap.xml.body");
const docsSitemapMeta = await readMeta("apps/fumadocs/.next/server/app/sitemap.xml.meta");
const docsLlms = await read("apps/fumadocs/.next/server/app/llms.txt.body");
const docsLlmsMeta = await readMeta("apps/fumadocs/.next/server/app/llms.txt.meta");
const docsLlmsFull = await read("apps/fumadocs/.next/server/app/llms-full.txt.body");
const docsLlmsFullMeta = await readMeta("apps/fumadocs/.next/server/app/llms-full.txt.meta");
const docsProductionReportSchema = await read(
  "apps/fumadocs/.next/server/app/schemas/agent-ready-production-report.schema.json.body",
);
const docsProductionReportSchemaMeta = await readMeta(
  "apps/fumadocs/.next/server/app/schemas/agent-ready-production-report.schema.json.meta",
);
const docsLiveReportSchema = await read(
  "apps/fumadocs/.next/server/app/schemas/agent-ready-live-report.schema.json.body",
);
const docsLiveReportSchemaMeta = await readMeta(
  "apps/fumadocs/.next/server/app/schemas/agent-ready-live-report.schema.json.meta",
);
const docsStatusReportSchema = await read(
  "apps/fumadocs/.next/server/app/schemas/agent-ready-status-report.schema.json.body",
);
const docsStatusReportSchemaMeta = await readMeta(
  "apps/fumadocs/.next/server/app/schemas/agent-ready-status-report.schema.json.meta",
);
const docsCompletionAuditReportSchema = await read(
  "apps/fumadocs/.next/server/app/schemas/agent-ready-completion-audit-report.schema.json.body",
);
const docsCompletionAuditReportSchemaMeta = await readMeta(
  "apps/fumadocs/.next/server/app/schemas/agent-ready-completion-audit-report.schema.json.meta",
);
const docsHome = await read("apps/fumadocs/.next/server/app/index.html");
const docsSitemapLocs = extractSitemapLocs(docsSitemap);
const docsLlmsLinks = extractMarkdownLinks(docsLlms);

add(
  "built docs route manifests expose agent-ready endpoints",
  includesAll(appPathRoutesManifest, [
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
    includesAll(routesManifest, [
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
  includesAll(docsRobots, [
    "User-agent: *",
    "Allow: /",
    "Sitemap: https://docs.amend.sh/sitemap.xml",
  ]) && excludesAll(docsRobots, ["Disallow:", ...aiCrawlerNames]),
);

add("built docs robots has text/plain metadata", metaHasContentType(docsRobotsMeta, "text/plain"));

add(
  "built docs sitemap includes docs routes and metadata",
  includesAll(docsSitemap, [
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
    excludesAll(docsSitemap, [
      "https://docs.amend.sh/api/chat",
      "https://docs.amend.sh/api/search",
    ]),
);

add(
  "built docs sitemap has application/xml metadata",
  metaHasContentType(docsSitemapMeta, "application/xml"),
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
  includesAll(docsLlms, ["/docs", "/docs/quickstart", "/docs/integration", "/docs/launch"]) &&
    docsLlms.includes("/schemas/agent-ready-production-report.schema.json") &&
    docsLlms.includes("/schemas/agent-ready-live-report.schema.json") &&
    docsLlms.includes("/schemas/agent-ready-status-report.schema.json") &&
    docsLlms.includes("/schemas/agent-ready-completion-audit-report.schema.json") &&
    includesAll(docsLlmsFull, [
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
  metaHasContentType(docsLlmsMeta, "text/plain") &&
    metaHasContentType(docsLlmsFullMeta, "text/plain"),
);

add(
  "built docs production report schema endpoint exposes JSON Schema",
  includesAll(docsProductionReportSchema, [
    '"$schema": "https://json-schema.org/draft/2020-12/schema"',
    '"$id": "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json"',
    '"$schema"',
    '"blockers"',
    '"checkedAt"',
    '"ok"',
    '"steps"',
    '"liveReport"',
    '"const": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
    '"statusReport"',
    '"nextGates"',
    '"const": "bun run agent-ready:production"',
    '"const": "bun run agent-ready:final-gate"',
    '"liveStep"',
    '"statusStep"',
  ]) &&
    isParseableJsonObject(docsProductionReportSchema) &&
    metaHasContentType(docsProductionReportSchemaMeta, "application/schema+json"),
);

add(
  "built docs live report schema endpoint exposes JSON Schema",
  includesAll(docsLiveReportSchema, [
    '"$schema": "https://json-schema.org/draft/2020-12/schema"',
    '"$id": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
    '"blockers"',
    '"checks"',
    '"origins"',
    '"passed"',
    '"total"',
  ]) &&
    isParseableJsonObject(docsLiveReportSchema) &&
    metaHasContentType(docsLiveReportSchemaMeta, "application/schema+json"),
);

add(
  "built docs status report schema endpoint exposes JSON Schema",
  includesAll(docsStatusReportSchema, [
    '"$schema": "https://json-schema.org/draft/2020-12/schema"',
    '"$id": "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json"',
    '"blockers"',
    '"dns"',
    '"nextGates"',
    '"const": "bun run agent-ready:production"',
    '"const": "bun run agent-ready:final-gate"',
    '"productionEnv"',
  ]) &&
    isParseableJsonObject(docsStatusReportSchema) &&
    metaHasContentType(docsStatusReportSchemaMeta, "application/schema+json"),
);

add(
  "built docs completion audit report schema endpoint exposes JSON Schema",
  includesAll(docsCompletionAuditReportSchema, [
    '"$schema": "https://json-schema.org/draft/2020-12/schema"',
    '"$id": "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json"',
    '"allowProductionBlockers"',
    '"checks"',
    '"completionOk"',
    '"missingOrBlocked"',
    '"productionBlockersOnly"',
    '"summary"',
  ]) &&
    isParseableJsonObject(docsCompletionAuditReportSchema) &&
    metaHasContentType(docsCompletionAuditReportSchemaMeta, "application/schema+json"),
);

add(
  "built web llms.txt docs links appear in docs sitemap",
  webLlmsLinks
    .filter((link) => link.startsWith("https://docs.amend.sh"))
    .every((link) => docsSitemapLocs.includes(link)),
);

add(
  "built docs llms.txt links are unique and represented in docs sitemap",
  docsLlmsLinks.length > 0 &&
    hasNoDuplicateValues(docsLlmsLinks) &&
    docsLlmsLinks.every((link) => docsSitemapLocs.includes(`https://docs.amend.sh${link}`)),
  `${docsLlmsLinks.length} links`,
);

add(
  "built docs landing has canonical metadata, crawlable copy, and WebSite JSON-LD",
  includesAll(docsHome, [
    'rel="canonical" href="https://docs.amend.sh"',
    'property="og:url" content="https://docs.amend.sh"',
    '"@type":"WebSite"',
    '"@type":"Organization"',
    "Source-linked product updates",
  ]) && !docsHome.includes("noindex"),
);

for (const page of docsPages) {
  const [html, markdown, markdownMeta] = await Promise.all([
    read(page.html),
    read(page.markdown),
    readMeta(page.markdown.replace(/\.body$/, ".meta")),
  ]);
  add(
    `built docs HTML exposes ${page.path}`,
    includesAll(html, [
      `rel="canonical" href="https://docs.amend.sh${page.path}"`,
      `property="og:url" content="https://docs.amend.sh${page.path}"`,
      '"@type":"TechArticle"',
      page.copy,
    ]) && !html.includes("noindex"),
  );
  add(
    `built docs Markdown mirror exposes ${page.path}`,
    includesAll(markdown, [page.markdownCopy, `(${page.path})`]) && !markdown.includes("noindex"),
  );
  add(
    `built docs Markdown mirror has text/markdown metadata for ${page.path}`,
    metaHasContentType(markdownMeta, "text/markdown"),
  );
}

const failed = checks.filter((check) => !check.ok);
console.log("");
console.log(
  `Agent-ready built summary: ${checks.length - failed.length}/${checks.length} passing.`,
);
if (failed.length > 0) {
  process.exitCode = 1;
}
