import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "bun:test";

type ReadProjectFile = (path: string) => Promise<string>;

export function registerAgentReadyStatusReportValidatorTests(read: ReadProjectFile, root: URL) {
  test("status helper summarizes production blockers without secrets", async () => {
    const rootPackage = JSON.parse(await read("package.json")) as {
      scripts?: Record<string, string>;
    };
    const statusHelper = await read("scripts/agent-ready-status.ts");
    const productionEnvContract = await read("scripts/agent-ready-production-env.ts");
    const productionEnvExample = await read(".env.production.example");

    expect(rootPackage.scripts?.["agent-ready:status"]).toBe("bun scripts/agent-ready-status.ts");
    expect(rootPackage.scripts?.["agent-ready:status:json"]).toBe(
      "bun scripts/agent-ready-status.ts --json",
    );
    for (const key of [
      "VITE_CONVEX_URL",
      "VITE_CONVEX_SITE_URL",
      "SITE_URL",
      "BETTER_AUTH_SECRET",
      "GITHUB_WEBHOOK_SECRET",
      "GITHUB_APP_ID",
      "GITHUB_APP_SLUG",
      "GITHUB_APP_CLIENT_ID",
      "GITHUB_APP_CLIENT_SECRET",
      "GITHUB_APP_PRIVATE_KEY",
      "AMEND_API_TOKEN",
      "OPENAI_API_KEY",
      "OPENAI_MODEL",
      "CROF_API_KEY",
      "CROF_MODEL",
      "CROF_BASE_URL",
      "RESEND_API_KEY",
      "EMAIL_FROM",
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
    ]) {
      expect(productionEnvContract).toContain(`"${key}"`);
      expect(productionEnvExample).toContain(`${key}=`);
    }
    expect(statusHelper).toContain(
      'import { requiredProductionEnv } from "./agent-ready-production-env"',
    );

    for (const expected of [
      "https://rdap.org/domain/",
      "resolveNs",
      "resolve4",
      "resolve6",
      "resolveCname",
      "registered=",
      "delegated=",
      "records=",
      "productionEnv",
      "nextGates",
      "checkedAt",
      "blockers",
      "Blockers:",
      "new Set<string>",
      "Load ${missingEnv.length} missing production environment values.",
      "Register ${apex}.",
      "Delegate ${apex} with a DNS provider.",
      "Create A/AAAA or CNAME records for ${status.host} pointing at the ${label} deployment.",
      "--json",
      "--json-file",
      "writeFile",
      "missing env:",
      "bun run agent-ready:production",
      "bun run agent-ready:final-gate",
      'webOrigin = process.env.AMEND_WEB_ORIGIN ?? "https://amend.sh"',
      'docsOrigin = process.env.AMEND_DOCS_ORIGIN ?? "https://docs.amend.sh"',
    ]) {
      expect(statusHelper).toContain(expected);
    }
    expect(statusHelper).not.toContain("console.log(process.env");
  });

  test("status report validator requires clean env and DNS when requested", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "amend-agent-ready-status-report-"));
    const reportPath = join(tempDir, "agent-ready-status.json");
    try {
      await writeFile(
        reportPath,
        `${JSON.stringify(
          {
            $schema: "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json",
            blockers: [
              "Load 1 missing production environment values.",
              "Create A/AAAA or CNAME records for docs.amend.sh pointing at the docs deployment.",
            ],
            checkedAt: "2026-05-14T00:00:00.000Z",
            dns: {
              docs: {
                delegated: true,
                host: "docs.amend.sh",
                records: [],
                registered: true,
              },
              web: {
                delegated: true,
                host: "amend.sh",
                records: ["A 203.0.113.10"],
                registered: true,
              },
            },
            nextGates: ["bun run agent-ready:production", "bun run agent-ready:final-gate"],
            ok: false,
            origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
            productionEnv: { missing: ["SITE_URL"], passed: 19, total: 20 },
          },
          null,
          2,
        )}\n`,
      );

      const validator = Bun.spawn(
        ["bun", "scripts/agent-ready-status-report-validate.ts", reportPath, "--require-ok"],
        {
          cwd: root.pathname,
          stderr: "pipe",
          stdout: "pipe",
        },
      );
      const [exitCode, stderr] = await Promise.all([
        validator.exited,
        new Response(validator.stderr).text(),
      ]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("$.ok");
      expect(stderr).toContain("$.blockers");
      expect(stderr).toContain("$.productionEnv.missing");
      expect(stderr).toContain("$.productionEnv.passed");
      expect(stderr).toContain("$.dns.docs.records");
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });
}
