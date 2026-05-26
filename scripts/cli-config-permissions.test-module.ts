import { expect, test } from "bun:test";
import { runAmendCli } from "../packages/cli/src/cli";

export function registerCliConfigPermissionTests() {
  test("inspects permissions as read-only by default without contacting the API", async () => {
    const output: string[] = [];
    const exitCode = await runAmendCli(["permissions", "inspect"], {
      env: {},
      fetch: async () => {
        throw new Error("permissions inspect should not fetch");
      },
      stdout: (message) => output.push(message),
    });

    expect(exitCode).toBe(0);
    const payload = JSON.parse(output[0]);
    expect(payload).toMatchObject({
      readOnlyDefault: true,
      tokenConfigured: false,
      tokenSource: "none",
      warning: "No write scopes are configured. Treat CLI and agent usage as read-only.",
      writeConfigured: false,
      writeScopes: [],
      writeScopesSource: "none",
    });
    expect(payload.safeReadScopes).toContain("portal:read");
    expect(payload.safeReadScopes).toContain("source-events:read");
    expect(payload.safeReadScopes).toContain("build-briefs:read");
  });

  test("inspects explicitly configured write scopes without leaking token values", async () => {
    const output: string[] = [];
    const exitCode = await runAmendCli(["permissions", "inspect"], {
      env: {
        AMEND_API_TOKEN: "env-secret-token",
        AMEND_READ_SCOPES: "portal:read,source-events:read",
        AMEND_WRITE_SCOPES: "source-events:write,changelog:edit",
      },
      stdout: (message) => output.push(message),
    });

    expect(exitCode).toBe(0);
    expect(JSON.parse(output[0])).toMatchObject({
      configuredReadScopes: ["portal:read", "source-events:read"],
      configuredReadScopesSource: "env:AMEND_READ_SCOPES",
      tokenConfigured: true,
      tokenSource: "env:AMEND_API_TOKEN",
      warning:
        "Write scopes are configured; use them only for explicitly authorized workspace actions.",
      writeConfigured: true,
      writeScopes: ["source-events:write", "changelog:edit"],
      writeScopesSource: "env:AMEND_WRITE_SCOPES",
    });
    expect(output[0]).not.toContain("env-secret-token");
  });
}
