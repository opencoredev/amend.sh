import type { AddValidationError } from "./report-validator-utils";
import { hasOnlyKeys, isRecord, validateStringArray } from "./report-validator-utils";
import { validateLiveReport, validateStatusReport } from "./agent-ready-embedded-report-validators";

export const reportSchemaUrl =
  "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json";

export function validateProductionReport(
  report: unknown,
  { requireOk = false }: { requireOk?: boolean } = {},
) {
  const errors: string[] = [];
  const addError: AddValidationError = (path, message) => {
    errors.push(`${path}: ${message}`);
  };

  if (!isRecord(report)) {
    addError("$", "must be an object");
    return errors;
  }

  hasOnlyKeys(addError, "$", report, ["$schema", "blockers", "checkedAt", "ok", "steps"]);

  if (report.$schema !== reportSchemaUrl) {
    addError("$.$schema", `must be ${reportSchemaUrl}`);
  }

  validateStringArray(addError, "$.blockers", report.blockers);

  if (typeof report.checkedAt !== "string" || Number.isNaN(Date.parse(report.checkedAt))) {
    addError("$.checkedAt", "must be a date-time string");
  }

  if (typeof report.ok !== "boolean") {
    addError("$.ok", "must be a boolean");
  }

  if (!isRecord(report.steps)) {
    addError("$.steps", "must be an object");
  } else {
    hasOnlyKeys(addError, "$.steps", report.steps, ["built", "live", "readinessStrict", "status"]);
    for (const key of ["built", "readinessStrict"]) {
      validateStep(addError, `$.steps.${key}`, report.steps[key]);
    }
    validateStep(addError, "$.steps.live", report.steps.live, validateLiveReport);
    validateStep(addError, "$.steps.status", report.steps.status, validateStatusReport);
  }

  validateReportConsistency(addError, report);
  if (requireOk) {
    validateRequiredOk(addError, report);
  }

  return errors;
}

function validateSummary(addError: AddValidationError, path: string, value: unknown) {
  if (value === undefined) {
    return;
  }

  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(addError, path, value, ["passed", "total"]);
  if (!Number.isInteger(value.passed) || Number(value.passed) < 0) {
    addError(`${path}.passed`, "must be a non-negative integer");
  }
  if (!Number.isInteger(value.total) || Number(value.total) < 0) {
    addError(`${path}.total`, "must be a non-negative integer");
  }
  if (
    Number.isInteger(value.passed) &&
    Number.isInteger(value.total) &&
    value.passed > value.total
  ) {
    addError(`${path}.passed`, "must not exceed total");
  }
}

function validateReportConsistency(addError: AddValidationError, report: Record<string, unknown>) {
  if (typeof report.ok === "boolean" && Array.isArray(report.blockers)) {
    if (report.ok && report.blockers.length > 0) {
      addError("$.blockers", "must be empty when ok is true");
    }
    if (!report.ok && report.blockers.length === 0) {
      addError("$.blockers", "must include at least one blocker when ok is false");
    }
  }

  if (!isRecord(report.steps) || typeof report.ok !== "boolean") {
    return;
  }

  const stepValues = ["built", "live", "readinessStrict", "status"].map((key) =>
    isRecord(report.steps?.[key]) ? report.steps[key].ok : undefined,
  );
  if (stepValues.every((ok) => typeof ok === "boolean")) {
    const expectedOk = stepValues.every((ok) => ok === true);
    if (report.ok !== expectedOk) {
      addError("$.ok", "must equal whether every step is ok");
    }
  }
}

function validateStep(
  addError: AddValidationError,
  path: string,
  value: unknown,
  reportValidator?: (addError: AddValidationError, path: string, value: unknown) => void,
) {
  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(
    addError,
    path,
    value,
    reportValidator ? ["exitCode", "ok", "report", "summary"] : ["exitCode", "ok", "summary"],
  );

  if (!Number.isInteger(value.exitCode) || Number(value.exitCode) < 0) {
    addError(`${path}.exitCode`, "must be a non-negative integer");
  }
  if (typeof value.ok !== "boolean") {
    addError(`${path}.ok`, "must be a boolean");
  }
  if (
    Number.isInteger(value.exitCode) &&
    Number(value.exitCode) >= 0 &&
    typeof value.ok === "boolean" &&
    value.ok !== (value.exitCode === 0)
  ) {
    addError(`${path}.ok`, "must equal whether exitCode is zero");
  }
  if ("summary" in value) {
    validateSummary(addError, `${path}.summary`, value.summary);
  }
  if (reportValidator) {
    reportValidator(addError, `${path}.report`, value.report);
  }
}

function validateRequiredOk(addError: AddValidationError, report: Record<string, unknown>) {
  if (report.ok !== true) {
    addError("$.ok", "must be true when --require-ok is used");
  }
  if (Array.isArray(report.blockers) && report.blockers.length > 0) {
    addError("$.blockers", "must be empty when --require-ok is used");
  }
  if (isRecord(report.steps)) {
    for (const key of ["built", "live", "readinessStrict", "status"]) {
      requirePassingStep(addError, `$.steps.${key}`, report.steps[key]);
    }
  }
}

function requirePassingStep(addError: AddValidationError, path: string, value: unknown) {
  if (!isRecord(value)) {
    return;
  }

  if (value.ok !== true) {
    addError(`${path}.ok`, "must be true when --require-ok is used");
  }

  if (!isRecord(value.report)) {
    return;
  }

  if ("ok" in value.report && value.report.ok !== true) {
    addError(`${path}.report.ok`, "must be true when --require-ok is used");
  }
  if (Array.isArray(value.report.blockers) && value.report.blockers.length > 0) {
    addError(`${path}.report.blockers`, "must be empty when --require-ok is used");
  }
  if (
    Number.isInteger(value.report.passed) &&
    Number.isInteger(value.report.total) &&
    value.report.passed !== value.report.total
  ) {
    addError(`${path}.report.passed`, "must equal total when --require-ok is used");
  }
  if (Array.isArray(value.report.checks)) {
    for (const [index, check] of value.report.checks.entries()) {
      if (isRecord(check) && check.ok !== true) {
        addError(`${path}.report.checks[${index}].ok`, "must be true when --require-ok is used");
      }
    }
  }
}
