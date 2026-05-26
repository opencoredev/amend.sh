import { describe, expect, test } from "bun:test";

import { Amend, AmendApiError } from "../packages/sdk/src/index";

describe("Amend SDK core requests", () => {
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

  test("fetches deployment version metadata outside a workspace scope", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({
          apiVersion: "v1",
          name: "amend",
          source: "backend",
          updateCheckDisabled: false,
          version: "0.1.0-beta",
        });
      },
      project: "acme",
      token: "secret-token",
    });

    const version = await amend.version();

    expect(version).toMatchObject({ apiVersion: "v1", version: "0.1.0-beta" });
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("https://updates.example.test/api/v1/version");
    expect(requests[0].headers.get("authorization")).toBe("Bearer secret-token");
  });
});
