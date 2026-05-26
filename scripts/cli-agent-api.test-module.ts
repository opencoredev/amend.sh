import { expect, test } from "bun:test";
import { runAmendCli } from "../packages/cli/src/cli";

export function registerCliAgentApiTests() {
  test("lists API build briefs through the SDK client", async () => {
    const output: string[] = [];
    const requests: Request[] = [];
    const exitCode = await runAmendCli(
      [
        "agent",
        "briefs",
        "--endpoint",
        "https://updates.example.test/api/v1",
        "--project",
        "acme",
        "--status",
        "approved",
      ],
      {
        fetch: async (input, init) => {
          const request = new Request(input, init);
          requests.push(request);
          return Response.json({
            buildBriefs: [
              {
                stableKey: "brief-live-agent-context",
                status: "approved",
                title: "Live agent context",
              },
            ],
          });
        },
        stdout: (message) => output.push(message),
      },
    );

    expect(exitCode).toBe(0);
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe(
      "https://updates.example.test/api/v1/acme/build-briefs?status=approved",
    );
    const payload = JSON.parse(output[0]);
    expect(payload.buildBriefs[0].stableKey).toBe("brief-live-agent-context");
  });

  test("lists API agent run history through the SDK client", async () => {
    const output: string[] = [];
    const requests: Request[] = [];
    const exitCode = await runAmendCli(
      ["agent", "runs", "--endpoint", "https://updates.example.test/api/v1", "--project", "acme"],
      {
        fetch: async (input, init) => {
          const request = new Request(input, init);
          requests.push(request);
          return Response.json({
            runs: [
              {
                stableKey: "agent-run-live",
                status: "completed",
              },
            ],
          });
        },
        stdout: (message) => output.push(message),
      },
    );

    expect(exitCode).toBe(0);
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("https://updates.example.test/api/v1/acme/agent-runs");
    const payload = JSON.parse(output[0]);
    expect(payload.runs[0].stableKey).toBe("agent-run-live");
  });
}
