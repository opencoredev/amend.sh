import { readFile } from "node:fs/promises";
import { describe } from "bun:test";
import { registerAgentReadyCoreTests } from "./agent-ready-core-tests";
import { registerAgentReadyDocsSurfaceTests } from "./agent-ready-docs-surface-tests";
import { registerAgentReadyReportTests } from "./agent-ready-report-tests";
import { registerAgentReadyWebSurfaceTests } from "./agent-ready-web-surface-tests";

const root = new URL("../", import.meta.url);

async function read(path: string) {
  return await readFile(new URL(path, root), "utf8");
}

describe("Agent-ready public surfaces", () => {
  registerAgentReadyCoreTests();
  registerAgentReadyWebSurfaceTests(read);
  registerAgentReadyDocsSurfaceTests(read);
  registerAgentReadyReportTests(read, root);
});
