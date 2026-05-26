import { expect, test } from "bun:test";
import { runAmendCli } from "../packages/cli/src/cli";

export function registerCliRuntimeTests() {
  test("doctor reports provider keys as demo mode without secrets", async () => {
    const output: string[] = [];
    const exitCode = await runAmendCli(["doctor"], {
      cwd: process.cwd(),
      env: {},
      fetch: async () => {
        throw new Error("doctor should not fetch release metadata without --check");
      },
      stdout: (message) => output.push(message),
    });

    expect(exitCode).toBe(0);
    const payload = JSON.parse(output[0]);
    expect(payload.checks.some((check: { status: string }) => check.status === "demo_mode")).toBe(
      true,
    );
    expect(
      payload.checks.some((check: { name: string; status: string }) => {
        return check.name === "update check" && check.status === "not_checked";
      }),
    ).toBe(true);
    expect(output[0]).not.toContain("secret");
  });

  test("prints local version metadata without contacting the server", async () => {
    const output: string[] = [];
    const exitCode = await runAmendCli(["version"], {
      cwd: process.cwd(),
      env: { AMEND_COMMIT_SHA: "abc123", AMEND_VERSION: "1.2.3" },
      stdout: (message) => output.push(message),
    });

    expect(exitCode).toBe(0);
    const payload = JSON.parse(output[0]);
    expect(payload.local).toMatchObject({
      commit: "abc123",
      source: "env",
      version: "1.2.3",
    });
    expect(payload.server).toBeUndefined();
  });

  test("checks for newer public release metadata when requested", async () => {
    const output: string[] = [];
    const exitCode = await runAmendCli(["version", "--check"], {
      cwd: process.cwd(),
      env: {
        AMEND_UPDATE_CHECK_URL: "https://updates.example.test/latest",
        AMEND_VERSION: "1.2.3",
      },
      fetch: async () =>
        new Response(
          JSON.stringify({ html_url: "https://example.test/releases/v1.3.0", tag_name: "v1.3.0" }),
        ),
      stdout: (message) => output.push(message),
    });

    expect(exitCode).toBe(0);
    const payload = JSON.parse(output[0]);
    expect(payload.update).toMatchObject({
      checked: true,
      latestVersion: "v1.3.0",
      status: "update_available",
      updateAvailable: true,
    });
  });

  test("generates development API tokens without provider secrets", async () => {
    const output: string[] = [];
    const exitCode = await runAmendCli(["token", "create", "--limit", "16"], {
      stdout: (message) => output.push(message),
    });

    expect(exitCode).toBe(0);
    const payload = JSON.parse(output[0]);
    expect(payload.token).toStartWith("amend_dev_");
    expect(payload.env).toStartWith("AMEND_API_TOKEN=amend_dev_");
    expect(payload.persisted).toBe(false);
    expect(payload.next.some((step: string) => step.includes("convex env set"))).toBe(true);
    expect(output[0]).not.toContain("secret");
  });

  test("prints only the token when requested", async () => {
    const output: string[] = [];
    const exitCode = await runAmendCli(["tokens", "generate", "--limit", "16", "--plain"], {
      stdout: (message) => output.push(message),
    });

    expect(exitCode).toBe(0);
    expect(output).toHaveLength(1);
    expect(output[0]).toStartWith("amend_dev_");
  });
}
