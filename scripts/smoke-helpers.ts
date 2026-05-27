import { readFile } from "node:fs/promises";
import { basename } from "node:path";

export const WEB_URL = process.env.AMEND_WEB_URL ?? `http://${localWorktreeName()}.localhost:1355`;
export const API_BASE_URL = process.env.AMEND_API_BASE_URL ?? "http://127.0.0.1:3211/api/v1";
const integrationDocPaths = [
  "docs/integration.md",
  "docs/integration-source-events.md",
  "docs/integration-customer-surfaces.md",
  "docs/integration-automation-ops.md",
];

const sdkSourcePaths = [
  "packages/sdk/src/index.ts",
  "packages/sdk/src/feedback-client.ts",
  "packages/sdk/src/workspace-client.ts",
  "packages/sdk/src/agent-client.ts",
  "packages/sdk/src/embed.ts",
  "packages/sdk/src/embed-data.ts",
  "packages/sdk/src/embed-panel.ts",
  "packages/sdk/src/embed-template.ts",
  "packages/sdk/src/embed-types.ts",
];

type SmokeResult = {
  detail?: string;
  name: string;
};

export const checks: SmokeResult[] = [];

export async function check(name: string, run: () => Promise<string | void> | string | void) {
  try {
    const detail = await run();
    checks.push({ detail: detail || undefined, name });
    console.log(`PASS ${name}${detail ? ` - ${detail}` : ""}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

export async function read(path: string) {
  return await readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

export async function readIntegrationDocs() {
  const docs = await Promise.all(integrationDocPaths.map((path) => read(path)));
  return docs.join("\n");
}

export async function readSdkSource() {
  const files = await Promise.all(sdkSourcePaths.map((path) => read(path)));
  return files.join("\n");
}

export async function readSdkEmbedSource() {
  const files = await Promise.all(
    sdkSourcePaths.filter((path) => path.includes("/embed")).map((path) => read(path)),
  );
  return files.join("\n");
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertIncludes(content: string, needle: string, label: string) {
  assert(content.includes(needle), `${label} is missing '${needle}'`);
}

export async function fetchText(url: string) {
  const response = await fetch(url);
  assert(response.ok, `${url} returned ${response.status}`);
  return await response.text();
}

export function finishSmoke() {
  if (process.exitCode) {
    console.error("Smoke failed. Start `bun dev` and retry if runtime checks could not connect.");
    process.exit(process.exitCode);
  }

  console.log(`Smoke complete: ${checks.length} checks passed.`);
}

function localWorktreeName() {
  return sanitizeLocalhostPart(process.env.WORKTREE_NAME ?? basename(process.cwd()));
}

function sanitizeLocalhostPart(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .slice(0, 48)
      .replace(/^-+|-+$/g, "") || "amend"
  );
}
