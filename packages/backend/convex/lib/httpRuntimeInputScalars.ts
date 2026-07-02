export function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  return value;
}

export function optionalBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

export function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : undefined;
}

export function timestampValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    const numeric = Number.parseInt(trimmed, 10);
    if (Number.isFinite(numeric) && String(numeric) === trimmed) {
      return numeric;
    }
    return dateValue(trimmed);
  }
  return undefined;
}

export function dateValue(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : undefined;
}

export function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const trimmed = value.trim();
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isFinite(parsed) && String(parsed) === trimmed ? parsed : undefined;
  }
  return undefined;
}
