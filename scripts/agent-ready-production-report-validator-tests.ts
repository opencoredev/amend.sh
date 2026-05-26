import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "bun:test";

export function registerAgentReadyProductionReportValidatorTests(root: URL) {
  test("production report validator requires every strict launch step to pass", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "amend-agent-ready-report-"));
    const reportPath = join(tempDir, "agent-ready-production-report.json");
    try {
      await writeFile(
        reportPath,
        `${JSON.stringify(
          {
            $schema: "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json",
            blockers: [],
            checkedAt: "2026-05-14T00:00:00.000Z",
            ok: true,
            steps: {
              built: { exitCode: 0, ok: true, summary: { passed: 37, total: 37 } },
              live: {
                exitCode: 1,
                ok: false,
                report: {
                  blockers: ["Create A/AAAA or CNAME records for amend.sh."],
                  checks: [{ name: "web DNS resolves", ok: false }],
                  ok: false,
                  passed: 0,
                  total: 1,
                },
              },
              readinessStrict: { exitCode: 0, ok: true, summary: { passed: 136, total: 136 } },
              status: {
                exitCode: 0,
                ok: true,
                report: {
                  $schema: "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json",
                  blockers: [],
                  checkedAt: "2026-05-14T00:00:00.000Z",
                  dns: {
                    docs: {
                      delegated: true,
                      host: "docs.amend.sh",
                      records: ["CNAME docs.example.com"],
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
                  ok: true,
                  origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
                  productionEnv: { missing: [], passed: 20, total: 20 },
                },
              },
            },
          },
          null,
          2,
        )}\n`,
      );

      const validator = Bun.spawn(
        ["bun", "scripts/agent-ready-production-report-validate.ts", reportPath, "--require-ok"],
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
      expect(stderr).toContain("$.steps.live.ok");
      expect(stderr).toContain("$.steps.live.report.ok");
      expect(stderr).toContain("$.steps.live.report.blockers");
      expect(stderr).toContain("$.steps.live.report.passed");
      expect(stderr).toContain("$.steps.live.report.checks[0].ok");
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });

  test("production report validator rejects inconsistent saved reports", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "amend-agent-ready-report-"));
    const reportPath = join(tempDir, "agent-ready-production-report.json");
    try {
      await writeFile(
        reportPath,
        `${JSON.stringify(
          {
            $schema: "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json",
            blockers: [],
            checkedAt: "2026-05-14T00:00:00.000Z",
            ok: true,
            steps: {
              built: { exitCode: 0, ok: true, summary: { passed: 37, total: 37 } },
              live: {
                exitCode: 1,
                ok: true,
                report: {
                  $schema: "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json",
                  blockers: [],
                  checkedAt: "2026-05-14T00:00:00.000Z",
                  checks: [{ name: "web DNS resolves", ok: true }],
                  ok: true,
                  origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
                  passed: 2,
                  total: 1,
                },
              },
              readinessStrict: { exitCode: 0, ok: true, summary: { passed: 136, total: 136 } },
              status: {
                exitCode: 0,
                ok: true,
                report: {
                  blockers: [],
                  checkedAt: "2026-05-14T00:00:00.000Z",
                  dns: {
                    docs: {
                      delegated: true,
                      host: "docs.amend.sh",
                      records: ["CNAME docs.example.com"],
                      registered: true,
                    },
                    web: {
                      delegated: true,
                      host: "amend.sh",
                      records: ["203.0.113.10"],
                      registered: true,
                    },
                  },
                  nextGates: ["bun run agent-ready:production", "bun run agent-ready:final-gate"],
                  ok: true,
                  origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
                  productionEnv: { missing: [], passed: 20, total: 20 },
                },
              },
            },
          },
          null,
          2,
        )}\n`,
      );

      const validator = Bun.spawn(
        ["bun", "scripts/agent-ready-production-report-validate.ts", reportPath],
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
      expect(stderr).toContain("$.steps.live.ok");
      expect(stderr).toContain("must equal whether exitCode is zero");
      expect(stderr).toContain("$.steps.live.report.passed");
      expect(stderr).toContain("must not exceed total");
      expect(stderr).toContain("must equal the number of passing checks");
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });
}
