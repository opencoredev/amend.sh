import { readFile } from "node:fs/promises";
import {
  reportSchemaUrl,
  validateProductionReport,
} from "./agent-ready-production-report-validator-core";

const reportPath =
  process.argv.find((arg) => !arg.startsWith("-") && arg !== Bun.argv[0] && arg !== Bun.argv[1]) ??
  "agent-ready-production-report.json";
const requireOk = process.argv.includes("--require-ok");
const report = JSON.parse(await readFile(reportPath, "utf8")) as unknown;
const errors = validateProductionReport(report, { requireOk });

if (errors.length > 0) {
  console.error(`Invalid agent-ready production report: ${reportPath}`);
  console.error(`Expected schema: ${reportSchemaUrl}`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Valid agent-ready production report: ${reportPath}`);
}
