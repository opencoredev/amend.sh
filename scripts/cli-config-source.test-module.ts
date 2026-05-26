import { expect, test } from "bun:test";
import { runAmendCli } from "../packages/cli/src/cli";
import {
  defaultCliToken,
  initCliConfig,
  readCliConfig,
  withTempCliDir,
} from "./cli-config-test-helpers";

export function registerCliConfigSourceTests() {
  test("initializes a local CLI config without storing a token by default", async () => {
    await withTempCliDir(async (tempDir) => {
      const output: string[] = [];
      const exitCode = await runAmendCli(
        ["init", "--endpoint", "https://updates.example.test/api/v1", "--project", "acme"],
        {
          cwd: tempDir,
          stdout: (message) => output.push(message),
        },
      );

      expect(exitCode).toBe(0);
      expect(JSON.parse(output[0])).toMatchObject({
        endpoint: "https://updates.example.test/api/v1",
        project: "acme",
        tokenStored: false,
      });
      expect(await readCliConfig(tempDir)).toEqual({
        apiBaseUrl: "https://updates.example.test/api/v1",
        project: "acme",
      });
      expect(output[0]).not.toContain("secret");
    });
  });

  test("reads endpoint, project, and explicit token from local CLI config", async () => {
    await withTempCliDir(async (tempDir) => {
      const output: string[] = [];
      const requests: Request[] = [];

      await initCliConfig(tempDir, {
        endpoint: "https://updates.example.test/api/v1",
        project: "acme",
        token: defaultCliToken,
      });
      const exitCode = await runAmendCli(["source", "list"], {
        cwd: tempDir,
        fetch: async (input, init) => {
          const request = new Request(input, init);
          requests.push(request);
          return Response.json({ sourceEvents: [] });
        },
        stdout: (message) => output.push(message),
      });

      expect(exitCode).toBe(0);
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe("https://updates.example.test/api/v1/acme/source-events");
      expect(requests[0].headers.get("authorization")).toBe(`Bearer ${defaultCliToken}`);
      expect(JSON.parse(output[0]).sourceEvents).toEqual([]);
    });
  });

  test("flags and env override local CLI config", async () => {
    await withTempCliDir(async (tempDir) => {
      const requests: Request[] = [];

      await initCliConfig(tempDir, { token: defaultCliToken });
      const exitCode = await runAmendCli(
        [
          "source",
          "list",
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
          fetch: async (input, init) => {
            requests.push(new Request(input, init));
            return Response.json({ sourceEvents: [] });
          },
          stdout: () => undefined,
        },
      );

      expect(exitCode).toBe(0);
      expect(requests).toHaveLength(1);
      expect(requests[0].url).toBe("https://flag.example.test/api/v1/flag/source-events");
      expect(requests[0].headers.get("authorization")).toBe("Bearer flag-token");
    });
  });
}
