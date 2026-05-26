import { describe, expect, test } from "bun:test";

import { Amend } from "../packages/sdk/src/index";

describe("Amend SDK admin APIs", () => {
  test("updates protected portal customization settings", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({
          portalSettings: {
            feedbackMode: "authenticated",
            headline: "Launch notes",
            roadmapVisibility: "public",
          },
        });
      },
      project: "acme",
      token: "secret-token",
    });

    await amend.updatePortalSettings({
      feedbackMode: "authenticated",
      headline: "Launch notes",
      roadmapVisibility: "public",
    });

    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("POST");
    expect(requests[0].url).toBe("https://updates.example.test/api/v1/acme/portal-settings");
    expect(requests[0].headers.get("authorization")).toBe("Bearer secret-token");
    expect(await requests[0].json()).toEqual({
      feedbackMode: "authenticated",
      headline: "Launch notes",
      roadmapVisibility: "public",
    });
  });

  test("upserts workspace members through the protected members endpoint", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({
          email: "reviewer@example.com",
          permissions: ["review:approve", "changelog:edit"],
          role: "reviewer",
        });
      },
      project: "acme",
      token: "secret-token",
    });

    await amend.upsertWorkspaceMember({
      email: "reviewer@example.com",
      name: "Release reviewer",
      permissions: ["review:approve", "changelog:edit"],
      role: "reviewer",
    });

    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("POST");
    expect(requests[0].url).toBe("https://updates.example.test/api/v1/acme/members");
    expect(requests[0].headers.get("authorization")).toBe("Bearer secret-token");
    expect(await requests[0].json()).toEqual({
      email: "reviewer@example.com",
      name: "Release reviewer",
      permissions: ["review:approve", "changelog:edit"],
      role: "reviewer",
    });
  });

  test("upserts integration connections through the protected integrations endpoint", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({
          direction: "outbound",
          displayName: "Slack release updates",
          provider: "slack",
          state: "planned",
        });
      },
      project: "acme",
      token: "secret-token",
    });

    await amend.upsertIntegration({
      config: { channel: "#product-updates" },
      direction: "outbound",
      displayName: "Slack release updates",
      provider: "slack",
      state: "planned",
    });

    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("POST");
    expect(requests[0].url).toBe("https://updates.example.test/api/v1/acme/integrations");
    expect(requests[0].headers.get("authorization")).toBe("Bearer secret-token");
    expect(await requests[0].json()).toEqual({
      config: { channel: "#product-updates" },
      direction: "outbound",
      displayName: "Slack release updates",
      provider: "slack",
      state: "planned",
    });
  });

  test("reads GitHub App install readiness", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({
          configured: true,
          installUrl: "https://github.com/apps/amend-sh/installations/new",
        });
      },
      project: "acme",
    });

    await amend.githubApp();

    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("GET");
    expect(requests[0].url).toBe("https://updates.example.test/api/v1/acme/github-app");
  });
});
