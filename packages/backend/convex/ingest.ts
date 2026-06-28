import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { DEMO_SLUG } from "./amendDemoData";
import { verifyApiToken, verifyGitHubSignature } from "./httpRuntimeAuth";
import { githubSourceEvent, sourceEventFromBody } from "./httpRuntimeSourceEventInputs";
import { json, readBody } from "./httpRuntimeRouting";
import { optionalString, record } from "./httpRuntimeScalars";

export const githubWebhook = httpAction(async (ctx, request) => {
  const rawBody = await request.text();
  const signature = await verifyGitHubSignature(request, rawBody);
  if (!signature.ok) {
    return json({ error: signature.error }, 401);
  }

  const body = readBody(rawBody);
  const workspaceSlug = optionalString(body.workspaceSlug) ?? DEMO_SLUG;
  const result = await ctx.runMutation(internal.amend.trustedIngestSourceEvent, {
    workspaceSlug,
    // HMAC-verified above, so the (owner,repo) on this event can be trusted to
    // route the delivery to the workspace that connected the repo.
    verifiedRepoRouting: true,
    ...githubSourceEvent(request, body),
  });
  return json({ ok: true, result }, 202);
});

export const discordWebhook = httpAction(async (ctx, request) => {
  const auth = verifyApiToken(request);
  if (!auth.ok) {
    return json({ error: auth.error }, 401);
  }

  const body = readBody(await request.text());
  const workspaceSlug = optionalString(body.workspaceSlug) ?? DEMO_SLUG;
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
  const auth = verifyApiToken(request);
  if (!auth.ok) {
    return json({ error: auth.error }, 401);
  }

  const body = readBody(await request.text());
  const workspaceSlug = optionalString(body.workspaceSlug) ?? DEMO_SLUG;
  const result = await ctx.runMutation(internal.amend.trustedIngestSourceEvent, {
    workspaceSlug,
    ...sourceEventFromBody(body),
  });
  return json({ ok: true, result }, 202);
});
