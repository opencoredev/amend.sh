import { readFile } from "node:fs/promises";
import { aiCrawlerNames } from "./agent-ready-policy";
import { productionEnvChecks, requiredProductionEnv } from "./agent-ready-production-env";

export { aiCrawlerNames, productionEnvChecks, requiredProductionEnv };

export const strict = process.argv.includes("--strict");

export type Check = {
  detail?: string;
  name: string;
  ok: boolean;
};

export const checks: Check[] = [];

export async function read(path: string) {
  return await readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

export async function readOptional(path: string) {
  try {
    return await read(path);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

export function add(name: string, ok: boolean, detail?: string) {
  checks.push({ detail, name, ok });
  console.log(`${ok ? "PASS" : "NEEDS"} ${name}${detail ? ` - ${detail}` : ""}`);
}

export function hasMeaningfulEnv(key: string) {
  const value = process.env[key]?.trim();
  return Boolean(value && !/replace-with|example\.com|your-|placeholder/i.test(value));
}

export function hasLine(content: string, key: string) {
  return new RegExp(`^${key}=`, "m").test(content);
}

export function hasNormalizedText(content: string, text: string) {
  return content.replace(/\s+/g, " ").includes(text);
}

export const rootPackage = JSON.parse(await read("package.json")) as {
  scripts?: Record<string, string>;
};
export const turboConfig = JSON.parse(await read("turbo.json")) as {
  globalDependencies?: string[];
};
export const webPackage = JSON.parse(await read("apps/web/package.json")) as {
  scripts?: Record<string, string>;
};
export const docsPackage = JSON.parse(await read("apps/fumadocs/package.json")) as {
  scripts?: Record<string, string>;
};
export const gitignore = await read(".gitignore");
export const productionEnvExample = await read(".env.production.example");
export const webEnvExample = await read("apps/web/.env.example");
export const backendEnvExample = await read("packages/backend/.env.example");
export const backendEnvLocal = await readOptional("packages/backend/.env.local");
export const readme = await read("README.md");
export const completionAudit = await read("docs/completion-audit.md");
export const productionReadiness = await read("docs/production-readiness.md");
export const agentReadyAudit = await read("docs/agent-ready-audit.md");
export const agentReadyDomainSetup = await read("docs/agent-ready-domain-setup.md");
export const agentReadyProductionReportSchema = await read(
  "docs/agent-ready-production-report.schema.json",
);
export const agentReadyLiveReportSchema = await read("docs/agent-ready-live-report.schema.json");
export const agentReadyStatusReportSchema = await read(
  "docs/agent-ready-status-report.schema.json",
);
export const agentReadyCompletionAuditReportSchema = await read(
  "docs/agent-ready-completion-audit-report.schema.json",
);
export const agentReadyPolicy = await read("scripts/agent-ready-policy.ts");
const integrationGuidePaths = [
  "docs/integration.md",
  "docs/integration-source-events.md",
  "docs/integration-customer-surfaces.md",
  "docs/integration-automation-ops.md",
];
export const integrationGuide = (
  await Promise.all(integrationGuidePaths.map((path) => read(path)))
).join("\n");
export const launchRunbook = await read("docs/launch-runbook.md");
export const agentReadyBuilt = [
  await read("scripts/agent-ready-built.ts"),
  await read("scripts/agent-ready-built-web.ts"),
  await read("scripts/agent-ready-built-docs.ts"),
  await read("scripts/agent-ready-built-docs-artifacts.ts"),
  await read("scripts/agent-ready-built-docs-core-checks.ts"),
  await read("scripts/agent-ready-built-docs-page-checks.ts"),
  await read("scripts/agent-ready-built-docs-schema-checks.ts"),
  await read("scripts/agent-ready-built-utils.ts"),
].join("\n");
export const agentReadyLive = [
  await read("scripts/agent-ready-live.ts"),
  await read("scripts/agent-ready-live-surfaces.ts"),
  await read("scripts/agent-ready-live-web-surface.ts"),
  await read("scripts/agent-ready-live-docs-surface.ts"),
  await read("scripts/agent-ready-live-docs-schemas.ts"),
  await read("scripts/agent-ready-live-surface-utils.ts"),
  await read("scripts/agent-ready-live-checks.ts"),
  await read("scripts/agent-ready-live-dns.ts"),
  await read("scripts/agent-ready-live-fetch-checks.ts"),
  await read("scripts/agent-ready-live-fetch-client.ts"),
  await read("scripts/agent-ready-live-text-endpoint-checks.ts"),
  await read("scripts/agent-ready-live-ai-access-checks.ts"),
  await read("scripts/agent-ready-live-llms-cross-checks.ts"),
  await read("scripts/agent-ready-live-parsing.ts"),
  await read("scripts/agent-ready-live-types.ts"),
].join("\n");
export const agentReadyProduction = await read("scripts/agent-ready-production.ts");
export const agentReadyRefreshReport = await read("scripts/agent-ready-refresh-report.ts");
export const agentReadyCompletionAudit = [
  await read("scripts/agent-ready-completion-audit.ts"),
  await read("scripts/agent-ready-completion-audit-args.ts"),
  await read("scripts/agent-ready-completion-audit-artifact-checks.ts"),
  await read("scripts/agent-ready-completion-audit-artifact-types.ts"),
  await read("scripts/agent-ready-completion-audit-crawler-artifact-checks.ts"),
  await read("scripts/agent-ready-completion-audit-docs-artifact-checks.ts"),
  await read("scripts/agent-ready-completion-audit-production-artifact-checks.ts"),
  await read("scripts/agent-ready-completion-audit-context-files.ts"),
  await read("scripts/agent-ready-completion-audit-context-types.ts"),
  await read("scripts/agent-ready-completion-audit-helpers.ts"),
  await read("scripts/agent-ready-completion-audit-runner.ts"),
  await read("scripts/agent-ready-completion-audit-context.ts"),
].join("\n");
export const agentReadyCompletionAuditReportValidate = [
  await read("scripts/agent-ready-completion-audit-report-validate.ts"),
  await read("scripts/agent-ready-completion-audit-report-validator-core.ts"),
].join("\n");
export const agentReadyLiveReportValidate = await read(
  "scripts/agent-ready-live-report-validate.ts",
);
export const agentReadyStatusReportValidate = await read(
  "scripts/agent-ready-status-report-validate.ts",
);
export const agentReadySyncAudit = await read("scripts/agent-ready-sync-audit.ts");
export const agentReadyProductionReportValidate = [
  await read("scripts/agent-ready-production-report-validate.ts"),
  await read("scripts/agent-ready-production-report-validator-core.ts"),
  await read("scripts/agent-ready-embedded-report-validators.ts"),
  await read("scripts/report-validator-utils.ts"),
].join("\n");
export const agentReadyStatus = await read("scripts/agent-ready-status.ts");
export const agentReadyTest = [
  await read("scripts/agent-ready.test.ts"),
  await read("scripts/agent-ready-core-tests.ts"),
  await read("scripts/agent-ready-web-surface-tests.ts"),
  await read("scripts/agent-ready-docs-surface-tests.ts"),
].join("\n");
export const webRobots = await read("apps/web/public/robots.txt");
export const webSitemap = await read("apps/web/public/sitemap.xml");
export const webLlms = await read("apps/web/public/llms.txt");
export const webSeo = await read("apps/web/src/lib/seo.ts");
export const docsRobotsRoute = await read("apps/fumadocs/src/app/robots.txt/route.ts");
export const docsSitemapRoute = await read("apps/fumadocs/src/app/sitemap.xml/route.ts");
export const docsLlmsRoute = await read("apps/fumadocs/src/app/llms.txt/route.ts");
export const docsLlmsFullRoute = await read("apps/fumadocs/src/app/llms-full.txt/route.ts");
export const docsProductionReportSchemaRoute = await read(
  "apps/fumadocs/src/app/schemas/agent-ready-production-report.schema.json/route.ts",
);
export const docsLiveReportSchemaRoute = await read(
  "apps/fumadocs/src/app/schemas/agent-ready-live-report.schema.json/route.ts",
);
export const docsStatusReportSchemaRoute = await read(
  "apps/fumadocs/src/app/schemas/agent-ready-status-report.schema.json/route.ts",
);
export const docsCompletionAuditReportSchemaRoute = await read(
  "apps/fumadocs/src/app/schemas/agent-ready-completion-audit-report.schema.json/route.ts",
);
export const docsLaunchPage = await read("apps/fumadocs/content/docs/launch.mdx");
export const docsHomeRoute = await read("apps/fumadocs/src/app/(home)/page.tsx");
export const docsPageRoute = await read("apps/fumadocs/src/app/docs/[[...slug]]/page.tsx");
