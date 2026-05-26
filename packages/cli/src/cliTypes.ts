import type { Amend } from "@amend/sdk";
import type { ParsedArgs } from "./cliArgs";
import type { CliEnv, EffectiveCliConfiguration } from "./cliRuntime";

export type CliIo = {
  cwd?: string;
  env?: CliEnv;
  fetch?: typeof fetch;
  stderr?: (message: string) => void;
  stdout?: (message: string) => void;
};

export type CliContext = {
  amend: Amend;
  configuration: EffectiveCliConfiguration;
  cwd: string;
  endpoint: string;
  env: CliEnv;
  fetch: typeof fetch;
  flags: ParsedArgs;
  project: string;
  token?: string;
};
