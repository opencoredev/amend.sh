type CommandResult = {
  exitCode: number;
  name: string;
};

const reportPath =
  process.argv.find(
    (arg, index) => index > 1 && !arg.startsWith("--") && arg !== "agent-ready:refresh-report",
  ) ?? "agent-ready-production-report.json";
const liveReportPath = "agent-ready-live-report.json";

async function runStep(name: string, args: string[]): Promise<CommandResult> {
  console.log(`\n${name}`);
  console.log(`$ ${args.join(" ")}`);
  const child = Bun.spawn(args, {
    stderr: "pipe",
    stdout: "pipe",
  });
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(child.stdout).text(),
    new Response(child.stderr).text(),
    child.exited,
  ]);

  if (stdout.trim()) {
    console.log(stdout.trimEnd());
  }
  if (stderr.trim()) {
    console.error(stderr.trimEnd());
  }

  return { exitCode, name };
}

const production = await runStep("Generate combined production report", [
  "bun",
  "scripts/agent-ready-production.ts",
  "--json",
  "--json-file",
  reportPath,
]);
const sync = await runStep("Sync audit evidence", [
  "bun",
  "scripts/agent-ready-sync-audit.ts",
  reportPath,
]);
await runStep("Generate standalone live report", [
  "bun",
  "scripts/agent-ready-live.ts",
  "--json",
  "--json-file",
  liveReportPath,
]);
const status = await runStep("Generate no-secret status", [
  "bun",
  "scripts/agent-ready-status.ts",
  "--json",
  "--json-file",
  "agent-ready-status.json",
]);
const completion = await runStep("Run completion audit", [
  "bun",
  "scripts/agent-ready-completion-audit.ts",
  reportPath,
  "--allow-production-blockers",
  "--json-file",
  "agent-ready-completion-audit-report.json",
]);
const audit = await runStep("Validate reports and synced audits", [
  "bun",
  "run",
  "agent-ready:audit:check",
]);

if (sync.exitCode !== 0 || completion.exitCode !== 0 || audit.exitCode !== 0) {
  process.exitCode = sync.exitCode || completion.exitCode || audit.exitCode;
} else {
  process.exitCode = production.exitCode || status.exitCode;
}

if (process.exitCode === 0) {
  console.log(`\nAgent-ready production report is passing: ${reportPath}`);
} else if (production.exitCode !== 0) {
  console.log(`\nAgent-ready production report refreshed with blockers: ${reportPath}`);
} else {
  console.log(`\nAgent-ready production report refresh failed after generation: ${reportPath}`);
}
