import { describe, expect, test } from "bun:test";

import { Amend, AmendApiError } from "../packages/sdk/src/index";

describe("Amend SDK", () => {
  test("sends bearer token and JSON body for mutating requests", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({ stableKey: "feedback-token-test" }, { status: 201 });
      },
      project: "acme",
      token: "secret-token",
    });

    await amend.submitRequest({
      body: "Please show source-linked notifications.",
      title: "Source-linked notifications",
    });

    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("POST");
    expect(requests[0].url).toBe("https://updates.example.test/api/v1/acme/feedback");
    expect(requests[0].headers.get("authorization")).toBe("Bearer secret-token");
    expect(requests[0].headers.get("content-type")).toContain("application/json");
    expect(await requests[0].json()).toEqual({
      body: "Please show source-linked notifications.",
      title: "Source-linked notifications",
    });
  });

  test("tracks account identity events for product-loop analytics", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({ event: "account_identify" }, { status: 201 });
      },
      project: "acme",
    });

    await amend.identifyAccount("acct-1", { plan: "team" });

    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("https://updates.example.test/api/v1/acme/events");
    expect(await requests[0].json()).toEqual({
      accountId: "acct-1",
      event: "account_identify",
      metadata: { plan: "team" },
    });
  });

  test("throws an AmendApiError with response payload on failures", async () => {
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async () => Response.json({ error: "Unauthorized" }, { status: 401 }),
      project: "acme",
    });

    await expect(amend.settings()).rejects.toMatchObject({
      payload: { error: "Unauthorized" },
      status: 401,
    } satisfies Partial<AmendApiError>);
  });

  test("creates checkout sessions through the protected billing endpoint", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({
          checkoutUrl: "https://checkout.stripe.com/c/pay/cs_test",
          provider: "stripe",
        });
      },
      project: "acme",
      token: "secret-token",
    });

    await amend.createCheckoutSession({
      customerEmail: "owner@example.com",
      seats: 5,
      tier: "pro",
    });

    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("https://updates.example.test/api/v1/acme/checkout");
    expect(requests[0].headers.get("authorization")).toBe("Bearer secret-token");
    expect(await requests[0].json()).toEqual({
      customerEmail: "owner@example.com",
      seats: 5,
      tier: "pro",
    });
  });

  test("requests source-linked AI changelog drafts through the protected drafts endpoint", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({
          body: "Webhook retry status shipped with source evidence attached.",
          model: "dry-run",
          provider: "dry-run",
          summary: "Drafted from pull request source evidence.",
          title: "Webhook retry status",
        });
      },
      project: "acme",
      token: "secret-token",
    });

    const draft = await amend.draftChangelog({
      dryRun: true,
      kind: "pull_request",
      sourceLinks: [
        {
          provider: "github",
          title: "Show webhook retry status",
          url: "https://github.com/acme/app/pull/231",
        },
      ],
      title: "Webhook retry status",
    });

    expect(draft).toMatchObject({
      provider: "dry-run",
      title: "Webhook retry status",
    });
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("https://updates.example.test/api/v1/acme/drafts");
    expect(requests[0].headers.get("authorization")).toBe("Bearer secret-token");
    expect(await requests[0].json()).toEqual({
      dryRun: true,
      kind: "pull_request",
      sourceLinks: [
        {
          provider: "github",
          title: "Show webhook retry status",
          url: "https://github.com/acme/app/pull/231",
        },
      ],
      title: "Webhook retry status",
    });
  });

  test("records votes, comments, and reactions as feedback interactions", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({ interactionId: "interaction-test" }, { status: 201 });
      },
      project: "acme",
    });

    await amend.vote("feedback-123", "user-1");
    await amend.comment("feedback-123", "This would unblock our rollout.", "user-1");
    await amend.react("feedback-123", "heart", "user-1");

    expect(requests.map((request) => request.url)).toEqual([
      "https://updates.example.test/api/v1/acme/interactions",
      "https://updates.example.test/api/v1/acme/interactions",
      "https://updates.example.test/api/v1/acme/interactions",
    ]);
    expect(await requests[0].json()).toEqual({
      feedbackKey: "feedback-123",
      kind: "vote",
      externalUserId: "user-1",
    });
    expect(await requests[1].json()).toEqual({
      body: "This would unblock our rollout.",
      feedbackKey: "feedback-123",
      kind: "comment",
      externalUserId: "user-1",
    });
    expect(await requests[2].json()).toEqual({
      feedbackKey: "feedback-123",
      kind: "reaction",
      reaction: "heart",
      externalUserId: "user-1",
    });
  });

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

  test("registers and verifies custom domains through protected endpoints", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({
          domain: "updates.example.com",
          status: "pending",
          verificationToken: "amend-updates-example-com-abc123",
        });
      },
      project: "acme",
      token: "secret-token",
    });

    await amend.registerCustomDomain("updates.example.com", "portal");
    await amend.verifyCustomDomain("updates.example.com");

    expect(requests.map((request) => request.url)).toEqual([
      "https://updates.example.test/api/v1/acme/domains",
      "https://updates.example.test/api/v1/acme/domains",
    ]);
    expect(requests.every((request) => request.method === "POST")).toBe(true);
    expect(
      requests.every((request) => request.headers.get("authorization") === "Bearer secret-token"),
    ).toBe(true);
    expect(await requests[0].json()).toEqual({
      domain: "updates.example.com",
      purpose: "portal",
    });
    expect(await requests[1].json()).toEqual({
      action: "verify",
      domain: "updates.example.com",
    });
  });

  test("resolves custom domains through the public host-routing endpoint", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({
          domain: "updates.example.com",
          purpose: "portal",
          resolved: true,
          workspace: { slug: "acme" },
        });
      },
      project: "acme",
    });

    await amend.resolveCustomDomain("updates.example.com", "portal");

    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("GET");
    expect(requests[0].url).toBe(
      "https://updates.example.test/api/v1/_/domains?domain=updates.example.com&purpose=portal",
    );
  });

  test("queries user-specific updates with the external user id", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({
          changelog: [],
          notifications: [{ stableKey: "notification-shipped" }],
          roadmap: [],
          seenUpdateKeys: ["notification-shipped"],
          user: { externalUserId: "user-1" },
        });
      },
      project: "acme",
    });

    await amend.updatesForUser("user-1");

    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("GET");
    expect(requests[0].url).toBe(
      "https://updates.example.test/api/v1/acme/updates?externalUserId=user-1",
    );
  });

  test("queries contact-specific updates by user id and email", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({
          notifications: [],
          user: { email: "user@example.com", externalUserId: "user-1" },
        });
      },
      project: "acme",
    });

    await amend.updatesForContact({ email: "user@example.com", userId: "user-1" });

    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("GET");
    expect(requests[0].url).toBe(
      "https://updates.example.test/api/v1/acme/updates?email=user%40example.com&externalUserId=user-1",
    );
  });

  test("sets digest preferences and exposes a tokenless unsubscribe helper", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({ mode: "digest", unsubscribed: false });
      },
      project: "acme",
      token: "secret-token",
    });

    await amend.setNotificationPreference({
      digestDay: "friday",
      digestHour: 16,
      email: "user@example.com",
      mode: "digest",
    });
    await amend.unsubscribe({ email: "user@example.com" });

    expect(requests.map((request) => request.url)).toEqual([
      "https://updates.example.test/api/v1/acme/preferences",
      "https://updates.example.test/api/v1/acme/preferences",
    ]);
    expect(requests[0].headers.get("authorization")).toBe("Bearer secret-token");
    expect(await requests[0].json()).toEqual({
      digestDay: "friday",
      digestHour: 16,
      email: "user@example.com",
      mode: "digest",
    });
    expect(await requests[1].json()).toEqual({
      email: "user@example.com",
      mode: "muted",
      unsubscribed: true,
    });
  });
});
