import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { json, readBody } from "./lib/httpRuntimeRouting";
import { optionalString, record } from "./lib/httpRuntimeScalars";

declare const process: {
  env: {
    DISCORD_PUBLIC_KEY?: string;
    // Optional: workspace slug all Discord `/amend` signal routes to. Discord
    // does not send a workspace, and per-guild routing is future work; until
    // then every interaction lands in this single workspace. When unset, the
    // ingest mutation falls back to the demo slug (current default behavior).
    DISCORD_DEFAULT_WORKSPACE_SLUG?: string;
  };
};

// Discord interaction types (https://discord.com/developers/docs/interactions/receiving-and-responding).
const INTERACTION_TYPE_PING = 1;
const INTERACTION_TYPE_APPLICATION_COMMAND = 2;

// Discord interaction response (callback) types.
const CALLBACK_TYPE_PONG = 1;
const CALLBACK_TYPE_CHANNEL_MESSAGE_WITH_SOURCE = 4;

// Message flag making the response ephemeral (only visible to the invoking user).
const MESSAGE_FLAG_EPHEMERAL = 64;

const SLASH_COMMAND_NAME = "amend";

/**
 * Discord Interactions endpoint.
 *
 * Discord sends every interaction (slash command, button, etc.) to this URL as a
 * signed POST. We must:
 *  1. Verify the Ed25519 signature over `timestamp + rawBody` using the app's
 *     public key, returning 401 if it fails (Discord routinely probes the URL
 *     with bad signatures and will disable it if we ever accept one).
 *  2. Answer PING (type 1) handshakes with a PONG (type 1).
 *  3. For the `/amend <text>` slash command, feed the text into the proactive
 *     pipeline as a `discord` source event and reply ephemerally.
 */
export const discordInteraction = httpAction(async (ctx, request) => {
  // The raw body MUST be read as text and used verbatim for signature
  // verification before any JSON.parse — re-serializing would change the bytes.
  const rawBody = await request.text();
  const signature = request.headers.get("X-Signature-Ed25519");
  const timestamp = request.headers.get("X-Signature-Timestamp");

  const verification = await verifyDiscordSignature({
    publicKeyHex: process.env.DISCORD_PUBLIC_KEY,
    rawBody,
    signatureHex: signature,
    timestamp,
  });
  if (!verification.ok) {
    return json({ error: verification.error }, 401);
  }

  const body = readBody(rawBody);
  const type = typeof body.type === "number" ? body.type : undefined;

  // 1. PING handshake → PONG. Discord uses this to validate the endpoint URL.
  if (type === INTERACTION_TYPE_PING) {
    return json({ type: CALLBACK_TYPE_PONG });
  }

  // 2. Slash command. Only the `/amend` command produces signal.
  if (type === INTERACTION_TYPE_APPLICATION_COMMAND) {
    const data = record(body.data);
    const commandName = optionalString(data?.name);
    if (commandName === SLASH_COMMAND_NAME) {
      const feedback = firstStringOptionValue(data?.options);
      if (!feedback) {
        // No text option present: nothing was logged, so do not claim success.
        return json({
          data: {
            content: "No feedback text received.",
            flags: MESSAGE_FLAG_EPHEMERAL,
          },
          type: CALLBACK_TYPE_CHANNEL_MESSAGE_WITH_SOURCE,
        });
      }

      const interaction = discordInteractionContext(body, data);
      await ctx.runMutation(internal.amend.trustedIngestSourceEvent, {
        author: interaction.author,
        externalId: interaction.externalId,
        kind: "customer_signal",
        labels: ["discord", "slash-command"],
        provider: "discord",
        title: truncate(feedback, 120),
        url: interaction.url,
        workspaceSlug: interaction.workspaceSlug,
      });

      return json({
        data: {
          content: "Got it — logged for the team.",
          flags: MESSAGE_FLAG_EPHEMERAL,
        },
        type: CALLBACK_TYPE_CHANNEL_MESSAGE_WITH_SOURCE,
      });
    }
  }

  // Unknown interaction types: acknowledge with an ephemeral nudge rather than
  // erroring, so Discord does not surface a failure to the user.
  return json({
    data: {
      content: "Unsupported interaction.",
      flags: MESSAGE_FLAG_EPHEMERAL,
    },
    type: CALLBACK_TYPE_CHANNEL_MESSAGE_WITH_SOURCE,
  });
});

type DiscordSignatureInput = {
  publicKeyHex: string | undefined;
  rawBody: string;
  signatureHex: string | null;
  timestamp: string | null;
};

/**
 * Verify a Discord interaction's Ed25519 signature.
 *
 * Discord signs `timestamp + rawBody` with the application's private key. We
 * verify with the configured public key using WebCrypto's Ed25519 support,
 * which is available in Convex's V8 runtime.
 */
async function verifyDiscordSignature(input: DiscordSignatureInput) {
  const { publicKeyHex, rawBody, signatureHex, timestamp } = input;

  if (!publicKeyHex) {
    return { error: "Missing Discord public key configuration", ok: false as const };
  }
  if (!signatureHex || !timestamp) {
    return { error: "Missing Discord signature headers", ok: false as const };
  }

  const publicKeyBytes = hexToBytes(publicKeyHex);
  const signatureBytes = hexToBytes(signatureHex);
  if (!publicKeyBytes || !signatureBytes) {
    return { error: "Malformed Discord signature", ok: false as const };
  }

  const message = new TextEncoder().encode(timestamp + rawBody);

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      publicKeyBytes,
      { name: "Ed25519" },
      false,
      ["verify"],
    );
    const verified = await crypto.subtle.verify({ name: "Ed25519" }, key, signatureBytes, message);
    return verified
      ? { ok: true as const }
      : { error: "Invalid Discord signature", ok: false as const };
  } catch {
    return { error: "Invalid Discord signature", ok: false as const };
  }
}

type DiscordInteractionContext = {
  author: string | undefined;
  externalId: string;
  url: string;
  workspaceSlug: string | undefined;
};

function discordInteractionContext(
  body: Record<string, unknown>,
  data: Record<string, unknown> | undefined,
): DiscordInteractionContext {
  const member = record(body.member);
  const user = record(member?.user) ?? record(body.user);
  const author =
    optionalString(user?.global_name) ??
    optionalString(user?.username) ??
    optionalString(member?.nick) ??
    "Discord";

  // Each interaction has a unique id; fall back to the command id so the
  // pipeline can dedupe and the source event has a stable externalId.
  const interactionId =
    optionalString(body.id) ?? optionalString(data?.id) ?? `${Date.now()}`;
  const externalId = `discord:interaction:${interactionId}`;

  const guildId = optionalString(body.guild_id);
  const channelId = optionalString(body.channel_id) ?? optionalString(record(body.channel)?.id);
  const url =
    guildId && channelId
      ? `https://discord.com/channels/${guildId}/${channelId}`
      : "https://discord.com/app";

  // Discord interactions carry no workspace, so route everything to one
  // configured workspace. Per-guild routing (mapping guild_id → workspace) is
  // future work. When DISCORD_DEFAULT_WORKSPACE_SLUG is unset we pass undefined
  // and the ingest mutation falls back to the demo slug — the prior behavior.
  const workspaceSlug = optionalString(process.env.DISCORD_DEFAULT_WORKSPACE_SLUG);

  return { author, externalId, url, workspaceSlug };
}

/** Extract the first string option value from a slash command's options array. */
function firstStringOptionValue(options: unknown): string | undefined {
  if (!Array.isArray(options)) {
    return undefined;
  }
  for (const option of options) {
    const candidate = record(option);
    const value = candidate?.value;
    const text = optionalString(value);
    if (text) {
      return text;
    }
  }
  return undefined;
}

function truncate(value: string, max: number) {
  const trimmed = value.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 1)}…` : trimmed;
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> | null {
  if (hex.length === 0 || hex.length % 2 !== 0 || /[^0-9a-fA-F]/.test(hex)) {
    return null;
  }
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}
