import { readFile } from "node:fs/promises";

const reportPath =
  process.argv.find((arg) => !arg.startsWith("-") && arg !== Bun.argv[0] && arg !== Bun.argv[1]) ??
  "agent-ready-completion-audit-report.json";
const requireOk = process.argv.includes("--require-ok");
const reportSchemaUrl =
  "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json";
const productionBlockerCheckNames = new Set([
  "saved production report has passing strict readiness",
  "saved production report has all production env loaded",
  "saved production report has passing live validator",
  "saved production report is complete and blocker-free",
]);
const errors: string[] = [];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function addError(path: string, message: string) {
  errors.push(`${path}: ${message}`);
}

function hasOnlyKeys(path: string, value: Record<string, unknown>, keys: string[]) {
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) {
      addError(`${path}.${key}`, "unexpected property");
    }
  }
}

function validateCheck(path: string, value: unknown) {
  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(path, value, ["detail", "name", "ok"]);
  if ("detail" in value && typeof value.detail !== "string") {
    addError(`${path}.detail`, "must be a string when present");
  }
  if (typeof value.name !== "string" || value.name.length === 0) {
    addError(`${path}.name`, "must be a non-empty string");
  }
  if (typeof value.ok !== "boolean") {
    addError(`${path}.ok`, "must be a boolean");
  }
}

function validateChecks(path: string, value: unknown) {
  if (!Array.isArray(value)) {
    addError(path, "must be an array");
    return;
  }

  const names = new Set<string>();
  for (const [index, check] of value.entries()) {
    validateCheck(`${path}[${index}]`, check);
    if (isRecord(check) && typeof check.name === "string") {
      if (names.has(check.name)) {
        addError(`${path}[${index}].name`, "must be unique");
      }
      names.add(check.name);
    }
  }
}

function validateSummary(path: string, value: unknown) {
  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(path, value, ["failed", "passed", "total"]);
  for (const key of ["failed", "passed", "total"]) {
    if (!Number.isInteger(value[key]) || Number(value[key]) < 0) {
      addError(`${path}.${key}`, "must be a non-negative integer");
    }
  }
  if (
    Number.isInteger(value.passed) &&
    Number.isInteger(value.total) &&
    value.passed > value.total
  ) {
    addError(`${path}.passed`, "must not exceed total");
  }
  if (
    Number.isInteger(value.failed) &&
    Number.isInteger(value.total) &&
    value.failed > value.total
  ) {
    addError(`${path}.failed`, "must not exceed total");
  }
}

function sameCheck(left: unknown, right: unknown) {
  return (
    isRecord(left) &&
    isRecord(right) &&
    left.name === right.name &&
    left.ok === right.ok &&
    left.detail === right.detail
  );
}

function validateReportConsistency(report: Record<string, unknown>) {
  if (!Array.isArray(report.checks) || !Array.isArray(report.missingOrBlocked)) {
    return;
  }

  const failedChecks = report.checks.filter((check) => isRecord(check) && check.ok === false);
  const passedChecks = report.checks.filter((check) => isRecord(check) && check.ok === true);
  const failedProductionOnly =
    failedChecks.length > 0 &&
    failedChecks.every(
      (check) => isRecord(check) && productionBlockerCheckNames.has(String(check.name)),
    );

  if (isRecord(report.summary)) {
    if (Number.isInteger(report.summary.failed) && report.summary.failed !== failedChecks.length) {
      addError("$.summary.failed", "must equal the number of failing checks");
    }
    if (Number.isInteger(report.summary.passed) && report.summary.passed !== passedChecks.length) {
      addError("$.summary.passed", "must equal the number of passing checks");
    }
    if (Number.isInteger(report.summary.total) && report.summary.total !== report.checks.length) {
      addError("$.summary.total", "must equal the number of checks");
    }
  }

  if (report.missingOrBlocked.length !== failedChecks.length) {
    addError("$.missingOrBlocked", "must contain every failing check");
  } else {
    for (const [index, failedCheck] of failedChecks.entries()) {
      if (!sameCheck(report.missingOrBlocked[index], failedCheck)) {
        addError(`$.missingOrBlocked[${index}]`, "must match the corresponding failing check");
      }
    }
  }

  if (
    typeof report.completionOk === "boolean" &&
    report.completionOk !== (failedChecks.length === 0)
  ) {
    addError("$.completionOk", "must equal whether all checks passed");
  }
  if (
    typeof report.productionBlockersOnly === "boolean" &&
    report.productionBlockersOnly !== failedProductionOnly
  ) {
    addError(
      "$.productionBlockersOnly",
      "must equal whether only production blocker checks failed",
    );
  }
  if (
    typeof report.ok === "boolean" &&
    typeof report.allowProductionBlockers === "boolean" &&
    typeof report.completionOk === "boolean" &&
    typeof report.productionBlockersOnly === "boolean"
  ) {
    const expectedOk =
      report.completionOk || (report.allowProductionBlockers && report.productionBlockersOnly);
    if (report.ok !== expectedOk) {
      addError("$.ok", "must equal completionOk or allowed production blockers");
    }
  }
}

const report = JSON.parse(await readFile(reportPath, "utf8")) as unknown;

if (!isRecord(report)) {
  addError("$", "must be an object");
} else {
  hasOnlyKeys("$", report, [
    "$schema",
    "allowProductionBlockers",
    "checkedAt",
    "checks",
    "completionOk",
    "missingOrBlocked",
    "ok",
    "productionBlockersOnly",
    "productionReportPath",
    "summary",
  ]);

  if (report.$schema !== reportSchemaUrl) {
    addError("$.$schema", `must be ${reportSchemaUrl}`);
  }
  if (typeof report.allowProductionBlockers !== "boolean") {
    addError("$.allowProductionBlockers", "must be a boolean");
  }
  if (typeof report.checkedAt !== "string" || Number.isNaN(Date.parse(report.checkedAt))) {
    addError("$.checkedAt", "must be a date-time string");
  }
  validateChecks("$.checks", report.checks);
  if (typeof report.completionOk !== "boolean") {
    addError("$.completionOk", "must be a boolean");
  }
  validateChecks("$.missingOrBlocked", report.missingOrBlocked);
  if (typeof report.ok !== "boolean") {
    addError("$.ok", "must be a boolean");
  }
  if (typeof report.productionBlockersOnly !== "boolean") {
    addError("$.productionBlockersOnly", "must be a boolean");
  }
  if (typeof report.productionReportPath !== "string" || report.productionReportPath.length === 0) {
    addError("$.productionReportPath", "must be a non-empty string");
  }
  validateSummary("$.summary", report.summary);
  validateReportConsistency(report);

  if (requireOk) {
    if (report.ok !== true) {
      addError("$.ok", "must be true when --require-ok is used");
    }
    if (report.completionOk !== true) {
      addError("$.completionOk", "must be true when --require-ok is used");
    }
    if (report.productionBlockersOnly !== false) {
      addError("$.productionBlockersOnly", "must be false when --require-ok is used");
    }
    if (Array.isArray(report.missingOrBlocked) && report.missingOrBlocked.length > 0) {
      addError("$.missingOrBlocked", "must be empty when --require-ok is used");
    }
    if (Array.isArray(report.checks)) {
      for (const [index, check] of report.checks.entries()) {
        if (isRecord(check) && check.ok !== true) {
          addError(`$.checks[${index}].ok`, "must be true when --require-ok is used");
        }
      }
    }
    if (isRecord(report.summary) && report.summary.failed !== 0) {
      addError("$.summary.failed", "must be zero when --require-ok is used");
    }
  }
}

if (errors.length > 0) {
  console.error(`Invalid agent-ready completion audit report: ${reportPath}`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Valid agent-ready completion audit report: ${reportPath}`);
}
