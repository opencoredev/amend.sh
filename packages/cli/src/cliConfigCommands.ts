import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { cliConfigDirectory, cliConfigPath, type CliConfig } from "./cliRuntime";
import type { CliContext } from "./cliTypes";

export function initConfig(context: CliContext) {
  const configDirectory = cliConfigDirectory(context.cwd);
  const configPath = cliConfigPath(context.cwd);
  const config: CliConfig = {
    apiBaseUrl: context.endpoint,
    project: context.project,
  };
  if (context.flags.token) {
    config.token = context.flags.token;
  }

  mkdirSync(configDirectory, { recursive: true });
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
  chmodSync(configPath, 0o600);

  return {
    configPath,
    endpoint: context.endpoint,
    next: [
      "Run `bun packages/cli/src/index.ts doctor` to verify the local CLI configuration.",
      "Use AMEND_API_TOKEN or `--token` for shared machines; `amend init --token ...` stores a local token only when explicitly requested.",
    ],
    project: context.project,
    tokenStored: Boolean(context.flags.token),
  };
}

export function configShow(context: CliContext) {
  return {
    configExists: context.configuration.configExists,
    configPath: context.configuration.configPath,
    endpoint: context.endpoint,
    endpointSource: context.configuration.endpointSource,
    project: context.project,
    projectSource: context.configuration.projectSource,
    readOnlyDefault: true,
    tokenConfigured: Boolean(context.token),
    tokenSource: context.configuration.tokenSource,
    workspace: context.project,
    workspaceSource: context.configuration.projectSource,
  };
}

export function permissionsInspect(context: CliContext) {
  const writeConfigured = context.configuration.writeScopes.length > 0;
  return {
    configExists: context.configuration.configExists,
    configPath: context.configuration.configPath,
    endpoint: context.endpoint,
    project: context.project,
    readOnlyDefault: true,
    safeReadScopes: context.configuration.readScopes,
    configuredReadScopes: context.configuration.configuredReadScopes,
    configuredReadScopesSource: context.configuration.configuredReadScopesSource,
    tokenConfigured: Boolean(context.token),
    tokenSource: context.configuration.tokenSource,
    warning: writeConfigured
      ? "Write scopes are configured; use them only for explicitly authorized workspace actions."
      : "No write scopes are configured. Treat CLI and agent usage as read-only.",
    workspace: context.project,
    writeConfigured,
    writeScopes: context.configuration.writeScopes,
    writeScopesSource: context.configuration.writeScopesSource,
  };
}
