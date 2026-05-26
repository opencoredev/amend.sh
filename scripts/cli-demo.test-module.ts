import { expect, test } from "bun:test";
import { runAmendCli } from "../packages/cli/src/cli";

export function registerCliDemoTests() {
  test("prints deterministic demo status as JSON", async () => {
    const output: string[] = [];
    const exitCode = await runAmendCli(["status", "--demo"], {
      stdout: (message) => output.push(message),
    });

    expect(exitCode).toBe(0);
    expect(JSON.parse(output[0])).toMatchObject({
      mode: "demo",
      project: "amend-labs",
      counts: {
        feedback: 2,
      },
    });
  });

  test("searches demo requests for coding-agent demand context", async () => {
    const output: string[] = [];
    const exitCode = await runAmendCli(
      ["requests", "search", "--demo", "--query", "coding agent"],
      {
        stdout: (message) => output.push(message),
      },
    );

    expect(exitCode).toBe(0);
    const payload = JSON.parse(output[0]);
    expect(payload.matches).toHaveLength(1);
    expect(payload.matches[0].stableKey).toBe("feedback-agent-demand-context");
  });

  test("lists demo build briefs for coding agents", async () => {
    const output: string[] = [];
    const exitCode = await runAmendCli(["briefs", "list", "--demo", "--status", "in_review"], {
      stdout: (message) => output.push(message),
    });

    expect(exitCode).toBe(0);
    const payload = JSON.parse(output[0]);
    expect(payload.buildBriefs).toHaveLength(1);
    expect(payload.buildBriefs[0]).toMatchObject({
      stableKey: "brief-agent-demand-context",
      status: "in_review",
    });
    expect(payload.buildBriefs[0].suggestedFiles).toContain("packages/sdk/src/index.ts");
  });

  test("lists demo agent run history", async () => {
    const output: string[] = [];
    const exitCode = await runAmendCli(["agent", "runs", "--demo"], {
      stdout: (message) => output.push(message),
    });

    expect(exitCode).toBe(0);
    const payload = JSON.parse(output[0]);
    expect(payload.runs).toHaveLength(1);
    expect(payload.runs[0]).toMatchObject({
      provider: "fallback",
      status: "completed_with_fallback",
    });
  });
}
