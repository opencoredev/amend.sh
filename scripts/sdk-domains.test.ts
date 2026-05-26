import { describe, expect, test } from "bun:test";

import { Amend } from "../packages/sdk/src/index";

describe("Amend SDK custom domains", () => {
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
});
