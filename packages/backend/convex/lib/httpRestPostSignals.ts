import { api, internal } from "../_generated/api";
import type { RestPostInput } from "./httpRestPostTypes";
import {
  eventName,
  feedbackInteractionKind,
  githubSourceEvent,
  json,
  optionalString,
  record,
  requiredString,
  sourceEventFromBody,
  stringArray,
  verifyGitHubSignature,
} from "./httpRuntime";

export async function handleSignalRestPost(input: RestPostInput) {
  const { body, ctx, rawBody, request, resource, workspaceSlug } = input;

  if (resource === "feedback") {
    const result = await ctx.runMutation(api.amend.createFeedback, {
      workspaceSlug,
      authorEmail: optionalString(body.authorEmail),
      authorName: optionalString(body.authorName),
      body: requiredString(body.body, "body"),
      labels: stringArray(body.labels),
      sourceUrl: optionalString(body.sourceUrl),
      title: requiredString(body.title, "title"),
    });
    return json(result, 201);
  }

  if (resource === "interactions") {
    const result = await ctx.runMutation(api.amend.recordFeedbackInteraction, {
      workspaceSlug,
      body: optionalString(body.body),
      email: optionalString(body.email),
      externalUserId: optionalString(body.externalUserId) ?? optionalString(body.userId),
      feedbackKey:
        optionalString(body.feedbackKey) ??
        optionalString(body.requestKey) ??
        requiredString(body.updateKey, "feedbackKey"),
      kind: feedbackInteractionKind(body.kind),
      reaction: optionalString(body.reaction),
      source: "rest",
    });
    return json(result, 201);
  }

  if (resource === "identity") {
    const identity = record(body.identity) ?? body;
    const result = await ctx.runMutation(api.amend.identifyExternalUser, {
      workspaceSlug,
      accountId: optionalString(identity.accountId),
      email: optionalString(identity.email),
      externalUserId: requiredString(identity.externalUserId, "externalUserId"),
      name: optionalString(identity.name),
      traits: identity.traits,
    });
    return json(result);
  }

  if (resource === "events") {
    const result = await ctx.runMutation(api.amend.trackEvent, {
      workspaceSlug,
      accountId: optionalString(body.accountId),
      event: eventName(body.event),
      externalUserId: optionalString(body.externalUserId) ?? optionalString(body.userId),
      metadata: body.metadata,
      source: "rest",
      updateKey: optionalString(body.updateKey),
    });
    return json(result, 201);
  }

  if (resource === "github") {
    const signature = await verifyGitHubSignature(request, rawBody);
    if (!signature.ok) {
      return json({ error: signature.error }, 401);
    }

    const result = await ctx.runMutation(internal.amend.trustedIngestSourceEvent, {
      workspaceSlug,
      ...githubSourceEvent(request, body),
    });
    return json(result, 202);
  }

  if (resource === "source-events") {
    const result = await ctx.runMutation(internal.amend.trustedIngestSourceEvent, {
      workspaceSlug,
      ...sourceEventFromBody(body),
    });
    return json(result, 201);
  }

  return undefined;
}
