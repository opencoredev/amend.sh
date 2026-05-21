import { readFile, writeFile } from "node:fs/promises";
import { aiCrawlerNames } from "./agent-ready-policy";

type Check = {
  detail?: string;
  name: string;
  ok: boolean;
};

type ProductionReport = {
  blockers?: unknown;
  ok?: unknown;
  steps?: {
    built?: {
      ok?: unknown;
      summary?: {
        passed?: unknown;
        total?: unknown;
      };
    };
    live?: {
      ok?: unknown;
      report?: {
        blockers?: unknown;
        checks?: unknown;
        ok?: unknown;
        passed?: unknown;
        total?: unknown;
      };
    };
    readinessStrict?: {
      ok?: unknown;
    };
    status?: {
      ok?: unknown;
      report?: {
        ok?: unknown;
        productionEnv?: {
          missing?: unknown;
          passed?: unknown;
          total?: unknown;
        };
      };
    };
  };
};

const checks: Check[] = [];
const allowProductionBlockers = process.argv.includes("--allow-production-blockers");
const jsonOutput = process.argv.includes("--json");
const jsonFileFlagIndex = process.argv.indexOf("--json-file");
const jsonFile = jsonFileFlagIndex >= 0 ? process.argv[jsonFileFlagIndex + 1] : undefined;
const reportSchemaUrl =
  "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json";
if (jsonFileFlagIndex >= 0 && !jsonFile) {
  throw new Error("Missing path after --json-file.");
}
const reportPath =
  process.argv.find(
    (arg, index) =>
      index > 1 &&
      !arg.startsWith("--") &&
      arg !== "agent-ready:completion-audit" &&
      index !== jsonFileFlagIndex + 1,
  ) ?? "agent-ready-production-report.json";
const productionBlockerCheckNames = new Set([
  "saved production report has passing strict readiness",
  "saved production report has all production env loaded",
  "saved production report has passing live validator",
  "saved production report is complete and blocker-free",
]);

async function read(path: string) {
  return await readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

function add(name: string, ok: boolean, detail?: string) {
  checks.push({ detail, name, ok });
  if (!jsonOutput) {
    console.log(`${ok ? "PASS" : "NEEDS"} ${name}${detail ? ` - ${detail}` : ""}`);
  }
}

function includesAll(content: string, values: string[]) {
  return values.every((value) => content.includes(value));
}

function excludesAll(content: string, values: string[]) {
  return values.every((value) => !content.includes(value));
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

const [
  packageJson,
  webRobots,
  webSitemap,
  webLlms,
  webSeo,
  webIndexRoute,
  webBrandRoute,
  webEmbedDemoRoute,
  webPortalRoute,
  docsRobotsRoute,
  docsSitemapRoute,
  docsLlmsRoute,
  docsLlmsFullRoute,
  docsMarkdownRoute,
  docsLayoutRoute,
  docsHomeRoute,
  docsPageRoute,
  builtValidator,
  liveValidator,
  productionEnvContract,
  productionReporter,
  statusReporter,
  finalGate,
  liveReportValidator,
  completionReportValidator,
  productionEnvExample,
  launchRunbook,
  docsLaunchPage,
  agentReadyAudit,
  completionAudit,
  productionReportContent,
] = await Promise.all([
  read("package.json"),
  read("apps/web/public/robots.txt"),
  read("apps/web/public/sitemap.xml"),
  read("apps/web/public/llms.txt"),
  read("apps/web/src/lib/seo.ts"),
  read("apps/web/src/routes/index.tsx"),
  read("apps/web/src/routes/brand.tsx"),
  read("apps/web/src/routes/embed-demo.tsx"),
  read("apps/web/src/routes/portal.$workspaceSlug.tsx"),
  read("apps/fumadocs/src/app/robots.txt/route.ts"),
  read("apps/fumadocs/src/app/sitemap.xml/route.ts"),
  read("apps/fumadocs/src/app/llms.txt/route.ts"),
  read("apps/fumadocs/src/app/llms-full.txt/route.ts"),
  read("apps/fumadocs/src/app/llms.mdx/docs/[[...slug]]/route.ts"),
  read("apps/fumadocs/src/app/layout.tsx"),
  read("apps/fumadocs/src/app/(home)/page.tsx"),
  read("apps/fumadocs/src/app/docs/[[...slug]]/page.tsx"),
  read("scripts/agent-ready-built.ts"),
  read("scripts/agent-ready-live.ts"),
  read("scripts/agent-ready-production-env.ts"),
  read("scripts/agent-ready-production.ts"),
  read("scripts/agent-ready-status.ts"),
  read("scripts/agent-ready-final-gate.ts"),
  read("scripts/agent-ready-live-report-validate.ts"),
  read("scripts/agent-ready-completion-audit-report-validate.ts"),
  read(".env.production.example"),
  read("docs/launch-runbook.md"),
  read("apps/fumadocs/content/docs/launch.mdx"),
  read("docs/agent-ready-audit.md"),
  read("docs/completion-audit.md"),
  readFile(reportPath, "utf8"),
]);

const rootPackage = JSON.parse(packageJson) as { scripts?: Record<string, string> };
const productionReport = JSON.parse(productionReportContent) as ProductionReport;
const builtPassed = productionReport.steps?.built?.summary?.passed;
const builtTotal = productionReport.steps?.built?.summary?.total;
const livePassed = productionReport.steps?.live?.report?.passed;
const liveTotal = productionReport.steps?.live?.report?.total;
const envMissing = productionReport.steps?.status?.report?.productionEnv?.missing;
const blockers = productionReport.blockers;

if (!jsonOutput) {
  console.log("Agent-ready completion audit");
  console.log(`Report: ${reportPath}`);
  console.log("");
}

add(
  "maximum-visibility web robots policy exists",
  includesAll(webRobots, ["User-agent: *", "Allow: /", "Sitemap: https://amend.sh/sitemap.xml"]) &&
    excludesAll(webRobots, ["Disallow:", ...aiCrawlerNames]),
);
add(
  "maximum-visibility docs robots policy exists",
  includesAll(docsRobotsRoute, ["docsUrl", "User-agent: *", "Allow: /", "/sitemap.xml"]) &&
    excludesAll(docsRobotsRoute, ["Disallow:", ...aiCrawlerNames]),
);
add(
  "canonical web sitemap names public routes",
  includesAll(webSitemap, [
    "https://amend.sh/",
    "https://amend.sh/brand",
    "https://amend.sh/embed-demo",
    "https://amend.sh/portal/amend-labs",
    "<lastmod>",
    "<changefreq>",
    "<priority>",
  ]) && excludesAll(webSitemap, ["/dashboard", "/sign-in", "/sign-up", "/api/auth"]),
);
add(
  "canonical docs sitemap is generated from docs pages",
  includesAll(docsSitemapRoute, [
    "https://docs.amend.sh",
    "source.getPages()",
    "/schemas/agent-ready-production-report.schema.json",
    "/schemas/agent-ready-live-report.schema.json",
    "/schemas/agent-ready-status-report.schema.json",
    "/schemas/agent-ready-completion-audit-report.schema.json",
    "lastmod",
    "changefreq",
    "priority",
  ]),
);
add(
  "web llms.txt maps web and docs resources",
  includesAll(webLlms, [
    "https://amend.sh/",
    "https://amend.sh/brand",
    "https://amend.sh/embed-demo",
    "https://amend.sh/portal/amend-labs",
    "https://docs.amend.sh/docs",
    "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json",
    "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json",
    "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json",
  ]),
);
add(
  "docs llms resources and Markdown mirrors exist",
  includesAll(docsLlmsRoute, [
    "llms(source)",
    "Agent-ready production report JSON Schema",
    "Agent-ready live report JSON Schema",
    "Agent-ready status report JSON Schema",
    "Agent-ready completion audit report JSON Schema",
  ]) &&
    docsLlmsRoute.includes("/schemas/agent-ready-production-report.schema.json") &&
    docsLlmsRoute.includes("/schemas/agent-ready-live-report.schema.json") &&
    docsLlmsRoute.includes("/schemas/agent-ready-status-report.schema.json") &&
    docsLlmsRoute.includes("/schemas/agent-ready-completion-audit-report.schema.json") &&
    includesAll(docsLlmsFullRoute, ["source.getPages()", "getLLMText"]) &&
    docsMarkdownRoute.includes("text/markdown"),
);
add(
  "canonical and social metadata are wired for web and docs",
  includesAll(webSeo, ["canonicalLink", "openGraphMeta", "twitter:card"]) &&
    [webIndexRoute, webBrandRoute, webEmbedDemoRoute, webPortalRoute].every((route) =>
      route.includes("canonicalLink"),
    ) &&
    includesAll(docsLayoutRoute, ["metadataBase", "https://docs.amend.sh", "openGraph"]) &&
    includesAll(docsHomeRoute, ["canonical", "openGraph"]) &&
    includesAll(docsPageRoute, ["canonical", "openGraph"]),
);
add(
  "structured data is wired for web and docs",
  includesAll(webSeo, ["SoftwareApplication", "Organization"]) &&
    webIndexRoute.includes("application/ld+json") &&
    includesAll(docsHomeRoute, ['"@type": "WebSite"', '"@type": "Organization"']) &&
    docsPageRoute.includes('"@type": "TechArticle"'),
);
add(
  "crawlable public content is verified by build validator",
  includesAll(builtValidator, [
    "webPublicPages",
    "built web route bundle exposes crawlable copy",
    "built docs HTML exposes",
    "built docs Markdown mirror exposes",
    "isParseableJsonObject",
  ]),
);
add(
  "live validator covers production fetch, metadata, schema, noindex, and AI user agents",
  includesAll(liveValidator, [
    "checkAiUserAgentAccess",
    "has valid JSON-LD",
    "stays on expected origin",
    "x-robots-tag allows indexing",
    "noindex, nofollow",
    "checkLlmsLinksAgainstSitemaps",
    "parseJsonObject",
    "is parseable JSON object",
  ]),
);
add(
  "production report command preserves strict readiness, built, status, and live gates",
  includesAll(productionReporter, ["readinessStrict", "built", "status", "live", "blockersFrom"]),
);
add(
  "production env contract is shared by strict readiness and status",
  includesAll(productionEnvContract, [
    "productionEnvChecks",
    "requiredProductionEnv",
    "webProductionEnvKeys",
    "VITE_CONVEX_URL",
    "STRIPE_WEBHOOK_SECRET",
  ]) &&
    includesAll(statusReporter, [
      "./agent-ready-production-env",
      "requiredProductionEnv",
      "productionEnv",
    ]),
);
add(
  "production launch handoff uses Amend.sh origins",
  includesAll(productionEnvExample, [
    "VITE_DOCS_URL=https://docs.amend.sh/docs",
    "SITE_URL=https://amend.sh",
    "EMAIL_FROM=Amend <updates@amend.sh>",
  ]) &&
    includesAll(launchRunbook, [
      'bunx convex env set SITE_URL "https://amend.sh"',
      'bunx convex env set EMAIL_FROM "Amend <updates@amend.sh>"',
      "VITE_DOCS_URL=https://docs.amend.sh/docs",
    ]) &&
    includesAll(docsLaunchPage, [
      "bunx convex env set SITE_URL https://amend.sh",
      "https://amend.sh/portal/acme",
      "https://docs.amend.sh/docs",
    ]) &&
    excludesAll(productionEnvExample, ["SITE_URL=https://updates.example.com"]) &&
    !launchRunbook.includes('bunx convex env set SITE_URL "https://updates.example.com"') &&
    !docsLaunchPage.includes("bunx convex env set SITE_URL https://updates.example.com"),
);
add(
  "completion docs map prompt requirements to artifacts",
  includesAll(agentReadyAudit, [
    "Prompt-To-Artifact Checklist",
    "Maximum-visibility",
    "Crawlable content",
    "Live production validator",
  ]) &&
    includesAll(completionAudit, [
      "Agent-Ready Objective Checklist",
      "Public production validation",
      "Blocked externally",
    ]),
);
add(
  "package exposes completion audit and production gates",
  rootPackage.scripts?.["agent-ready:completion-audit"] ===
    "bun scripts/agent-ready-completion-audit.ts" &&
    rootPackage.scripts?.["agent-ready:completion-audit:validate-report"] ===
      "bun scripts/agent-ready-completion-audit-report-validate.ts" &&
    rootPackage.scripts?.["agent-ready:live:validate-report"] ===
      "bun scripts/agent-ready-live-report-validate.ts" &&
    rootPackage.scripts?.["agent-ready:status:validate-report"] ===
      "bun scripts/agent-ready-status-report-validate.ts" &&
    rootPackage.scripts?.["agent-ready:production"] ===
      "bun run readiness:strict && bun run agent-ready:built && bun run agent-ready:live" &&
    rootPackage.scripts?.["agent-ready:refresh-report"] ===
      "bun scripts/agent-ready-refresh-report.ts" &&
    rootPackage.scripts?.["agent-ready:final-gate"] === "bun scripts/agent-ready-final-gate.ts" &&
    rootPackage.scripts?.["agent-ready:audit:check"] ===
      "bun run agent-ready:production:validate-report agent-ready-production-report.json && bun run agent-ready:live:validate-report agent-ready-live-report.json && bun run agent-ready:status:validate-report agent-ready-status.json && bun run agent-ready:completion-audit:validate-report agent-ready-completion-audit-report.json && bun run agent-ready:sync-audit:check agent-ready-production-report.json" &&
    includesAll(finalGate, [
      "Generate strict production report",
      "Generate standalone live report",
      "Validate live report",
      "Run strict completion audit",
      "Require production report to be green",
      "Require live report to be green",
      "Require status report to be green",
      "Require completion audit report to be green",
      "--require-ok",
      "Agent-ready final gate passed",
    ]) &&
    includesAll(liveReportValidator, [
      "agent-ready-live-report.json",
      "reportSchemaUrl",
      "$.$schema",
      "--require-ok",
      "validateConsistency",
      "must equal the number of passing checks",
      "Valid agent-ready live report",
    ]) &&
    includesAll(completionReportValidator, [
      "agent-ready-completion-audit-report.json",
      "validateReportConsistency",
      "must equal completionOk or allowed production blockers",
      "Valid agent-ready completion audit report",
    ]),
);
add(
  "saved production report has passing built artifact validation",
  productionReport.steps?.built?.ok === true &&
    isNumber(builtPassed) &&
    isNumber(builtTotal) &&
    builtPassed === builtTotal,
  isNumber(builtPassed) && isNumber(builtTotal) ? `${builtPassed}/${builtTotal}` : undefined,
);
add(
  "saved production report has passing strict readiness",
  productionReport.steps?.readinessStrict?.ok === true,
);
add(
  "saved production report has all production env loaded",
  productionReport.steps?.status?.ok === true &&
    productionReport.steps.status.report?.ok === true &&
    isStringArray(envMissing) &&
    envMissing.length === 0,
  isStringArray(envMissing) ? `${envMissing.length} missing` : undefined,
);
add(
  "saved production report has passing live validator",
  productionReport.steps?.live?.ok === true &&
    productionReport.steps.live.report?.ok === true &&
    isNumber(livePassed) &&
    isNumber(liveTotal) &&
    livePassed === liveTotal,
  isNumber(livePassed) && isNumber(liveTotal) ? `${livePassed}/${liveTotal}` : undefined,
);
add(
  "saved production report is complete and blocker-free",
  productionReport.ok === true && isStringArray(blockers) && blockers.length === 0,
  isStringArray(blockers) ? `${blockers.length} blockers` : undefined,
);

const failed = checks.filter((check) => !check.ok);
const nonProductionFailures = failed.filter(
  (check) => !productionBlockerCheckNames.has(check.name),
);
const completionOk = failed.length === 0;
const productionBlockersOnly = failed.length > 0 && nonProductionFailures.length === 0;
const ok = completionOk || (allowProductionBlockers && productionBlockersOnly);
const summary = {
  failed: failed.length,
  passed: checks.length - failed.length,
  total: checks.length,
};
const result = {
  $schema: reportSchemaUrl,
  allowProductionBlockers,
  checkedAt: new Date().toISOString(),
  checks,
  completionOk,
  missingOrBlocked: failed,
  ok,
  productionBlockersOnly,
  productionReportPath: reportPath,
  summary,
};

if (jsonFile) {
  await writeFile(jsonFile, `${JSON.stringify(result, null, 2)}\n`);
}

if (jsonOutput) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log("");
  console.log(`Completion audit summary: ${summary.passed}/${summary.total} passing.`);
}

if (failed.length > 0 && !jsonOutput) {
  console.log("");
  console.log("Missing or blocked requirements:");
  for (const check of failed) {
    console.log(`- ${check.name}${check.detail ? ` (${check.detail})` : ""}`);
  }
  if (allowProductionBlockers && productionBlockersOnly) {
    console.log("");
    console.log("Only external production blockers remain.");
  }
}

if (!ok) {
  process.exitCode = 1;
}
