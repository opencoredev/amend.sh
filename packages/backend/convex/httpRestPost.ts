import { httpAction } from "./_generated/server";
import { handleAutomationRestPost } from "./lib/httpRestPostAutomation";
import { handleSignalRestPost } from "./lib/httpRestPostSignals";
import { handleWorkspaceRestPost } from "./lib/httpRestPostWorkspace";
import {
  handleStripeWebhook,
  json,
  readBody,
  requiresApiToken,
  restRoute,
  verifyApiToken,
  verifyStripeSignature,
} from "./lib/httpRuntime";

export const restPost = httpAction(async (ctx, request) => {
  const route = restRoute(request);
  if (!route) {
    return json({ error: "Not found" }, 404);
  }

  const rawBody = await request.text();
  const body = readBody(rawBody);
  const { resource, workspaceSlug } = route;

  if (resource === "stripe") {
    const signature = await verifyStripeSignature(request, rawBody);
    if (!signature.ok) {
      return json({ error: signature.error }, 401);
    }

    const result = await handleStripeWebhook(ctx, workspaceSlug, body);
    return json(result);
  }

  if (requiresApiToken(resource, body)) {
    const auth = verifyApiToken(request);
    if (!auth.ok) {
      return json({ error: auth.error }, 401);
    }
  }

  const input = { body, ctx, rawBody, request, resource, workspaceSlug };

  return (
    (await handleSignalRestPost(input)) ??
    (await handleAutomationRestPost(input)) ??
    (await handleWorkspaceRestPost(input)) ??
    json({ error: `Unknown resource '${resource}'` }, 404)
  );
});
