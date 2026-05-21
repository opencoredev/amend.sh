import { readFile } from "node:fs/promises";

const reportPath =
  process.argv.find((arg) => !arg.startsWith("-") && arg !== Bun.argv[0] && arg !== Bun.argv[1]) ??
  "agent-ready-production-report.json";
const requireOk = process.argv.includes("--require-ok");
const reportSchemaUrl = "https://docs.amend.sh/schemas/agent-ready-production-report.schema.json";
const liveReportSchemaUrl = "https://docs.amend.sh/schemas/agent-ready-live-report.schema.json";
const statusReportSchemaUrl = "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json";
const requiredNextGates = ["bun run agent-ready:production", "bun run agent-ready:final-gate"];
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

function validateSummary(path: string, value: unknown) {
  if (value === undefined) {
    return;
  }

  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(path, value, ["passed", "total"]);
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

function validateStringArray(path: string, value: unknown, allowEmpty = true) {
  if (!Array.isArray(value)) {
    addError(path, "must be an array");
    return;
  }
  if (!allowEmpty && value.length === 0) {
    addError(path, "must not be empty");
  }
  for (const [index, item] of value.entries()) {
    if (typeof item !== "string" || item.length === 0) {
      addError(`${path}[${index}]`, "must be a non-empty string");
    }
  }
}

function validateExactStringArray(path: string, value: unknown, expected: string[]) {
  validateStringArray(path, value);
  if (!Array.isArray(value)) {
    return;
  }

  if (value.length !== expected.length) {
    addError(path, `must contain exactly ${expected.length} entries`);
    return;
  }

  for (const [index, expectedValue] of expected.entries()) {
    if (value[index] !== expectedValue) {
      addError(`${path}[${index}]`, `must be ${expectedValue}`);
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

function validateDnsHost(path: string, value: unknown) {
  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(path, value, ["delegated", "host", "records", "registered"]);
  if (typeof value.delegated !== "boolean") {
    addError(`${path}.delegated`, "must be a boolean");
  }
  if (typeof value.host !== "string" || value.host.length === 0) {
    addError(`${path}.host`, "must be a non-empty string");
  }
  validateStringArray(`${path}.records`, value.records);
  if (typeof value.registered !== "boolean") {
    addError(`${path}.registered`, "must be a boolean");
  }
}

function validateProductionEnv(path: string, value: unknown) {
  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(path, value, ["missing", "passed", "total"]);
  validateStringArray(`${path}.missing`, value.missing);
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

function validateLiveReport(path: string, value: unknown) {
  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(path, value, [
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
  validateStringArray(`${path}.blockers`, value.blockers);
  if (typeof value.checkedAt !== "string" || Number.isNaN(Date.parse(value.checkedAt))) {
    addError(`${path}.checkedAt`, "must be a date-time string");
  }
  validateChecks(`${path}.checks`, value.checks);
  if (typeof value.ok !== "boolean") {
    addError(`${path}.ok`, "must be a boolean");
  }
  validateOrigins(`${path}.origins`, value.origins);
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

function validateStatusReport(path: string, value: unknown) {
  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(path, value, [
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
  validateStringArray(`${path}.blockers`, value.blockers);
  if (typeof value.checkedAt !== "string" || Number.isNaN(Date.parse(value.checkedAt))) {
    addError(`${path}.checkedAt`, "must be a date-time string");
  }
  if (!isRecord(value.dns)) {
    addError(`${path}.dns`, "must be an object");
  } else {
    hasOnlyKeys(`${path}.dns`, value.dns, ["docs", "web"]);
    validateDnsHost(`${path}.dns.docs`, value.dns.docs);
    validateDnsHost(`${path}.dns.web`, value.dns.web);
  }
  if (typeof value.ok !== "boolean") {
    addError(`${path}.ok`, "must be a boolean");
  }
  validateExactStringArray(`${path}.nextGates`, value.nextGates, requiredNextGates);
  if (typeof value.ok === "boolean" && Array.isArray(value.blockers)) {
    if (value.ok && value.blockers.length > 0) {
      addError(`${path}.blockers`, "must be empty when ok is true");
    }
    if (!value.ok && value.blockers.length === 0) {
      addError(`${path}.blockers`, "must include at least one blocker when ok is false");
    }
  }
  validateOrigins(`${path}.origins`, value.origins);
  validateProductionEnv(`${path}.productionEnv`, value.productionEnv);
}

function validateReportConsistency(report: Record<string, unknown>) {
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
  path: string,
  value: unknown,
  reportValidator?: (path: string, value: unknown) => void,
) {
  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(
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
    validateSummary(`${path}.summary`, value.summary);
  }
  if (reportValidator) {
    reportValidator(`${path}.report`, value.report);
  }
}

function requirePassingStep(path: string, value: unknown) {
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

const report = JSON.parse(await readFile(reportPath, "utf8")) as unknown;

if (!isRecord(report)) {
  addError("$", "must be an object");
} else {
  hasOnlyKeys("$", report, ["$schema", "blockers", "checkedAt", "ok", "steps"]);

  if (report.$schema !== reportSchemaUrl) {
    addError("$.$schema", `must be ${reportSchemaUrl}`);
  }

  if (!Array.isArray(report.blockers)) {
    addError("$.blockers", "must be an array");
  } else {
    for (const [index, blocker] of report.blockers.entries()) {
      if (typeof blocker !== "string" || blocker.length === 0) {
        addError(`$.blockers[${index}]`, "must be a non-empty string");
      }
    }
  }

  if (typeof report.checkedAt !== "string" || Number.isNaN(Date.parse(report.checkedAt))) {
    addError("$.checkedAt", "must be a date-time string");
  }

  if (typeof report.ok !== "boolean") {
    addError("$.ok", "must be a boolean");
  }

  if (!isRecord(report.steps)) {
    addError("$.steps", "must be an object");
  } else {
    hasOnlyKeys("$.steps", report.steps, ["built", "live", "readinessStrict", "status"]);
    for (const key of ["built", "readinessStrict"]) {
      validateStep(`$.steps.${key}`, report.steps[key]);
    }
    validateStep("$.steps.live", report.steps.live, validateLiveReport);
    validateStep("$.steps.status", report.steps.status, validateStatusReport);
  }

  validateReportConsistency(report);

  if (requireOk) {
    if (report.ok !== true) {
      addError("$.ok", "must be true when --require-ok is used");
    }
    if (Array.isArray(report.blockers) && report.blockers.length > 0) {
      addError("$.blockers", "must be empty when --require-ok is used");
    }
    if (isRecord(report.steps)) {
      for (const key of ["built", "live", "readinessStrict", "status"]) {
        requirePassingStep(`$.steps.${key}`, report.steps[key]);
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`Invalid agent-ready production report: ${reportPath}`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Valid agent-ready production report: ${reportPath}`);
}
