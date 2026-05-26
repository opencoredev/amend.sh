import { expect, test } from "bun:test";
import { runAmendCli } from "../packages/cli/src/cli";

export function registerCliSourceEventImportTests() {
  test("validates demo source imports without contacting the API", async () => {
    const output: string[] = [];
    const exitCode = await runAmendCli(
      [
        "source",
        "import",
        "--demo",
        "--provider",
        "slack",
        "--kind",
        "customer_signal",
        "--external-id",
        "slack:feedback:123",
        "--title",
        "Request from #feedback",
      ],
      {
        fetch: async () => {
          throw new Error("demo source import should not fetch");
        },
        stdout: (message) => output.push(message),
      },
    );

    expect(exitCode).toBe(0);
    const payload = JSON.parse(output[0]);
    expect(payload).toMatchObject({
      mode: "demo",
      status: "created",
      sourceEvent: {
        externalId: "slack:feedback:123",
        kind: "customer_signal",
        provider: "slack",
      },
    });
  });

  test("imports source events through the SDK client", async () => {
    const output: string[] = [];
    const requests: Request[] = [];
    const exitCode = await runAmendCli(
      [
        "sources",
        "import",
        "--endpoint",
        "https://updates.example.test/api/v1",
        "--project",
        "acme",
        "--token",
        "secret-token",
        "--provider",
        "email",
        "--kind",
        "support_ticket",
        "--external-id",
        "email:case:456",
        "--title",
        "Support ticket needs shipped status",
        "--url",
        "https://support.example.test/tickets/456",
      ],
      {
        fetch: async (input, init) => {
          const request = new Request(input, init);
          requests.push(request);
          return Response.json({ sourceEventId: "source-event-1", status: "created" });
        },
        stdout: (message) => output.push(message),
      },
    );

    expect(exitCode).toBe(0);
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toBe("https://updates.example.test/api/v1/acme/source-events");
    expect(requests[0].headers.get("authorization")).toBe("Bearer secret-token");
    expect(await requests[0].json()).toMatchObject({
      externalId: "email:case:456",
      kind: "support_ticket",
      provider: "email",
      title: "Support ticket needs shipped status",
    });
    const payload = JSON.parse(output[0]);
    expect(payload.sourceEvent.status).toBe("created");
  });
}
