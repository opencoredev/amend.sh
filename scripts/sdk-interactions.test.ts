import { describe, expect, test } from "bun:test";

import { Amend } from "../packages/sdk/src/index";

describe("Amend SDK feedback interactions", () => {
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
});
