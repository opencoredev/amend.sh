import type { Check } from "./agent-ready-completion-audit-context";

export function makeCheckAdder(checks: Check[], jsonOutput: boolean) {
  return (name: string, ok: boolean, detail?: string) => {
    checks.push({ detail, name, ok });
    if (!jsonOutput) {
      console.log(`${ok ? "PASS" : "NEEDS"} ${name}${detail ? ` - ${detail}` : ""}`);
    }
  };
}

export function includesAll(content: string, values: string[]) {
  return values.every((value) => content.includes(value));
}

export function excludesAll(content: string, values: string[]) {
  return values.every((value) => !content.includes(value));
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
