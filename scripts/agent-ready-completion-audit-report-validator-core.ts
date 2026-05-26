import {
  hasOnlyKeys,
  isRecord,
  validateChecks as validateReportChecks,
} from "./report-validator-utils";

export const reportSchemaUrl =
  "https://docs.amend.sh/schemas/agent-ready-completion-audit-report.schema.json";

const productionBlockerCheckNames = new Set([
  "saved production report has passing strict readiness",
  "saved production report has all production env loaded",
  "saved production report has passing live validator",
  "saved production report is complete and blocker-free",
]);

type AddError = (path: string, message: string) => void;

export function validateCompletionAuditReport(
  report: unknown,
  options: { requireOk?: boolean } = {},
) {
  const errors: string[] = [];
  const addError: AddError = (path, message) => {
    errors.push(`${path}: ${message}`);
  };

  if (!isRecord(report)) {
    addError("$", "must be an object");
    return errors;
  }

  hasOnlyKeys(addError, "$", report, [
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
  validateChecks(addError, "$.checks", report.checks);
  if (typeof report.completionOk !== "boolean") {
    addError("$.completionOk", "must be a boolean");
  }
  validateChecks(addError, "$.missingOrBlocked", report.missingOrBlocked);
  if (typeof report.ok !== "boolean") {
    addError("$.ok", "must be a boolean");
  }
  if (typeof report.productionBlockersOnly !== "boolean") {
    addError("$.productionBlockersOnly", "must be a boolean");
  }
  if (typeof report.productionReportPath !== "string" || report.productionReportPath.length === 0) {
    addError("$.productionReportPath", "must be a non-empty string");
  }
  validateSummary(addError, "$.summary", report.summary);
  validateReportConsistency(addError, report);

  if (options.requireOk) {
    validateRequireOk(addError, report);
  }

  return errors;
}

function validateChecks(addError: AddError, path: string, value: unknown) {
  validateReportChecks(addError, path, value);
  if (!Array.isArray(value)) {
    return;
  }

  const names = new Set<string>();
  for (const [index, check] of value.entries()) {
    if (isRecord(check) && typeof check.name === "string") {
      if (names.has(check.name)) {
        addError(`${path}[${index}].name`, "must be unique");
      }
      names.add(check.name);
    }
  }
}

function validateSummary(addError: AddError, path: string, value: unknown) {
  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(addError, path, value, ["failed", "passed", "total"]);
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

function validateReportConsistency(addError: AddError, report: Record<string, unknown>) {
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

function validateRequireOk(addError: AddError, report: Record<string, unknown>) {
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
