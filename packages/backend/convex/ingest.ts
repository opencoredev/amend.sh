import { httpAction } from "./_generated/server";



import { internal } from "./_generated/api";
import { DEMO_SLUG } from "./demo/amendDemoData";

import { verifyApiToken, verifyGitHubSignature } from "./lib/httpRuntimeAuth";
import { githubSourceEvent, sourceEventFromBody } from "./ingest/httpRuntimeSourceEventInputs";
import { json, readBody } from "./lib/httpRuntimeRouting";
import { optionalString } from "./lib/httpRuntimeScalars";

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
