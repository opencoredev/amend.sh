import { describe, expect, test } from "bun:test";

import { Amend } from "../packages/sdk/src/index";

describe("Amend SDK user updates and preferences", () => {
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
