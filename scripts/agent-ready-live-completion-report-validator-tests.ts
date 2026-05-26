import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "bun:test";

export function registerAgentReadyLiveCompletionReportValidatorTests(root: URL) {
  test("live report validator accepts non-DNS failures without blockers", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "amend-agent-ready-live-report-"));
    const reportPath = join(tempDir, "agent-ready-live-report.json");
    try {
      await writeFile(
        reportPath,
        `${JSON.stringify(
          {
            $schema: "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json",
            blockers: [],
            checkedAt: "2026-05-14T00:00:00.000Z",
            checks: [{ detail: "404 Not Found", name: "web /llms.txt returns 2xx", ok: false }],
            ok: false,
            origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
            passed: 0,
            total: 1,
          },
          null,
          2,
        )}\n`,
      );

      const validator = Bun.spawn(
        ["bun", "scripts/agent-ready-live-report-validate.ts", reportPath],
        {
          cwd: root.pathname,
          stderr: "pipe",
          stdout: "pipe",
        },
      );
      const [exitCode, stdout, stderr] = await Promise.all([
        validator.exited,
        new Response(validator.stdout).text(),
        new Response(validator.stderr).text(),
      ]);

      expect(exitCode).toBe(0);
      expect(stdout).toContain("Valid agent-ready live report");
      expect(stderr).toBe("");
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });

  test("completion audit report validator rejects inconsistent saved reports", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "amend-agent-ready-completion-report-"));
    const reportPath = join(tempDir, "agent-ready-completion-audit-report.json");
    try {
      await writeFile(
        reportPath,
        `${JSON.stringify(
          {
            $schema:
              "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json",
            allowProductionBlockers: true,
            checkedAt: "2026-05-14T00:00:00.000Z",
            checks: [
              { name: "maximum-visibility web robots policy exists", ok: true },
              { name: "saved production report has passing live validator", ok: false },
            ],
            completionOk: true,
            missingOrBlocked: [],
            ok: true,
            productionBlockersOnly: false,
            productionReportPath: "agent-ready-production-report.json",
            summary: { failed: 0, passed: 2, total: 3 },
          },
          null,
          2,
        )}\n`,
      );

      const validator = Bun.spawn(
        ["bun", "scripts/agent-ready-completion-audit-report-validate.ts", reportPath],
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
      expect(stderr).toContain("$.summary.failed");
      expect(stderr).toContain("$.summary.passed");
      expect(stderr).toContain("$.summary.total");
      expect(stderr).toContain("$.missingOrBlocked");
      expect(stderr).toContain("$.completionOk");
      expect(stderr).toContain("$.productionBlockersOnly");
    } finally {
      await rm(tempDir, { force: true, recursive: true });
    }
  });
}
