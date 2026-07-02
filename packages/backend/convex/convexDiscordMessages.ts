import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { verifyApiToken } from "./lib/httpRuntimeAuth";
import { json, readBody } from "./lib/httpRuntimeRouting";
import { optionalString } from "./lib/httpRuntimeScalars";
import { classifySignalContent } from "./pipeline/signalTriage";

// POST /ingest/discordMessage — called by the always-on gateway worker for each
// message in an allowlisted channel. Routes the guild to its workspace via
// channelRoutes (falling back to the dev-only default documented in
// ingest/channelRouting.ts — unrouted guilds get a 404), classifies with the
// shared triage model and, when the message is real signal, ingests it as a
// discord-channel need. Returns `{ capture, react }` so the worker knows
// whether to add the 👀 reaction.
export const discordMessageIngest = httpAction(async (ctx, request) => {
  const auth = verifyApiToken(request);
  if (!auth.ok) {
    return json({ error: auth.error }, 401);
  }

  const body = readBody(await request.text());
  const content = (optionalString(body.content) ?? "").trim();
  if (!content) {
    return json({ capture: false, react: false }, 200);
  }

  const guildId = optionalString(body.guildId);
  const channelId = optionalString(body.channelId);

  // Resolve the workspace BEFORE triage so unrouted guilds cost nothing.
  const route = await ctx.runQuery(internal.channelRoutes.resolveRouteForIngest, {
    provider: "discord",
    ...(guildId ? { routingKey: guildId } : {}),
  });
  if (!route) {
    return json(
      {
        error: `No workspace has claimed the discord route "${guildId ?? "unknown"}". Claim it from Connections (channelRoutes.claimChannelRoute) before sending signals.`,
      },
      404,
    );
  }

  // Server-side channel allowlist from the route config — defense in depth
  // alongside the gateway worker's own allowlists.
  if (route.listenChannels && route.listenChannels.length > 0) {
    if (!channelId || !route.listenChannels.includes(channelId)) {
      return json({ capture: false, react: false }, 200);
    }
  }

  const verdict = await classifySignalContent({ body: content, provider: "discord" });
  if (!verdict.signal) {
    return json({ capture: false, react: false }, 200);
  }

  const messageId = optionalString(body.messageId);
  const author =
    optionalString(body.authorName) ?? optionalString(body.authorId) ?? "Discord";
  const handle = optionalString(body.authorHandle) ?? optionalString(body.authorId);
  const avatarUrl = optionalString(body.authorAvatarUrl);
  const url =
    guildId && channelId && messageId
      ? `https://discord.com/channels/${guildId}/${channelId}/${messageId}`
      : "https://discord.com/channels/@me";

  await ctx.runMutation(internal.amend.trustedIngestSourceEvent, {
    provider: "discord",
    externalId: `discord:message:${messageId ?? `${channelId ?? "unknown"}:${Date.now()}`}`,
    kind: "customer_signal",
    title: verdict.title || content.slice(0, 120),
    body: content,
    url,
    author,
    ...(handle ? { handle } : {}),
    ...(avatarUrl ? { avatarUrl } : {}),
    labels: ["discord", verdict.kind ?? "feedback"],
    workspaceSlug: route.workspaceSlug,
  });

  return json({ capture: true, react: route.ackReaction, title: verdict.title ?? "" }, 200);
});
