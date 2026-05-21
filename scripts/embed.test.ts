import { describe, expect, test } from "bun:test";

import { loadAmendPanelData } from "../packages/sdk/src/embed";

describe("Amend embed", () => {
  test("loads user-specific shipped updates when a user id is provided", async () => {
    const calls: string[] = [];
    const data = await loadAmendPanelData(
      {
        portal: async () => {
          calls.push("portal");
          return { changelog: [], roadmap: [] };
        },
        updatesForUser: async (userId: string) => {
          calls.push(`updates:${userId}`);
          return {
            notifications: [{ body: "Webhook retries shipped.", title: "Requested work shipped" }],
            roadmap: [{ status: "shipped", title: "Webhook retries" }],
            seenUpdateKeys: [],
            user: { externalUserId: userId },
          };
        },
      },
      "user-1",
    );

    expect(calls).toEqual(["updates:user-1"]);
    expect(data.notifications?.[0]?.title).toBe("Requested work shipped");
  });

  test("loads generic portal data when no user id is provided", async () => {
    const calls: string[] = [];
    await loadAmendPanelData({
      portal: async () => {
        calls.push("portal");
        return { changelog: [], roadmap: [] };
      },
      updatesForUser: async (userId: string) => {
        calls.push(`updates:${userId}`);
        return { notifications: [], seenUpdateKeys: [], user: { externalUserId: userId } };
      },
    });

    expect(calls).toEqual(["portal"]);
  });
});
