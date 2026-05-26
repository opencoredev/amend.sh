export function parseCompletionAuditArgs(argv = process.argv) {
  const allowProductionBlockers = argv.includes("--allow-production-blockers");
  const jsonOutput = argv.includes("--json");
  const jsonFileFlagIndex = argv.indexOf("--json-file");
  const jsonFile = jsonFileFlagIndex >= 0 ? argv[jsonFileFlagIndex + 1] : undefined;
  if (jsonFileFlagIndex >= 0 && !jsonFile) {
    throw new Error("Missing path after --json-file.");
  }

  const reportPath =
    argv.find(
      (arg, index) =>
        index > 1 &&
        !arg.startsWith("--") &&
        arg !== "agent-ready:completion-audit" &&
        index !== jsonFileFlagIndex + 1,
    ) ?? "agent-ready-production-report.json";

  return {
    allowProductionBlockers,
    jsonFile,
    jsonOutput,
    reportPath,
  };
}
