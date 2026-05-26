import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { runAmendCli } from "../packages/cli/src/cli";

export const defaultCliEndpoint = "https://config.example.test/api/v1";
export const defaultCliProject = "config";
export const defaultCliToken = "config-token";

export async function withTempCliDir<T>(callback: (tempDir: string) => Promise<T>) {
  const tempDir = await mkdtemp(join(tmpdir(), "amend-cli-"));
  try {
    return await callback(tempDir);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export function cliConfigPath(cwd: string) {
  return join(cwd, ".amend", "config.json");
}

export async function readCliConfig(cwd: string) {
  return JSON.parse(await readFile(cliConfigPath(cwd), "utf8")) as unknown;
}

export async function initCliConfig(
  cwd: string,
  options: {
    endpoint?: string;
    project?: string;
    token?: string;
  } = {},
) {
  const args = [
    "init",
    "--endpoint",
    options.endpoint ?? defaultCliEndpoint,
    "--project",
    options.project ?? defaultCliProject,
  ];
  if (options.token) {
    args.push("--token", options.token);
  }
  return await runAmendCli(args, {
    cwd,
    stdout: () => undefined,
  });
}
