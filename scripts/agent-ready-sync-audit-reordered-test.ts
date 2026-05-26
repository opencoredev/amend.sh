import { writeFile } from "node:fs/promises";
import { expect, test } from "bun:test";
import {
  runSyncAudit,
  withSyncAuditFixture,
  writeSyncAuditJson,
  writeSyncAuditMarkdown,
} from "./agent-ready-sync-audit-test-utils";

export function registerSyncAuditReorderedTest(root: URL) {
  test("sync audit accepts reordered standalone live report keys", async () => {
    await withSyncAuditFixture(async (paths) => {
      const embeddedLiveReport = {
        $schema: "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json",
        blockers: [],
        checkedAt: "2026-05-14T00:00:00.000Z",
        checks: [{ detail: "200 OK", name: "web /llms.txt returns 2xx", ok: true }],
        origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
        ok: true,
        passed: 1,
        total: 1,
      };

      await writeSyncAuditJson(paths.productionReportPath, {
        $schema: "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json",
        blockers: [],
        checkedAt: "2026-05-14T00:00:02.000Z",
        ok: true,
        steps: {
          built: { exitCode: 0, ok: true, summary: { passed: 45, total: 45 } },
          live: { exitCode: 0, ok: true, report: embeddedLiveReport },
          readinessStrict: { exitCode: 0, ok: true, summary: { passed: 150, total: 150 } },
          status: {
            exitCode: 0,
            ok: true,
            report: {
              $schema: "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json",
              blockers: [],
              checkedAt: "2026-05-14T00:00:01.000Z",
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
              productionEnv: { missing: [], passed: 21, total: 21 },
            },
          },
        },
      });
      await writeSyncAuditJson(paths.liveReportPath, {
        total: 1,
        passed: 1,
        origins: { web: "https://amend.sh", docs: "https://docs.amend.sh" },
        ok: true,
        checks: [{ ok: true, name: "web /llms.txt returns 2xx", detail: "200 OK" }],
        checkedAt: "2026-05-14T00:00:03.000Z",
        blockers: [],
        $schema: "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json",
      });
      await writeFile(
        paths.auditPath,
        "Latest JSON live check: `2026-05-14T00:00:00.000Z`, `1/1` checks passing.\n",
      );
      await writeSyncAuditMarkdown(paths.completionAuditPath, {
        env: "21/21",
        live: "1/1",
      });

      const { exitCode, stdout, stderr } = await runSyncAudit(root, paths);

      expect(exitCode).toBe(0);
      expect(stdout).toContain("matches the embedded live report");
      expect(stderr).toBe("");
    });
  });
}
