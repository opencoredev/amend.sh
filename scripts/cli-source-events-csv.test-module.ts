import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, test } from "bun:test";
import { runAmendCli } from "../packages/cli/src/cli";

export function registerCliSourceEventCsvTests() {
  test("imports CSV source events through the SDK client", async () => {
    const output: string[] = [];
    const requests: Request[] = [];
    const tempDir = await mkdtemp(join(tmpdir(), "amend-cli-"));
    const csvPath = join(tempDir, "source-events.csv");
    await writeSourceEventsCsv(csvPath);

    try {
      const exitCode = await runAmendCli(
        [
          "source",
          "import",
          "--endpoint",
          "https://updates.example.test/api/v1",
          "--project",
          "acme",
          "--token",
          "secret-token",
          "--file",
          csvPath,
        ],
        {
          fetch: async (input, init) => {
            const request = new Request(input, init);
            requests.push(request);
            return Response.json({
              sourceEventId: `source-event-${requests.length}`,
              status: "created",
            });
          },
          stdout: (message) => output.push(message),
        },
      );

      expect(exitCode).toBe(0);
      expect(requests).toHaveLength(2);
      expect(requests[0].url).toBe("https://updates.example.test/api/v1/acme/source-events");
      expect(requests[0].headers.get("authorization")).toBe("Bearer secret-token");
      expect(await requests[0].json()).toMatchObject({
        author: "founder@example.com",
        externalId: "slack:feedback:789",
        kind: "customer_signal",
        labels: ["feedback", "import"],
        number: 789,
        provider: "slack",
        state: "open",
        title: "CSV request, with comma",
      });
      expect(await requests[1].json()).toMatchObject({
        externalId: "github:pr:42",
        kind: "pull_request",
        labels: ["github", "shipping"],
        provider: "github",
        state: "merged",
      });
      const payload = JSON.parse(output[0]);
      expect(payload.sourceEvents).toHaveLength(2);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
}

async function writeSourceEventsCsv(csvPath: string) {
  await writeFile(
    csvPath,
    [
      "provider,kind,external_id,title,url,labels,state,number,author",
      'slack,customer_signal,slack:feedback:789,"CSV request, with comma",https://slack.example.test/p789,"feedback;import",open,789,founder@example.com',
      "github,pull_request,github:pr:42,Shipped CSV import,https://github.com/acme/app/pull/42,github|shipping,merged,42,maintainer@example.dev",
    ].join("\n"),
  );
}
