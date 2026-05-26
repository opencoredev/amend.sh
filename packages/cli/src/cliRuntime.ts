import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { asRecord } from "./cliOutput";
import {
  checkForUpdate,
  localVersionMetadata,
  resolveOpenApiPath,
  updateCheckPosture,
} from "./cliVersionRuntime";

export type CliEnv = Record<string, string | undefined>;

export type CliConfig = {
  apiBaseUrl?: string;
  endpoint?: string;
  project?: string;
  readScopes?: string[];
  token?: string;
  workspace?: string;
  writeScopes?: string[];
};

export type EffectiveCliConfiguration = {
  configExists: boolean;
  configPath: string;
  configuredReadScopes: string[];
  configuredReadScopesSource: string;
  endpointSource: string;
  projectSource: string;
  readScopes: string[];
  tokenSource: string;
  writeScopes: string[];
  writeScopesSource: string;
};

function readOpenApi(cwd: string) {
  return readFileSync(resolveOpenApiPath(cwd), "utf8");
}

function readCliConfig(cwd: string): CliConfig {
  const path = cliConfigPath(cwd);
  if (!existsSync(path)) {
    return {};
  }
  const value = JSON.parse(readFileSync(path, "utf8")) as unknown;
  const input = asRecord(value);
  return {
    apiBaseUrl: stringValue(input.apiBaseUrl),
    endpoint: stringValue(input.endpoint),
    project: stringValue(input.project),
    readScopes: scopeList(aliasValue(input, "readScopes", "read_scopes", "readScope")),
    token: stringValue(input.token),
    workspace: stringValue(input.workspace),
    writeScopes: scopeList(aliasValue(input, "writeScopes", "write_scopes", "writeScope")),
  };
}

function cliConfigDirectory(cwd: string) {
  return join(cwd, ".amend");
}

function cliConfigPath(cwd: string) {
  return join(cliConfigDirectory(cwd), "config.json");
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function resolveString(candidates: [string | undefined, string][], defaultValue: string) {
  const resolved = resolveOptionalString(candidates);
  return resolved.value
    ? resolved
    : {
        source: "default",
        value: defaultValue,
      };
}

function resolveOptionalString(candidates: [string | undefined, string][]) {
  for (const [value, source] of candidates) {
    if (value) {
      return { source, value };
    }
  }
  return { source: "none", value: undefined };
}

function resolveScopes(candidates: [string[] | undefined, string][]) {
  for (const [value, source] of candidates) {
    if (value && value.length > 0) {
      return { source, value };
    }
  }
  return { source: "none", value: [] };
}

function scopeList(value: unknown): string[] | undefined {
  const scopes = parseScopeList(value);
  return scopes.length ? scopes : undefined;
}

function parseScopeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return unique(value.flatMap((item) => (typeof item === "string" ? parseScopeList(item) : [])));
  }
  if (typeof value !== "string") {
    return [];
  }
  return unique(
    value
      .split(/[,;\s]+/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function aliasValue(input: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (input[key] !== undefined) return input[key];
  }
  return undefined;
}

export {
  checkForUpdate,
  cliConfigDirectory,
  cliConfigPath,
  localVersionMetadata,
  parseScopeList,
  readCliConfig,
  readOpenApi,
  resolveOpenApiPath,
  resolveOptionalString,
  resolveScopes,
  resolveString,
  scopeList,
  updateCheckPosture,
  unique,
};
