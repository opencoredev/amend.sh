import { writeFile } from "node:fs/promises";
import { expect, test } from "bun:test";
import {
  runSyncAudit,
  withSyncAuditFixture,
  writeSyncAuditJson,
  writeSyncAuditMarkdown,
} from "./agent-ready-sync-audit-test-utils";

export function registerSyncAuditDriftTest(root: URL) {
  test("sync audit rejects standalone live report drift", async () => {
    await withSyncAuditFixture(async (paths) => {
      const embeddedLiveReport = {
        $schema: "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json",
        blockers: ["Register amend.sh."],
        checkedAt: "2026-05-14T00:00:00.000Z",
        checks: [{ detail: "amend.sh", name: "web apex is registered", ok: false }],
        origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
        ok: false,
        passed: 0,
        total: 1,
      };

      await writeSyncAuditJson(paths.productionReportPath, {
        $schema: "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json",
        blockers: ["Register amend.sh."],
        checkedAt: "2026-05-14T00:00:02.000Z",
        ok: false,
        steps: {
          built: { exitCode: 0, ok: true, summary: { passed: 45, total: 45 } },
          live: { exitCode: 1, ok: false, report: embeddedLiveReport },
          readinessStrict: { exitCode: 1, ok: false, summary: { passed: 129, total: 150 } },
          status: {
            exitCode: 1,
            ok: false,
            report: {
              $schema: "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json",
              blockers: ["Load 1 missing production environment values."],
              checkedAt: "2026-05-14T00:00:01.000Z",
              dns: {
                docs: {
                  delegated: false,
                  host: "docs.amend.sh",
                  records: [],
                  registered: false,
                },
                web: {
                  delegated: false,
                  host: "amend.sh",
                  records: [],
                  registered: false,
                },
              },
              nextGates: ["bun run agent-ready:production", "bun run agent-ready:final-gate"],
              ok: false,
              origins: { docs: "https://docs.amend.sh", web: "https://amend.sh" },
              productionEnv: { missing: ["SITE_URL"], passed: 19, total: 20 },
            },
          },
        },
      });
      await writeSyncAuditJson(paths.liveReportPath, {
        ...embeddedLiveReport,
        checkedAt: "2026-05-14T00:00:03.000Z",
        checks: [{ detail: "amend.sh", name: "web DNS resolves", ok: false }],
      });
      await writeFile(
        paths.auditPath,
        "Latest JSON live check: `2026-05-14T00:00:00.000Z`, `0/1` checks passing.\n",
      );
      await writeSyncAuditMarkdown(paths.completionAuditPath, {
        env: "19/20",
        live: "0/1",
      });

      const { exitCode, stderr } = await runSyncAudit(root, paths);

      expect(exitCode).toBe(1);
      expect(stderr).toContain("agent-ready-live-report.json");
      expect(stderr).toContain("is not synced");
      expect(stderr).toContain("ignoring checkedAt");
    });
  });
}
