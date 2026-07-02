import { describe, expect, test } from "bun:test";

import { hmacSha256Hex, verifyStripeWebhookSignature } from "../packages/backend/convex/lib/signatures";

describe("Stripe webhook signatures", () => {
  const rawBody = JSON.stringify({
    data: { object: { id: "cs_test_123" } },
    type: "checkout.session.completed",
  });
  const secret = "whsec_test_secret";
  const timestamp = 1_777_777_777;
  const nowMs = timestamp * 1000;

  test("accepts a valid v1 signature over the raw body", async () => {
    const digest = await hmacSha256Hex(secret, `${timestamp}.${rawBody}`);
    const result = await verifyStripeWebhookSignature(
      rawBody,
      `t=${timestamp},v1=${digest}`,
      secret,
      { nowMs },
    );

    expect(result).toEqual({ ok: true });
  });

  test("rejects a tampered body with the original signature", async () => {
    const digest = await hmacSha256Hex(secret, `${timestamp}.${rawBody}`);
    const result = await verifyStripeWebhookSignature(
      `${rawBody}\n`,
      `t=${timestamp},v1=${digest}`,
      secret,
      { nowMs },
    );

    expect(result).toEqual({ error: "Invalid Stripe signature", ok: false });
  });

  test("rejects missing and expired signatures", async () => {
    await expect(verifyStripeWebhookSignature(rawBody, null, secret, { nowMs })).resolves.toEqual({
      error: "Missing Stripe signature",
      ok: false,
    });

    const digest = await hmacSha256Hex(secret, `${timestamp}.${rawBody}`);
    await expect(
      verifyStripeWebhookSignature(rawBody, `t=${timestamp},v1=${digest}`, secret, {
        nowMs: nowMs + 301_000,
      }),
    ).resolves.toEqual({
      error: "Expired Stripe signature",
      ok: false,
    });
  });
});
