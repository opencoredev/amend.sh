export type SignatureResult = { error: string; ok: false } | { ok: true };

type SignatureOptions = {
  allowUnsigned?: boolean;
  nowMs?: number;
  toleranceSeconds?: number;
};

export async function verifyStripeWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined,
  options: SignatureOptions = {},
): Promise<SignatureResult> {
  if (!secret) {
    return { error: "Missing Stripe webhook secret", ok: false };
  }

  if (!signatureHeader) {
    return { error: "Missing Stripe signature", ok: false };
  }

  const parts = Object.fromEntries(
    signatureHeader.split(",").flatMap((part) => {
      const [key, value] = part.split("=");
      return key && value ? [[key, value]] : [];
    }),
  );
  const timestamp = Number(parts.t);
  const signature = parts.v1;
  if (!Number.isFinite(timestamp) || !signature || !isHexDigest(signature)) {
    return { error: "Invalid Stripe signature", ok: false };
  }

  const toleranceSeconds = options.toleranceSeconds ?? 300;
  const nowMs = options.nowMs ?? Date.now();
  if (Math.abs(nowMs / 1000 - timestamp) > toleranceSeconds) {
    return { error: "Expired Stripe signature", ok: false };
  }

  const expected = await hmacSha256Hex(secret, `${timestamp}.${rawBody}`);
  return timingSafeEqualText(expected, signature)
    ? { ok: true }
    : { error: "Invalid Stripe signature", ok: false };
}

export async function verifyGitHubWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined,
  options: SignatureOptions = {},
): Promise<SignatureResult> {
  if (!secret) {
    return options.allowUnsigned
      ? { ok: true }
      : { error: "Missing GitHub webhook secret", ok: false };
  }

  if (!signatureHeader?.startsWith("sha256=")) {
    return { error: "Missing GitHub signature", ok: false };
  }

  const signature = signatureHeader.slice("sha256=".length);
  if (!isHexDigest(signature)) {
    return { error: "Invalid GitHub signature", ok: false };
  }

  const expected = await hmacSha256Hex(secret, rawBody);
  return timingSafeEqualText(expected, signature)
    ? { ok: true }
    : { error: "Invalid GitHub signature", ok: false };
}

export async function hmacSha256Hex(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return hexDigest(digest);
}

function hexDigest(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function isHexDigest(value: string) {
  return value.length === 64 && /^[a-f0-9]+$/i.test(value);
}

function timingSafeEqualText(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}
