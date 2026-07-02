import { describe, expect, test } from "bun:test";

import { hmacSha256Hex, verifyGitHubWebhookSignature } from "../packages/backend/convex/lib/signatures";

describe("GitHub webhook signatures", () => {
  const rawBody = JSON.stringify({
    action: "closed",
    pull_request: { merged: true, number: 42, title: "Ship source-linked updates" },
  });
  const secret = "github-webhook-secret";

  test("accepts a valid X-Hub-Signature-256 header", async () => {
    const digest = await hmacSha256Hex(secret, rawBody);
    const result = await verifyGitHubWebhookSignature(rawBody, `sha256=${digest}`, secret);

    expect(result).toEqual({ ok: true });
  });

  test("rejects tampered bodies and malformed signatures", async () => {
    const digest = await hmacSha256Hex(secret, rawBody);
    await expect(
      verifyGitHubWebhookSignature(`${rawBody}\n`, `sha256=${digest}`, secret),
    ).resolves.toEqual({
      error: "Invalid GitHub signature",
      ok: false,
    });

    await expect(verifyGitHubWebhookSignature(rawBody, "sha1=abc", secret)).resolves.toEqual({
      error: "Missing GitHub signature",
      ok: false,
    });
  });

  test("rejects unsigned webhooks when no secret is configured", async () => {
    await expect(verifyGitHubWebhookSignature(rawBody, null, undefined)).resolves.toEqual({
      error: "Missing GitHub webhook secret",
      ok: false,
    });
  });

  test("allows unsigned local webhooks only with an explicit local option", async () => {
    await expect(
      verifyGitHubWebhookSignature(rawBody, null, undefined, { allowUnsigned: true }),
    ).resolves.toEqual({
      ok: true,
    });
  });
});
