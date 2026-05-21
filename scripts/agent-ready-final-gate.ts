type CommandResult = {
  exitCode: number;
  name: string;
  required: boolean;
};

const reportPath =
  process.argv.find(
    (arg, index) => index > 1 && !arg.startsWith("--") && arg !== "agent-ready:final-gate",
  ) ?? "agent-ready-production-report.json";
const completionReportPath = "agent-ready-completion-audit-report.json";
const liveReportPath = "agent-ready-live-report.json";
const statusReportPath = "agent-ready-status.json";

async function runStep(
  name: string,
  args: string[],
  options: { required?: boolean } = {},
): Promise<CommandResult> {
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

  return { exitCode, name, required: options.required !== false };
}

const steps = [
  await runStep("Generate strict production report", [
    "bun",
    "scripts/agent-ready-production.ts",
    "--json",
    "--json-file",
    reportPath,
  ]),
  await runStep("Sync audit evidence", ["bun", "scripts/agent-ready-sync-audit.ts", reportPath]),
  await runStep(
    "Generate standalone live report",
    ["bun", "scripts/agent-ready-live.ts", "--json", "--json-file", liveReportPath],
    { required: false },
  ),
  await runStep("Validate live report", [
    "bun",
    "scripts/agent-ready-live-report-validate.ts",
    liveReportPath,
  ]),
  await runStep("Run strict completion audit", [
    "bun",
    "scripts/agent-ready-completion-audit.ts",
    reportPath,
    "--json-file",
    completionReportPath,
  ]),
  await runStep(
    "Generate no-secret status",
    ["bun", "scripts/agent-ready-status.ts", "--json", "--json-file", statusReportPath],
    { required: false },
  ),
  await runStep("Validate status report", [
    "bun",
    "scripts/agent-ready-status-report-validate.ts",
    statusReportPath,
  ]),
  await runStep("Require production report to be green", [
    "bun",
    "scripts/agent-ready-production-report-validate.ts",
    reportPath,
    "--require-ok",
  ]),
  await runStep("Require live report to be green", [
    "bun",
    "scripts/agent-ready-live-report-validate.ts",
    liveReportPath,
    "--require-ok",
  ]),
  await runStep("Require status report to be green", [
    "bun",
    "scripts/agent-ready-status-report-validate.ts",
    statusReportPath,
    "--require-ok",
  ]),
  await runStep("Require completion audit report to be green", [
    "bun",
    "scripts/agent-ready-completion-audit-report-validate.ts",
    completionReportPath,
    "--require-ok",
  ]),
  await runStep("Check synced audit evidence", [
    "bun",
    "scripts/agent-ready-sync-audit.ts",
    "--check",
    reportPath,
  ]),
];

const failed = steps.filter((step) => step.required && step.exitCode !== 0);

if (failed.length > 0) {
  console.log("");
  console.log("Agent-ready final gate failed:");
  for (const step of failed) {
    console.log(`- ${step.name} exited with code ${step.exitCode}`);
  }
  process.exitCode = failed[0]?.exitCode ?? 1;
} else {
  console.log("");
  console.log(`Agent-ready final gate passed: ${reportPath}`);
}
