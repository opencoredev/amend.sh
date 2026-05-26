import { expect, test } from "bun:test";
import { runAmendCli } from "../packages/cli/src/cli";

export function registerCliSourceEventListTests() {
  test("lists demo source events for agent evidence inspection", async () => {
    const output: string[] = [];
    const exitCode = await runAmendCli(
      ["source", "list", "--demo", "--provider", "slack", "--kind", "customer_signal"],
      {
        stdout: (message) => output.push(message),
      },
    );

    expect(exitCode).toBe(0);
    const payload = JSON.parse(output[0]);
    expect(payload.sourceEvents).toHaveLength(1);
    expect(payload.sourceEvents[0]).toMatchObject({
      externalId: "slack:feedback:123",
      provider: "slack",
    });
  });

  test("lists API source events through the SDK client", async () => {
    const output: string[] = [];
    const requests: Request[] = [];
    const exitCode = await runAmendCli(
      [
        "sources",
        "list",
        "--endpoint",
        "https://updates.example.test/api/v1",
        "--project",
        "acme",
        "--provider",
        "slack",
        "--kind",
        "customer_signal",
        "--limit",
        "5",
      ],
      {
        fetch: async (input, init) => {
          const request = new Request(input, init);
          requests.push(request);
          return Response.json({
            sourceEvents: [
              {
                externalId: "slack:feedback:123",
                provider: "slack",
              },
            ],
          });
        },
        stdout: (message) => output.push(message),
      },
    );

    expect(exitCode).toBe(0);
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe(
      "https://updates.example.test/api/v1/acme/source-events?provider=slack&kind=customer_signal&limit=5",
    );
    const payload = JSON.parse(output[0]);
    expect(payload.sourceEvents[0].externalId).toBe("slack:feedback:123");
  });
}
