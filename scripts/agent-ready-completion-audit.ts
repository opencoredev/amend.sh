import { writeFile } from "node:fs/promises";
import {
  loadCompletionAuditContext,
  parseCompletionAuditArgs,
} from "./agent-ready-completion-audit-context";
import { runCompletionAudit } from "./agent-ready-completion-audit-runner";

const { allowProductionBlockers, jsonFile, jsonOutput, reportPath } = parseCompletionAuditArgs();

if (!jsonOutput) {
  console.log("Agent-ready completion audit");
  console.log(`Report: ${reportPath}`);
  console.log("");
}

const context = await loadCompletionAuditContext(reportPath);
const audit = runCompletionAudit(context, {
  allowProductionBlockers,
  jsonOutput,
  reportPath,
});

if (jsonFile) {
  await writeFile(jsonFile, `${JSON.stringify(audit.result, null, 2)}\n`);
}

if (jsonOutput) {
  console.log(JSON.stringify(audit.result, null, 2));
} else {
  console.log("");
  console.log(`Completion audit summary: ${audit.summary.passed}/${audit.summary.total} passing.`);
}

if (audit.failed.length > 0 && !jsonOutput) {
  console.log("");
  console.log("Missing or blocked requirements:");
  for (const check of audit.failed) {
    console.log(`- ${check.name}${check.detail ? ` (${check.detail})` : ""}`);
  }
  if (allowProductionBlockers && audit.productionBlockersOnly) {
    console.log("");
    console.log("Only external production blockers remain.");
  }
}

if (!audit.ok) {
  process.exitCode = 1;
}
