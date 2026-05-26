import type { AddValidationError } from "./report-validator-utils";
import {
  hasOnlyKeys,
  isRecord,
  validateChecks,
  validateExactStringArray,
  validateOrigins,
  validateStringArray,
} from "./report-validator-utils";

export const liveReportSchemaUrl =
  "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json";
export const statusReportSchemaUrl =
  "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json";
export const requiredNextGates = [
  "bun run agent-ready:production",
  "bun run agent-ready:final-gate",
];

export function validateLiveReport(addError: AddValidationError, path: string, value: unknown) {
  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(addError, path, value, [
    "$schema",
    "blockers",
    "checkedAt",
    "checks",
    "ok",
    "origins",
    "passed",
    "total",
  ]);
  if (value.$schema !== liveReportSchemaUrl) {
    addError(`${path}.$schema`, `must be ${liveReportSchemaUrl}`);
  }
  validateStringArray(addError, `${path}.blockers`, value.blockers);
  if (typeof value.checkedAt !== "string" || Number.isNaN(Date.parse(value.checkedAt))) {
    addError(`${path}.checkedAt`, "must be a date-time string");
  }
  validateChecks(addError, `${path}.checks`, value.checks);
  if (typeof value.ok !== "boolean") {
    addError(`${path}.ok`, "must be a boolean");
  }
  validateOrigins(addError, `${path}.origins`, value.origins);
  validateReportCounts(addError, path, value);

  if (Array.isArray(value.checks)) {
    const passedChecks = value.checks.filter(
      (check) => isRecord(check) && check.ok === true,
    ).length;
    if (Number.isInteger(value.passed) && value.passed !== passedChecks) {
      addError(`${path}.passed`, "must equal the number of passing checks");
    }
    if (Number.isInteger(value.total) && value.total !== value.checks.length) {
      addError(`${path}.total`, "must equal the number of checks");
    }
    if (
      typeof value.ok === "boolean" &&
      Number.isInteger(value.passed) &&
      Number.isInteger(value.total) &&
      value.ok !== (value.passed === value.total)
    ) {
      addError(`${path}.ok`, "must equal whether passed equals total");
    }
  }
}

export function validateStatusReport(addError: AddValidationError, path: string, value: unknown) {
  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(addError, path, value, [
    "$schema",
    "blockers",
    "checkedAt",
    "dns",
    "nextGates",
    "ok",
    "origins",
    "productionEnv",
  ]);
  if (value.$schema !== statusReportSchemaUrl) {
    addError(`${path}.$schema`, `must be ${statusReportSchemaUrl}`);
  }
  validateStringArray(addError, `${path}.blockers`, value.blockers);
  if (typeof value.checkedAt !== "string" || Number.isNaN(Date.parse(value.checkedAt))) {
    addError(`${path}.checkedAt`, "must be a date-time string");
  }
  if (!isRecord(value.dns)) {
    addError(`${path}.dns`, "must be an object");
  } else {
    hasOnlyKeys(addError, `${path}.dns`, value.dns, ["docs", "web"]);
    validateDnsHost(addError, `${path}.dns.docs`, value.dns.docs);
    validateDnsHost(addError, `${path}.dns.web`, value.dns.web);
  }
  if (typeof value.ok !== "boolean") {
    addError(`${path}.ok`, "must be a boolean");
  }
  validateExactStringArray(addError, `${path}.nextGates`, value.nextGates, requiredNextGates);
  if (typeof value.ok === "boolean" && Array.isArray(value.blockers)) {
    if (value.ok && value.blockers.length > 0) {
      addError(`${path}.blockers`, "must be empty when ok is true");
    }
    if (!value.ok && value.blockers.length === 0) {
      addError(`${path}.blockers`, "must include at least one blocker when ok is false");
    }
  }
  validateOrigins(addError, `${path}.origins`, value.origins);
  validateProductionEnv(addError, `${path}.productionEnv`, value.productionEnv);
}

function validateDnsHost(addError: AddValidationError, path: string, value: unknown) {
  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(addError, path, value, ["delegated", "host", "records", "registered"]);
  if (typeof value.delegated !== "boolean") {
    addError(`${path}.delegated`, "must be a boolean");
  }
  if (typeof value.host !== "string" || value.host.length === 0) {
    addError(`${path}.host`, "must be a non-empty string");
  }
  validateStringArray(addError, `${path}.records`, value.records);
  if (typeof value.registered !== "boolean") {
    addError(`${path}.registered`, "must be a boolean");
  }
}

function validateProductionEnv(addError: AddValidationError, path: string, value: unknown) {
  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(addError, path, value, ["missing", "passed", "total"]);
  validateStringArray(addError, `${path}.missing`, value.missing);
  validateReportCounts(addError, path, value);
}

function validateReportCounts(
  addError: AddValidationError,
  path: string,
  value: Record<string, unknown>,
) {
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
