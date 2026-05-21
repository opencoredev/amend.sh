import { writeFile } from "node:fs/promises";
import { resolve4, resolve6, resolveCname, resolveNs } from "node:dns/promises";
import { aiAccessUserAgents, aiCrawlerNames } from "./agent-ready-policy";

type Check = {
  detail?: string;
  name: string;
  ok: boolean;
};

const webOrigin = process.env.AMEND_WEB_ORIGIN ?? "https://amend.sh";
const docsOrigin = process.env.AMEND_DOCS_ORIGIN ?? "https://docs.amend.sh";
const reportSchemaUrl = "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json";
const jsonOutput = process.argv.includes("--json");
const jsonFileFlagIndex = process.argv.indexOf("--json-file");
const jsonFile = jsonFileFlagIndex >= 0 ? process.argv[jsonFileFlagIndex + 1] : undefined;
const checks: Check[] = [];
const blockers = new Set<string>();

if (jsonFileFlagIndex >= 0 && !jsonFile) {
  throw new Error("Missing path after --json-file.");
}

function add(name: string, ok: boolean, detail?: string) {
  checks.push({ detail, name, ok });
  if (!jsonOutput) {
    console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` - ${detail}` : ""}`);
  }
}

function decodeHtml(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function collectJsonLdTypes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectJsonLdTypes);
  }
  if (!value || typeof value !== "object") {
    return [];
  }
  const record = value as Record<string, unknown>;
  const ownTypes = Array.isArray(record["@type"])
    ? record["@type"].filter((type): type is string => typeof type === "string")
    : typeof record["@type"] === "string"
      ? [record["@type"]]
      : [];
  const graphTypes = collectJsonLdTypes(record["@graph"]);
  return [...ownTypes, ...graphTypes];
}

function extractJsonLdTypes(html: string) {
  const matches = html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  const types: string[] = [];
  for (const match of matches) {
    try {
      types.push(...collectJsonLdTypes(JSON.parse(decodeHtml(match[1].trim()))));
    } catch {
      types.push("__INVALID_JSON_LD__");
    }
  }
  return types;
}

function extractSitemapLocs(xml: string) {
  return Array.from(xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g), (match) =>
    decodeHtml(match[1].trim()),
  );
}

function extractMarkdownLinks(markdown: string) {
  return Array.from(markdown.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g), (match) =>
    decodeHtml(match[1].trim()),
  );
}

function duplicateValues(values: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }
  return Array.from(duplicates);
}

function hostFromOrigin(origin: string) {
  return new URL(origin).hostname;
}

function apexDomain(host: string) {
  const parts = host.split(".");
  return parts.length <= 2 ? host : parts.slice(-2).join(".");
}

async function delegated(host: string) {
  try {
    return await resolveNs(apexDomain(host));
  } catch {
    return [];
  }
}

async function registered(host: string) {
  const apex = apexDomain(host);
  try {
    const response = await fetch(`https://rdap.org/domain/${apex}`);
    return response.ok;
  } catch {
    return false;
  }
}

async function resolves(host: string) {
  const [a, aaaa, cname] = await Promise.allSettled([
    resolve4(host),
    resolve6(host),
    resolveCname(host),
  ]);
  const records = [
    ...(a.status === "fulfilled" ? a.value : []),
    ...(aaaa.status === "fulfilled" ? aaaa.value : []),
    ...(cname.status === "fulfilled" ? cname.value.map((target) => `CNAME ${target}`) : []),
  ];
  return records;
}

async function fetchText(
  url: string,
  userAgent = "Amend agent-ready live validator (+https://amend.sh/llms.txt)",
) {
  const response = await fetch(url, {
    headers: {
      "user-agent": userAgent,
    },
  });
  const body = await response.text();
  return { body, response };
}

async function checkDns(origin: string, label: string) {
  const host = hostFromOrigin(origin);
  const apex = apexDomain(host);
  const domainRegistered = await registered(host);
  add(`${label} apex is registered`, domainRegistered, apex);
  if (!domainRegistered) {
    blockers.add(`Register ${apex}.`);
  }
  const nameservers = await delegated(host);
  add(
    `${label} apex is delegated`,
    nameservers.length > 0,
    nameservers.length > 0 ? nameservers.join(", ") : apex,
  );
  if (nameservers.length === 0) {
    blockers.add(`Delegate ${apex} with a DNS provider.`);
  }
  const records = await resolves(host);
  add(`${label} DNS resolves`, records.length > 0, records.join(", ") || host);
  if (records.length === 0) {
    blockers.add(`Create A/AAAA or CNAME records for ${host} pointing at the ${label} deployment.`);
  }
  return records.length > 0;
}

async function checkTextEndpoint({
  allowIndexing = false,
  contentTypes,
  excludes = [],
  includes,
  label,
  path,
  parseJsonObject = false,
  origin,
  structuredDataTypes = [],
}: {
  allowIndexing?: boolean;
  contentTypes?: string[];
  excludes?: string[];
  includes: string[];
  label: string;
  origin: string;
  parseJsonObject?: boolean;
  path: string;
  structuredDataTypes?: string[];
}) {
  const url = `${origin}${path}`;
  try {
    const { body, response } = await fetchText(url);
    add(`${label} ${path} returns 2xx`, response.ok, `${response.status} ${response.statusText}`);
    const finalUrl = new URL(response.url);
    add(
      `${label} ${path} stays on expected origin`,
      finalUrl.origin === origin,
      finalUrl.toString(),
    );
    if (contentTypes) {
      const contentType = response.headers.get("content-type") ?? "";
      add(
        `${label} ${path} content-type`,
        contentTypes.some((expected) => contentType.includes(expected)),
        contentType || "missing content-type",
      );
    }
    if (allowIndexing) {
      const xRobotsTag = response.headers.get("x-robots-tag") ?? "";
      add(
        `${label} ${path} x-robots-tag allows indexing`,
        !/\b(?:noindex|none)\b/i.test(xRobotsTag),
        xRobotsTag || "not set",
      );
    }
    for (const expected of includes) {
      add(`${label} ${path} includes ${expected}`, body.includes(expected));
    }
    for (const unexpected of excludes) {
      add(`${label} ${path} excludes ${unexpected}`, !body.includes(unexpected));
    }
    if (parseJsonObject) {
      try {
        const parsed = JSON.parse(body);
        add(
          `${label} ${path} is parseable JSON object`,
          Boolean(parsed && typeof parsed === "object" && !Array.isArray(parsed)),
        );
      } catch (error) {
        add(
          `${label} ${path} is parseable JSON object`,
          false,
          error instanceof Error ? error.message : "invalid JSON",
        );
      }
    }
    if (path === "/sitemap.xml") {
      const locs = extractSitemapLocs(body);
      const duplicates = duplicateValues(locs);
      add(`${label} ${path} has sitemap loc entries`, locs.length > 0, `${locs.length} locs`);
      add(
        `${label} ${path} has no duplicate sitemap locs`,
        duplicates.length === 0,
        duplicates.join(", ") || "none",
      );
      add(
        `${label} ${path} sitemap locs stay on expected origin`,
        locs.every((loc) => loc === origin || loc.startsWith(`${origin}/`)),
      );
    }
    if (structuredDataTypes.length > 0) {
      const actualTypes = extractJsonLdTypes(body);
      add(
        `${label} ${path} has valid JSON-LD`,
        actualTypes.length > 0 && !actualTypes.includes("__INVALID_JSON_LD__"),
        actualTypes.join(", ") || "none",
      );
      for (const expectedType of structuredDataTypes) {
        add(
          `${label} ${path} JSON-LD includes ${expectedType}`,
          actualTypes.includes(expectedType),
          actualTypes.join(", ") || "none",
        );
      }
    }
  } catch (error) {
    add(
      `${label} ${path} fetches`,
      false,
      error instanceof Error ? error.message : "unknown fetch error",
    );
  }
}

async function checkAiUserAgentAccess({
  includes,
  label,
  origin,
  path,
}: {
  includes: string[];
  label: string;
  origin: string;
  path: string;
}) {
  for (const userAgent of aiAccessUserAgents) {
    const url = `${origin}${path}`;
    try {
      const { body, response } = await fetchText(url, userAgent.value);
      add(
        `${label} ${path} allows ${userAgent.name}`,
        response.ok,
        `${response.status} ${response.statusText}`,
      );
      const finalUrl = new URL(response.url);
      add(
        `${label} ${path} ${userAgent.name} stays on expected origin`,
        finalUrl.origin === origin,
        finalUrl.toString(),
      );
      const xRobotsTag = response.headers.get("x-robots-tag") ?? "";
      add(
        `${label} ${path} ${userAgent.name} x-robots-tag allows indexing`,
        !/\b(?:noindex|none)\b/i.test(xRobotsTag),
        xRobotsTag || "not set",
      );
      for (const expected of includes) {
        add(`${label} ${path} ${userAgent.name} includes ${expected}`, body.includes(expected));
      }
    } catch (error) {
      add(
        `${label} ${path} allows ${userAgent.name}`,
        false,
        error instanceof Error ? error.message : "unknown fetch error",
      );
    }
  }
}

async function checkLlmsLinksAgainstSitemaps() {
  try {
    const [webLlms, webSitemap, docsLlms, docsSitemap] = await Promise.all([
      fetchText(`${webOrigin}/llms.txt`),
      fetchText(`${webOrigin}/sitemap.xml`),
      fetchText(`${docsOrigin}/llms.txt`),
      fetchText(`${docsOrigin}/sitemap.xml`),
    ]);
    const webLlmsLinks = extractMarkdownLinks(webLlms.body);
    const docsLlmsLinks = extractMarkdownLinks(docsLlms.body);
    const webSitemapLocs = extractSitemapLocs(webSitemap.body);
    const docsSitemapLocs = extractSitemapLocs(docsSitemap.body);
    const webLlmsDuplicateLinks = duplicateValues(webLlmsLinks);
    const docsLlmsDuplicateLinks = duplicateValues(docsLlmsLinks);

    add(
      "web /llms.txt has Markdown links",
      webLlmsLinks.length > 0,
      `${webLlmsLinks.length} links`,
    );
    add(
      "web /llms.txt has no duplicate links",
      webLlmsDuplicateLinks.length === 0,
      webLlmsDuplicateLinks.join(", ") || "none",
    );
    add(
      "web /llms.txt links stay on web or docs origins",
      webLlmsLinks.every((link) => link.startsWith(webOrigin) || link.startsWith(docsOrigin)),
    );
    add(
      "web /llms.txt web links appear in web sitemap",
      webLlmsLinks
        .filter((link) => link.startsWith(webOrigin))
        .every((link) => webSitemapLocs.includes(link)),
    );
    add(
      "web /llms.txt docs links appear in docs sitemap",
      webLlmsLinks
        .filter((link) => link.startsWith(docsOrigin))
        .every((link) => docsSitemapLocs.includes(link)),
    );
    add(
      "docs /llms.txt has no duplicate links",
      docsLlmsDuplicateLinks.length === 0,
      docsLlmsDuplicateLinks.join(", ") || "none",
    );
    add(
      "docs /llms.txt relative links appear in docs sitemap",
      docsLlmsLinks.length > 0 &&
        docsLlmsLinks.every((link) => docsSitemapLocs.includes(`${docsOrigin}${link}`)),
      `${docsLlmsLinks.length} links`,
    );
  } catch (error) {
    add(
      "llms links cross-check fetches",
      false,
      error instanceof Error ? error.message : "unknown fetch error",
    );
  }
}

async function main() {
  const webDns = await checkDns(webOrigin, "web");
  const docsDns = await checkDns(docsOrigin, "docs");

  if (webDns) {
    await checkTextEndpoint({
      allowIndexing: true,
      contentTypes: ["text/plain"],
      excludes: ["Disallow:", ...aiCrawlerNames],
      includes: ["User-agent: *", "Allow: /", `Sitemap: ${webOrigin}/sitemap.xml`],
      label: "web",
      origin: webOrigin,
      path: "/robots.txt",
    });
    await checkTextEndpoint({
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
    await checkTextEndpoint({
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
    await checkTextEndpoint({
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
    await checkAiUserAgentAccess({
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
      await checkTextEndpoint({
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
    await checkTextEndpoint({
      contentTypes: ["text/html"],
      includes: ["noindex, nofollow"],
      label: "web",
      origin: webOrigin,
      path: "/sign-in",
    });
  }

  if (docsDns) {
    await checkTextEndpoint({
      allowIndexing: true,
      contentTypes: ["text/plain"],
      excludes: ["Disallow:", ...aiCrawlerNames],
      includes: ["User-agent: *", "Allow: /", `Sitemap: ${docsOrigin}/sitemap.xml`],
      label: "docs",
      origin: docsOrigin,
      path: "/robots.txt",
    });
    await checkTextEndpoint({
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
        "<lastmod>",
        "<changefreq>",
        "<priority>",
      ],
      label: "docs",
      origin: docsOrigin,
      path: "/sitemap.xml",
    });
    await checkTextEndpoint({
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
    await checkTextEndpoint({
      allowIndexing: true,
      contentTypes: ["text/plain", "text/markdown"],
      includes: ["# Quickstart", "# Integration"],
      label: "docs",
      origin: docsOrigin,
      path: "/llms-full.txt",
    });
    await checkTextEndpoint({
      allowIndexing: true,
      contentTypes: ["application/schema+json", "application/json"],
      includes: [
        '"$schema": "https://json-schema.org/draft/2020-12/schema"',
        '"$id": "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json"',
        '"$schema"',
        '"https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
        '"blockers"',
        '"checkedAt"',
        '"ok"',
        '"steps"',
        '"nextGates"',
        '"const": "bun run agent-ready:production"',
        '"const": "bun run agent-ready:final-gate"',
      ],
      label: "docs",
      origin: docsOrigin,
      parseJsonObject: true,
      path: "/schemas/agent-ready-production-report.schema.json",
    });
    await checkTextEndpoint({
      allowIndexing: true,
      contentTypes: ["application/schema+json", "application/json"],
      includes: [
        '"$schema": "https://json-schema.org/draft/2020-12/schema"',
        '"$id": "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json"',
        '"blockers"',
        '"checks"',
        '"origins"',
        '"passed"',
        '"total"',
      ],
      label: "docs",
      origin: docsOrigin,
      parseJsonObject: true,
      path: "/schemas/agent-ready-live-report.schema.json",
    });
    await checkTextEndpoint({
      allowIndexing: true,
      contentTypes: ["application/schema+json", "application/json"],
      includes: [
        '"$schema": "https://json-schema.org/draft/2020-12/schema"',
        '"$id": "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json"',
        '"blockers"',
        '"dns"',
        '"nextGates"',
        '"const": "bun run agent-ready:production"',
        '"const": "bun run agent-ready:final-gate"',
        '"productionEnv"',
      ],
      label: "docs",
      origin: docsOrigin,
      parseJsonObject: true,
      path: "/schemas/agent-ready-status-report.schema.json",
    });
    await checkTextEndpoint({
      allowIndexing: true,
      contentTypes: ["application/schema+json", "application/json"],
      includes: [
        '"$schema": "https://json-schema.org/draft/2020-12/schema"',
        '"$id": "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json"',
        '"allowProductionBlockers"',
        '"checks"',
        '"completionOk"',
        '"missingOrBlocked"',
        '"productionBlockersOnly"',
        '"summary"',
      ],
      label: "docs",
      origin: docsOrigin,
      parseJsonObject: true,
      path: "/schemas/agent-ready-completion-audit-report.schema.json",
    });
    await checkTextEndpoint({
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
        copy: "Connect Amend to your portal",
        path: "/docs/integration",
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
        copy: "Production launch checklist",
        path: "/docs/launch",
      },
    ]) {
      await checkTextEndpoint({
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
    await checkTextEndpoint({
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
    await checkAiUserAgentAccess({
      includes: ["Source-linked product updates"],
      label: "docs",
      origin: docsOrigin,
      path: "/",
    });
  }

  if (webDns && docsDns) {
    await checkLlmsLinksAgainstSitemaps();
  }

  const failed = checks.filter((check) => !check.ok);
  const report = {
    $schema: reportSchemaUrl,
    blockers: Array.from(blockers),
    checkedAt: new Date().toISOString(),
    checks,
    origins: {
      docs: docsOrigin,
      web: webOrigin,
    },
    ok: failed.length === 0,
    passed: checks.length - failed.length,
    total: checks.length,
  };

  const jsonReport = JSON.stringify(report, null, 2);
  if (jsonFile) {
    await writeFile(jsonFile, `${jsonReport}\n`);
  }
  if (jsonOutput) {
    console.log(jsonReport);
  } else {
    console.log("");
    console.log(`Agent-ready live summary: ${report.passed}/${report.total} passing.`);
    if (blockers.size > 0) {
      console.log("");
      console.log("Next external steps:");
      for (const blocker of blockers) {
        console.log(`- ${blocker}`);
      }
      console.log("- Redeploy web/docs if needed, then rerun `bun run agent-ready:live`.");
    }
  }
  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

await main();
