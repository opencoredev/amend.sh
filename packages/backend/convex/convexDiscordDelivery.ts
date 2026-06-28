import { v } from "convex/values";

import { internalAction } from "./_generated/server";

declare const process: {
  env: {
    DISCORD_APPLICATION_ID?: string;
    DISCORD_BOT_TOKEN?: string;
  };
};

// Discord REST base + application command option types
// (https://discord.com/developers/docs/interactions/application-commands).
const DISCORD_API_BASE = "https://discord.com/api/v10";
const CHAT_INPUT_COMMAND_TYPE = 1;
const STRING_OPTION_TYPE = 3;

const SLASH_COMMAND_NAME = "amend";
// Discord caps message content at 2000 characters; trim defensively so a long
// draft never causes the create-message call to be rejected outright.
const MAX_MESSAGE_CONTENT = 2000;

/**
 * Register (or overwrite) the global `/amend` chat-input command.
 *
 * Creating a global command is a POST to
 * `applications/{DISCORD_APPLICATION_ID}/commands`; Discord returns 201 for a
 * brand-new command or 200 when an existing command with the same name is
 * overwritten, so this is safe to call repeatedly (idempotent).
 *
 * Authenticated with the bot token via `Authorization: Bot <token>`.
 *
 * Exposed as an `internalAction` only: it is invoked out-of-band by an operator
 * via `bunx convex run convexDiscordDelivery:registerAmendCommand` (admin
 * access), never by an unauthenticated client — registering commands with the
 * bot token must not be reachable from the public surface.
 */
export const registerAmendCommand = internalAction({
  args: {},
  returns: v.object({
    ok: v.boolean(),
    skipped: v.optional(v.boolean()),
    status: v.optional(v.number()),
    commandId: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async () => {
    const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
    const applicationId = process.env.DISCORD_APPLICATION_ID?.trim();
    if (!botToken || !applicationId) {
      console.warn("[discord-delivery] skipping command registration: missing config", {
        applicationIdConfigured: Boolean(applicationId),
        botTokenConfigured: Boolean(botToken),
      });
      return { ok: false as const, skipped: true as const };
    }

    const response = await fetch(`${DISCORD_API_BASE}/applications/${applicationId}/commands`, {
      body: JSON.stringify({
        name: SLASH_COMMAND_NAME,
        type: CHAT_INPUT_COMMAND_TYPE,
        description: "Send feedback to the team",
        options: [
          {
            name: "text",
            description: "What you want to tell the team",
            type: STRING_OPTION_TYPE,
            required: true,
          },
        ],
      }),
      headers: {
        Authorization: `Bot ${botToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[discord-delivery] command registration failed", {
        detail: detail.slice(0, 500),
        status: response.status,
      });
      return { ok: false as const, status: response.status, error: detail.slice(0, 500) };
    }

    const payload = (await response.json().catch(() => ({}))) as { id?: unknown };
    const commandId = typeof payload.id === "string" ? payload.id : undefined;
    console.info("[discord-delivery] registered /amend command", {
      commandId,
      status: response.status,
    });
    return { ok: true as const, status: response.status, commandId };
  },
});

const sendDiscordMessageArgs = {
  channelId: v.string(),
  content: v.string(),
} as const;

const sendDiscordMessageReturns = v.object({
  ok: v.boolean(),
  skipped: v.optional(v.boolean()),
  status: v.optional(v.number()),
  messageId: v.optional(v.string()),
  error: v.optional(v.string()),
});

/**
 * Post a plain-text message to a Discord channel via the bot.
 *
 * POSTs to `channels/{channelId}/messages` with `Authorization: Bot <token>`
 * and a JSON `{ content }` body. When `DISCORD_BOT_TOKEN` is unset this is a
 * graceful no-op: it warns and returns `{ ok: false, skipped: true }` rather
 * than throwing, so the outbound notify path never fails just because the bot
 * is not configured in this environment.
 */
async function sendDiscordMessageHandler(args: { channelId: string; content: string }) {
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!botToken) {
    console.warn("[discord-delivery] skipping channel message: DISCORD_BOT_TOKEN missing", {
      channelId: args.channelId,
    });
    return { ok: false as const, skipped: true as const };
  }

  const content = args.content.slice(0, MAX_MESSAGE_CONTENT);
  const response = await fetch(`${DISCORD_API_BASE}/channels/${args.channelId}/messages`, {
    body: JSON.stringify({ content }),
    headers: {
      Authorization: `Bot ${botToken}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("[discord-delivery] channel message failed", {
      channelId: args.channelId,
      detail: detail.slice(0, 500),
      status: response.status,
    });
    return { ok: false as const, status: response.status, error: detail.slice(0, 500) };
  }

  const payload = (await response.json().catch(() => ({}))) as { id?: unknown };
  const messageId = typeof payload.id === "string" ? payload.id : undefined;
  console.info("[discord-delivery] posted channel message", {
    channelId: args.channelId,
    messageId,
    status: response.status,
  });
  return { ok: true as const, status: response.status, messageId };
}

/**
 * Internal action variant, scheduled from mutations (which cannot fetch).
 *
 * This is the ONLY exported sender. There is intentionally no public `action`
 * variant: a client-callable sender would let any anonymous caller post
 * arbitrary content to any channel using the bot token. The sole caller is the
 * outbound notify path in `drafts.ts`, which schedules this internally.
 */
export const sendDiscordMessageInternal = internalAction({
  args: sendDiscordMessageArgs,
  returns: sendDiscordMessageReturns,
  handler: (_ctx, args) => sendDiscordMessageHandler(args),
});
