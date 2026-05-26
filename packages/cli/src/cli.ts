import { existsSync } from "node:fs";

import { Amend } from "@amend/sdk";
import { parseArgs } from "./cliArgs";
import {
  agentRun,
  agentRuns,
  briefsList,
  changelogDraft,
  configShow,
  doctor,
  feedbackList,
  generateApiToken,
  generateApiTokenValue,
  githubSync,
  initConfig,
  permissionsInspect,
  requestSearch,
  roadmapList,
  sourceImport,
  sourceList,
  status,
  version,
} from "./cliCommands";
import { defaultEndpoint, defaultProject, safeReadScopes } from "./cliDemoData";
import { helpText } from "./cliHelp";
import { errorPayload, write } from "./cliOutput";
import {
  cliConfigPath,
  readCliConfig,
  readOpenApi,
  resolveOptionalString,
  resolveScopes,
  resolveString,
  scopeList,
  unique,
} from "./cliRuntime";
import type { CliContext, CliIo } from "./cliTypes";

export async function runAmendCli(argv: string[], io: CliIo = {}) {
  const env = io.env ?? process.env;
  const stdout = io.stdout ?? ((message) => console.log(message));
  const stderr = io.stderr ?? ((message) => console.error(message));
  const cwd = io.cwd ?? process.cwd();
  const flags = parseArgs(argv);
  const [command = "help", subcommand = ""] = flags.args;
  const configPath = cliConfigPath(cwd);
  const configExists = existsSync(configPath);
  const config = readCliConfig(cwd);
  const projectResolution = resolveString(
    [
      [flags.project, "flag"],
      [env.AMEND_PROJECT, "env:AMEND_PROJECT"],
      [env.AMEND_WORKSPACE, "env:AMEND_WORKSPACE"],
      [config.project, "config:project"],
      [config.workspace, "config:workspace"],
    ],
    defaultProject,
  );
  const endpointResolution = resolveString(
    [
      [flags.endpoint, "flag"],
      [env.AMEND_API_BASE_URL, "env:AMEND_API_BASE_URL"],
      [config.apiBaseUrl, "config:apiBaseUrl"],
      [config.endpoint, "config:endpoint"],
    ],
    defaultEndpoint,
  );
  const tokenResolution = resolveOptionalString([
    [flags.token, "flag"],
    [env.AMEND_API_TOKEN, "env:AMEND_API_TOKEN"],
    [config.token, "config:token"],
  ]);
  const readScopeResolution = resolveScopes([
    [flags.readScopes, "flag"],
    [scopeList(env.AMEND_READ_SCOPES), "env:AMEND_READ_SCOPES"],
    [config.readScopes, "config:readScopes"],
  ]);
  const writeScopeResolution = resolveScopes([
    [flags.writeScopes, "flag"],
    [scopeList(env.AMEND_WRITE_SCOPES), "env:AMEND_WRITE_SCOPES"],
    [config.writeScopes, "config:writeScopes"],
  ]);
  const project = projectResolution.value;
  const endpoint = endpointResolution.value;
  const token = tokenResolution.value;
  const fetchImpl = io.fetch ?? fetch;
  const context: CliContext = {
    amend: new Amend({
      apiBaseUrl: endpoint,
      fetch: fetchImpl,
      project,
      token,
    }),
    configuration: {
      configExists,
      configPath,
      configuredReadScopes: readScopeResolution.value,
      configuredReadScopesSource: readScopeResolution.source,
      endpointSource: endpointResolution.source,
      projectSource: projectResolution.source,
      readScopes: unique([...safeReadScopes, ...readScopeResolution.value]),
      tokenSource: tokenResolution.source,
      writeScopes: writeScopeResolution.value,
      writeScopesSource: writeScopeResolution.source,
    },
    cwd,
    endpoint,
    env,
    fetch: fetchImpl,
    flags,
    project,
    token,
  };

  try {
    switch (`${command}${subcommand ? ` ${subcommand}` : ""}`) {
      case "help":
      case "--help":
      case "-h":
        stdout(helpText());
        return 0;
      case "init":
        return await write(stdout, flags, initConfig(context));
      case "config show":
      case "config inspect":
        return await write(stdout, flags, configShow(context));
      case "permissions inspect":
      case "permission inspect":
      case "scopes inspect":
        return await write(stdout, flags, permissionsInspect(context));
      case "status":
        return await write(stdout, flags, await status(context));
      case "feedback list":
        return await write(stdout, flags, await feedbackList(context));
      case "requests search":
        return await write(stdout, flags, await requestSearch(context));
      case "agent run":
        return await write(stdout, flags, await agentRun(context));
      case "agent runs":
      case "agent history":
      case "runs list":
        return await write(stdout, flags, await agentRuns(context));
      case "agent briefs":
      case "briefs list":
      case "build-briefs list":
        return await write(stdout, flags, await briefsList(context));
      case "source list":
      case "sources list":
      case "source-events list":
        return await write(stdout, flags, await sourceList(context));
      case "source import":
      case "sources import":
      case "source-events import":
        return await write(stdout, flags, await sourceImport(context));
      case "changelog draft":
        return await write(stdout, flags, await changelogDraft(context));
      case "roadmap list":
        return await write(stdout, flags, await roadmapList(context));
      case "github sync":
        return await write(stdout, flags, githubSync(context));
      case "openapi export":
        stdout(readOpenApi(context.cwd));
        return 0;
      case "doctor":
        return await write(stdout, flags, await doctor(context));
      case "version":
        return await write(stdout, flags, await version(context));
      case "token create":
      case "tokens create":
      case "token generate":
      case "tokens generate":
        if (flags.plain) {
          stdout(generateApiTokenValue(flags.limit));
          return 0;
        }
        return await write(stdout, flags, generateApiToken(context));
      default:
        stderr(`Unknown command: ${flags.args.join(" ") || "(none)"}`);
        stderr(helpText());
        return 1;
    }
  } catch (error) {
    const payload = errorPayload(error);
    stderr(JSON.stringify(payload, null, 2));
    return 1;
  }
}
