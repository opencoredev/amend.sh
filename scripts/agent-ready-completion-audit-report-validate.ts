import { readFile } from "node:fs/promises";
import { validateCompletionAuditReport } from "./agent-ready-completion-audit-report-validator-core";

const reportPath =
  process.argv.find((arg) => !arg.startsWith("-") && arg !== Bun.argv[0] && arg !== Bun.argv[1]) ??
  "agent-ready-completion-audit-report.json";
const requireOk = process.argv.includes("--require-ok");

const report = JSON.parse(await readFile(reportPath, "utf8")) as unknown;
const errors = validateCompletionAuditReport(report, { requireOk });

if (errors.length > 0) {
  console.error(`Invalid agent-ready completion audit report: ${reportPath}`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Valid agent-ready completion audit report: ${reportPath}`);
}
