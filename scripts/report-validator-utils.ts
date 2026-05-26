export type AddValidationError = (path: string, message: string) => void;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function hasOnlyKeys(
  addError: AddValidationError,
  path: string,
  value: Record<string, unknown>,
  keys: string[],
) {
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) {
      addError(`${path}.${key}`, "unexpected property");
    }
  }
}

export function validateStringArray(
  addError: AddValidationError,
  path: string,
  value: unknown,
  allowEmpty = true,
) {
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

export function validateExactStringArray(
  addError: AddValidationError,
  path: string,
  value: unknown,
  expected: string[],
) {
  validateStringArray(addError, path, value);
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

export function validateOrigins(addError: AddValidationError, path: string, value: unknown) {
  if (!isRecord(value)) {
    addError(path, "must be an object");
    return;
  }

  hasOnlyKeys(addError, path, value, ["docs", "web"]);
  for (const key of ["docs", "web"]) {
    if (typeof value[key] !== "string" || value[key].length === 0) {
      addError(`${path}.${key}`, "must be a non-empty string");
    }
  }
}

export function validateChecks(addError: AddValidationError, path: string, value: unknown) {
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
    hasOnlyKeys(addError, checkPath, check, ["detail", "name", "ok"]);
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
