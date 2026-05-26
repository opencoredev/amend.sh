import { describe, expect, test } from "bun:test";

import { Amend } from "../packages/sdk/src/index";

describe("Amend SDK source events", () => {
  test("imports generic source events through the owner endpoint", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json(
          {
            sourceEventId: "source-event-1",
            status: "created",
          },
          { status: 201 },
        );
      },
      project: "acme",
      token: "secret-token",
    });

    const result = await amend.importSourceEvent({
      externalId: "slack:feedback:123",
      kind: "customer_signal",
      labels: ["feedback", "enterprise"],
      provider: "slack",
      title: "Request from #feedback",
      url: "https://slack.example.test/archives/C123/p123",
    });

    expect(result).toMatchObject({ status: "created" });
    expect(requests).toHaveLength(1);
    expect(requests[0].method).toBe("POST");
    expect(requests[0].url).toBe("https://updates.example.test/api/v1/acme/source-events");
    expect(requests[0].headers.get("authorization")).toBe("Bearer secret-token");
    expect(await requests[0].json()).toEqual({
      externalId: "slack:feedback:123",
      kind: "customer_signal",
      labels: ["feedback", "enterprise"],
      provider: "slack",
      title: "Request from #feedback",
      url: "https://slack.example.test/archives/C123/p123",
    });
  });

  test("fetches source events for agent evidence inspection", async () => {
    const requests: Request[] = [];
    const amend = new Amend({
      apiBaseUrl: "https://updates.example.test/api/v1",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push(request);
        return Response.json({
          sourceEvents: [
            {
              externalId: "slack:feedback:123",
              kind: "customer_signal",
              provider: "slack",
              title: "Request from #feedback",
            },
          ],
        });
      },
      project: "acme",
    });

    const sourceEvents = await amend.sourceEvents({
      kind: "customer_signal",
      limit: 5,
      provider: "slack",
    });

    expect(sourceEvents).toHaveLength(1);
    expect(sourceEvents[0]).toMatchObject({
      externalId: "slack:feedback:123",
      provider: "slack",
    });
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe(
      "https://updates.example.test/api/v1/acme/source-events?provider=slack&kind=customer_signal&limit=5",
    );
  });
});
