import { readFile } from "node:fs/promises";

const reportPath =
  process.argv.find((arg) => !arg.startsWith("-") && arg !== Bun.argv[0] && arg !== Bun.argv[1]) ??
  "agent-ready-live-report.json";
const requireOk = process.argv.includes("--require-ok");
const reportSchemaUrl = "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json";
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

function validateStringArray(path: string, value: unknown) {
  if (!Array.isArray(value)) {
    addError(path, "must be an array");
    return;
  }
  for (const [index, item] of value.entries()) {
    if (typeof item !== "string" || item.length === 0) {
      addError(`${path}[${index}]`, "must be a non-empty string");
    }
  }
}

function validateOrigins(path: string, value: unknown) {
  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(path, value, ["docs", "web"]);
  for (const key of ["docs", "web"]) {
    if (typeof value[key] !== "string" || value[key].length === 0) {
      addError(`${path}.${key}`, "must be a non-empty string");
    }
  }
}

function validateChecks(path: string, value: unknown) {
  if (!Array.isArray(value)) {
    addError(path, "must be an array");
    return;
  }

  for (const [index, check] of value.entries()) {
    const checkPath = `${path}[${index}]`;
    if (!isRecord(check)) {
      addError(checkPath, "must be an object");
      continue;
    }
    hasOnlyKeys(checkPath, check, ["detail", "name", "ok"]);
    if ("detail" in check && typeof check.detail !== "string") {
      addError(`${checkPath}.detail`, "must be a string when present");
    }
    if (typeof check.name !== "string" || check.name.length === 0) {
      addError(`${checkPath}.name`, "must be a non-empty string");
    }
    if (typeof check.ok !== "boolean") {
      addError(`${checkPath}.ok`, "must be a boolean");
    }
  }
}

function validateConsistency(report: Record<string, unknown>) {
  if (Array.isArray(report.checks)) {
    const passedChecks = report.checks.filter(
      (check) => isRecord(check) && check.ok === true,
    ).length;
    if (Number.isInteger(report.passed) && report.passed !== passedChecks) {
      addError("$.passed", "must equal the number of passing checks");
    }
    if (Number.isInteger(report.total) && report.total !== report.checks.length) {
      addError("$.total", "must equal the number of checks");
    }
  }

  if (
    Number.isInteger(report.passed) &&
    Number.isInteger(report.total) &&
    typeof report.ok === "boolean" &&
    report.ok !== (report.passed === report.total)
  ) {
    addError("$.ok", "must equal whether passed equals total");
  }

  if (typeof report.ok === "boolean" && Array.isArray(report.blockers)) {
    if (report.ok && report.blockers.length > 0) {
      addError("$.blockers", "must be empty when ok is true");
    }
  }

  if (!requireOk) {
    return;
  }

  if (report.ok !== true) {
    addError("$.ok", "must be true when --require-ok is used");
  }
  if (Array.isArray(report.blockers) && report.blockers.length > 0) {
    addError("$.blockers", "must be empty when --require-ok is used");
  }
  if (Array.isArray(report.checks)) {
    for (const [index, check] of report.checks.entries()) {
      if (isRecord(check) && check.ok !== true) {
        addError(`$.checks[${index}].ok`, "must be true when --require-ok is used");
      }
    }
  }
}

const report = JSON.parse(await readFile(reportPath, "utf8")) as unknown;

if (!isRecord(report)) {
  addError("$", "must be an object");
} else {
  hasOnlyKeys("$", report, [
    "$schema",
    "blockers",
    "checkedAt",
    "checks",
    "ok",
    "origins",
    "passed",
    "total",
  ]);
  if (report.$schema !== reportSchemaUrl) {
    addError("$.$schema", `must be ${reportSchemaUrl}`);
  }
  validateStringArray("$.blockers", report.blockers);
  if (typeof report.checkedAt !== "string" || Number.isNaN(Date.parse(report.checkedAt))) {
    addError("$.checkedAt", "must be a date-time string");
  }
  validateChecks("$.checks", report.checks);
  if (typeof report.ok !== "boolean") {
    addError("$.ok", "must be a boolean");
  }
  validateOrigins("$.origins", report.origins);
  if (!Number.isInteger(report.passed) || Number(report.passed) < 0) {
    addError("$.passed", "must be a non-negative integer");
  }
  if (!Number.isInteger(report.total) || Number(report.total) < 0) {
    addError("$.total", "must be a non-negative integer");
  }
  if (
    Number.isInteger(report.passed) &&
    Number.isInteger(report.total) &&
    report.passed > report.total
  ) {
    addError("$.passed", "must not exceed total");
  }
  validateConsistency(report);
}

if (errors.length > 0) {
  console.error(`Invalid agent-ready live report: ${reportPath}`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Valid agent-ready live report: ${reportPath}`);
}
