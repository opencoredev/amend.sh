import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export type SyncAuditFixturePaths = {
  auditPath: string;
  completionAuditPath: string;
  liveReportPath: string;
  productionReportPath: string;
};

export async function withSyncAuditFixture(run: (paths: SyncAuditFixturePaths) => Promise<void>) {
  const tempDir = await mkdtemp(join(tmpdir(), "amend-agent-ready-sync-audit-"));
  const paths = {
    auditPath: join(tempDir, "agent-ready-audit.md"),
    completionAuditPath: join(tempDir, "completion-audit.md"),
    liveReportPath: join(tempDir, "agent-ready-live-report.json"),
    productionReportPath: join(tempDir, "agent-ready-production-report.json"),
  };

  try {
    await run(paths);
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
}

export async function writeSyncAuditJson(path: string, value: unknown) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

export async function writeSyncAuditMarkdown(path: string, values: { env: string; live: string }) {
  await writeFile(
    path,
    [
      `Latest agent-ready status check: \`2026-05-14T00:00:01.000Z\`, \`${values.env}\` production env values loaded,`,
      `Latest agent-ready live check: \`2026-05-14T00:00:00.000Z\`, \`${values.live}\` checks passing because`,
      "",
    ].join("\n"),
  );
}

export async function runSyncAudit(root: URL, paths: SyncAuditFixturePaths) {
  const validator = Bun.spawn(
    ["bun", "scripts/agent-ready-sync-audit.ts", "--check", paths.productionReportPath],
    {
      cwd: root.pathname,
      env: {
        ...process.env,
        AGENT_READY_AUDIT_PATH: paths.auditPath,
        AGENT_READY_COMPLETION_AUDIT_PATH: paths.completionAuditPath,
        AGENT_READY_LIVE_REPORT_PATH: paths.liveReportPath,
      },
      stderr: "pipe",
      stdout: "pipe",
    },
  );
  const [exitCode, stdout, stderr] = await Promise.all([
    validator.exited,
    new Response(validator.stdout).text(),
    new Response(validator.stderr).text(),
  ]);
  return { exitCode, stdout, stderr };
}
