import { describe, expect, test } from "bun:test";

import { Amend } from "../packages/sdk/src/index";

describe("Amend SDK automation APIs", () => {
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
});
