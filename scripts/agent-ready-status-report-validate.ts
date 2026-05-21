import { readFile } from "node:fs/promises";

const requireOk = process.argv.includes("--require-ok");
const reportPath =
  process.argv.find((arg) => !arg.startsWith("-") && arg !== Bun.argv[0] && arg !== Bun.argv[1]) ??
  "agent-ready-status.json";
const reportSchemaUrl = "https://docs.amend.sh/schemas/agent-ready-status-report.schema.json";
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

function validateDns(path: string, value: unknown) {
  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(path, value, ["docs", "web"]);
  validateDnsHost(`${path}.docs`, value.docs);
  validateDnsHost(`${path}.web`, value.web);
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
  if (
    Array.isArray(value.missing) &&
    Number.isInteger(value.passed) &&
    Number.isInteger(value.total) &&
    value.passed + value.missing.length !== value.total
  ) {
    addError(`${path}.missing`, "must account for total minus passed");
  }
}

function validateConsistency(report: Record<string, unknown>) {
  if (typeof report.ok === "boolean" && Array.isArray(report.blockers)) {
    if (report.ok && report.blockers.length > 0) {
      addError("$.blockers", "must be empty when ok is true");
    }
    if (!report.ok && report.blockers.length === 0) {
      addError("$.blockers", "must include at least one blocker when ok is false");
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
  if (isRecord(report.productionEnv)) {
    const { missing, passed, total } = report.productionEnv;
    if (Array.isArray(missing) && missing.length > 0) {
      addError("$.productionEnv.missing", "must be empty when --require-ok is used");
    }
    if (Number.isInteger(passed) && Number.isInteger(total) && passed !== total) {
      addError("$.productionEnv.passed", "must equal total when --require-ok is used");
    }
  }
  if (isRecord(report.dns)) {
    for (const hostKey of ["docs", "web"]) {
      const host = report.dns[hostKey];
      if (!isRecord(host)) {
        continue;
      }
      if (host.registered !== true) {
        addError(`$.dns.${hostKey}.registered`, "must be true when --require-ok is used");
      }
      if (host.delegated !== true) {
        addError(`$.dns.${hostKey}.delegated`, "must be true when --require-ok is used");
      }
      if (Array.isArray(host.records) && host.records.length === 0) {
        addError(`$.dns.${hostKey}.records`, "must not be empty when --require-ok is used");
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
    "dns",
    "nextGates",
    "ok",
    "origins",
    "productionEnv",
  ]);
  if (report.$schema !== reportSchemaUrl) {
    addError("$.$schema", `must be ${reportSchemaUrl}`);
  }
  validateStringArray("$.blockers", report.blockers);
  if (typeof report.checkedAt !== "string" || Number.isNaN(Date.parse(report.checkedAt))) {
    addError("$.checkedAt", "must be a date-time string");
  }
  validateDns("$.dns", report.dns);
  validateExactStringArray("$.nextGates", report.nextGates, requiredNextGates);
  if (typeof report.ok !== "boolean") {
    addError("$.ok", "must be a boolean");
  }
  validateOrigins("$.origins", report.origins);
  validateProductionEnv("$.productionEnv", report.productionEnv);
  validateConsistency(report);
}

if (errors.length > 0) {
  console.error(`Invalid agent-ready status report: ${reportPath}`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Valid agent-ready status report: ${reportPath}`);
}
