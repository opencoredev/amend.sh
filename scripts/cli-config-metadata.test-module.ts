import { expect, test } from "bun:test";
import { runAmendCli } from "../packages/cli/src/cli";
import {
  cliConfigPath,
  defaultCliToken,
  initCliConfig,
  withTempCliDir,
} from "./cli-config-test-helpers";

export function registerCliConfigMetadataTests() {
  test("shows effective config metadata without leaking configured tokens", async () => {
    await withTempCliDir(async (tempDir) => {
      const output: string[] = [];

      await initCliConfig(tempDir, { token: defaultCliToken });
      const exitCode = await runAmendCli(["config", "show"], {
        cwd: tempDir,
        env: {
          AMEND_API_BASE_URL: "https://env.example.test/api/v1",
          AMEND_API_TOKEN: "env-token",
          AMEND_PROJECT: "env",
        },
        stdout: (message) => output.push(message),
      });

      expect(exitCode).toBe(0);
      const payload = JSON.parse(output[0]);
      expect(payload).toMatchObject({
        configExists: true,
        endpoint: "https://env.example.test/api/v1",
        endpointSource: "env:AMEND_API_BASE_URL",
        project: "env",
        projectSource: "env:AMEND_PROJECT",
        readOnlyDefault: true,
        tokenConfigured: true,
        tokenSource: "env:AMEND_API_TOKEN",
        workspace: "env",
      });
      expect(payload.configPath).toBe(cliConfigPath(tempDir));
      expect(output[0]).not.toContain(defaultCliToken);
      expect(output[0]).not.toContain("env-token");
    });
  });

  test("shows flag precedence in config metadata without leaking token flags", async () => {
    await withTempCliDir(async (tempDir) => {
      const output: string[] = [];

      await initCliConfig(tempDir, { token: defaultCliToken });
      const exitCode = await runAmendCli(
        [
          "config",
          "show",
          "--endpoint",
          "https://flag.example.test/api/v1",
          "--project",
          "flag",
          "--token",
          "flag-token",
        ],
        {
          cwd: tempDir,
          env: {
            AMEND_API_BASE_URL: "https://env.example.test/api/v1",
            AMEND_API_TOKEN: "env-token",
            AMEND_PROJECT: "env",
          },
          stdout: (message) => output.push(message),
        },
      );

      expect(exitCode).toBe(0);
      expect(JSON.parse(output[0])).toMatchObject({
        endpoint: "https://flag.example.test/api/v1",
        endpointSource: "flag",
        project: "flag",
        projectSource: "flag",
        tokenConfigured: true,
        tokenSource: "flag",
      });
      expect(output[0]).not.toContain("flag-token");
      expect(output[0]).not.toContain("env-token");
      expect(output[0]).not.toContain(defaultCliToken);
    });
  });
}
