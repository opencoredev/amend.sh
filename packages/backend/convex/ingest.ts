import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { githubSourceEvent, sourceEventFromBody } from "./httpRuntimeSourceEventInputs";
import { json, readBody } from "./httpRuntimeRouting";
import { optionalString, record } from "./httpRuntimeScalars";

export const githubWebhook = httpAction(async (ctx, request) => {
  const rawBody = await request.text();
  const body = readBody(rawBody);
  const workspaceSlug = optionalString(body.workspaceSlug) ?? "demo";
  const result = await ctx.runMutation(internal.amend.trustedIngestSourceEvent, {
    workspaceSlug,
    ...githubSourceEvent(request, body),
  });
  return json({ ok: true, result }, 202);
});

export const discordWebhook = httpAction(async (ctx, request) => {
  const body = readBody(await request.text());
  const workspaceSlug = optionalString(body.workspaceSlug) ?? "demo";
  const message = record(body.message) ?? body;
  const result = await ctx.runMutation(api.amend.createFeedback, {
    workspaceSlug,
    authorName: optionalString(message.author) ?? optionalString(message.username) ?? "Discord",
    body: optionalString(message.text) ?? optionalString(message.content) ?? "",
    labels: ["discord"],
    sourceUrl: optionalString(message.url),
    title: optionalString(message.title) ?? "Discord feedback",
  });
  return json({ ok: true, result }, 202);
});

export const sourceEvent = httpAction(async (ctx, request) => {
  const body = readBody(await request.text());
  const workspaceSlug = optionalString(body.workspaceSlug) ?? "demo";
  const result = await ctx.runMutation(internal.amend.trustedIngestSourceEvent, {
    workspaceSlug,
    ...sourceEventFromBody(body),
  });
  return json({ ok: true, result }, 202);
});
