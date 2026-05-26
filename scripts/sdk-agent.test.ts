import { describe, expect, test } from "bun:test";

import { Amend } from "../packages/sdk/src/index";

describe("Amend SDK agent APIs", () => {
  test("fetches filtered build briefs for coding agents", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({
          buildBriefs: [
            {
              stableKey: "brief-agent-demand-context",
              status: "approved",
              suggestedFiles: ["packages/sdk/src/index.ts"],
              title: "Agent-readable demand context",
            },
          ],
        });
      },
      project: "acme",
    });

    const briefs = await amend.buildBriefs({ projectSlug: "app", status: "approved" });

    expect(briefs).toHaveLength(1);
    expect(briefs[0]).toMatchObject({
      stableKey: "brief-agent-demand-context",
      status: "approved",
    });
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe(
      "https://updates.example.test/api/v1/acme/build-briefs?projectSlug=app&status=approved",
    );
  });

  test("fetches persisted proactive agent run history", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({
          runs: [
            {
              decisionCount: 2,
              provider: "fallback",
              providerConfigured: false,
              stableKey: "agent-run-demo",
              status: "completed_with_fallback",
            },
          ],
        });
      },
      project: "acme",
    });

    const runs = await amend.agentRuns({ projectSlug: "app" });

    expect(runs).toHaveLength(1);
    expect(runs[0]).toMatchObject({
      stableKey: "agent-run-demo",
      status: "completed_with_fallback",
    });
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe(
      "https://updates.example.test/api/v1/acme/agent-runs?projectSlug=app",
    );
  });
});
