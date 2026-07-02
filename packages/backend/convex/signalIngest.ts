import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";
import {
  fallbackSourceEventUrl,
  optionalSourceKind,
  optionalSourceProvider,
  type SourceProvider,
} from "./ingest/httpRuntimeSourceEventInputs";
import { verifyApiToken } from "./lib/httpRuntimeAuth";
import { stringArray, timestampValue } from "./lib/httpRuntimeInputScalars";
import { json, readBody } from "./lib/httpRuntimeRouting";
import { optionalString, record } from "./lib/httpRuntimeScalars";
import { classifySignalContent } from "./pipeline/signalTriage";

// Conversational providers carry free-form human chatter, so their signals run
// through the shared LLM triage before becoming needs. Structured providers
// (github, linear, api, cli, …) and explicitly structured kinds (pull_request,
// issue, release, …) skip triage and ingest directly.
const CONVERSATIONAL_PROVIDERS = new Set<SourceProvider>([
  "discord",
  "email",
  "embed",
  "slack",
  "support",
  "telegram",
  "x",
]);

// Shipped-work semantics (auto changelog drafts, roadmap/review updates,
// subscriber notifications) must only ever come from the HMAC-verified GitHub
// webhook — a bearer-token signal must not be able to fabricate a release.
const GITHUB_ONLY_KINDS = new Set([
  "pull_request",
  "issue",
  "release",
  "label",
  "milestone",
  "discussion",
]);

// Evidence stores the author's exact words, but unbounded bodies are an LLM
// input-cost vector and can exceed Convex document/scheduler limits long after
// the caller got a 200. No human chat message needs more than this.
const MAX_SIGNAL_BODY_CHARS = 8_000;

/**
 * POST /ingest/signal — the channel-agnostic signal-bus entrypoint (bearer,
 * timing-safe). Gateway workers and pollers normalize provider payloads into
 * one InboundSignal body:
 *
 *   { provider, externalId, routingKey,
 *     author?: { id?, name?, handle?, avatarUrl?, email? },
 *     content: { title?, body, url?, labels? },
 *     thread?: { id, parentId? }, kind?, occurredAt?, capabilities? }
 *
 * `thread` and `capabilities` are accepted for forward compatibility but not
 * persisted yet. Routing is resolved via channelRoutes (provider + routingKey);
 * unrouted signals are rejected with 404 — there is no silent single-tenant
 * default outside the dev-only flag documented in ingest/channelRouting.ts.
 */
export const signal = httpAction(async (ctx, request) => {
  const auth = verifyApiToken(request);
  if (!auth.ok) {
    return json({ error: auth.error }, 401);
  }

  const body = readBody(await request.text());
  const provider = optionalSourceProvider(body.provider);
  if (!provider) {
    return json({ error: "provider must be a supported source provider" }, 400);
  }
  const externalId = optionalString(body.externalId);
  if (!externalId) {
    return json({ error: "externalId is required" }, 400);
  }
  const routingKey = optionalString(body.routingKey);
  if (!routingKey) {
    return json({ error: "routingKey is required" }, 400);
  }
  const content = record(body.content) ?? {};
  const contentBody = optionalString(content.body)?.slice(0, MAX_SIGNAL_BODY_CHARS);
  if (!contentBody) {
    return json({ error: "content.body is required" }, 400);
  }
  const requestedKind = optionalSourceKind(body.kind);
  if (body.kind !== undefined && !requestedKind) {
    return json({ error: "kind must be a supported source event kind" }, 400);
  }
  if (requestedKind && GITHUB_ONLY_KINDS.has(requestedKind)) {
    return json(
      {
        error: `kind "${requestedKind}" is reserved for the verified GitHub webhook (/ingest/githubWebhook); the signal bus carries customer signals.`,
      },
      400,
    );
  }

  // Resolve the workspace BEFORE triage so unrouted signals cost nothing.
  const route = await ctx.runQuery(internal.channelRoutes.resolveRouteForIngest, {
    provider,
    routingKey,
  });
  if (!route) {
    return json(
      {
        error: `No workspace has claimed the ${provider} route "${routingKey}". Claim it from Connections (channelRoutes.claimChannelRoute) before sending signals.`,
      },
      404,
    );
  }

  const structured = requestedKind !== undefined && requestedKind !== "customer_signal";
  const verdict =
    !structured && CONVERSATIONAL_PROVIDERS.has(provider)
      ? await classifySignalContent({ body: contentBody, provider })
      : null;
  if (verdict && !verdict.signal) {
    return json({ capture: false, react: false }, 200);
  }

  const author = record(body.author) ?? {};
  const authorName =
    optionalString(author.name) ?? optionalString(author.handle) ?? optionalString(author.id);
  const handle = optionalString(author.handle) ?? optionalString(author.id);
  const avatarUrl = optionalString(author.avatarUrl);
  const authorEmail = optionalString(author.email);
  const occurredAt = timestampValue(body.occurredAt);

  const title = verdict?.title ?? optionalString(content.title) ?? contentBody.slice(0, 120);
  const labels = [
    ...new Set([
      provider,
      ...(verdict?.kind ? [verdict.kind] : []),
      ...(stringArray(content.labels) ?? []),
    ]),
  ];

  // Namespace the caller's id by provider (unless it already is) so two
  // providers reusing the same raw id can never collide on the workspace-scoped
  // dedupe key — mirrors the gateway's "discord:message:<id>" convention.
  const namespacedExternalId = externalId.startsWith(`${provider}:`)
    ? externalId
    : `${provider}:${externalId}`;

  await ctx.runMutation(internal.amend.trustedIngestSourceEvent, {
    workspaceSlug: route.workspaceSlug,
    provider,
    externalId: namespacedExternalId,
    kind: requestedKind ?? "customer_signal",
    title,
    body: contentBody,
    url: optionalString(content.url) ?? fallbackSourceEventUrl(provider, namespacedExternalId),
    labels,
    ...(authorName ? { author: authorName } : {}),
    ...(handle ? { handle } : {}),
    ...(avatarUrl ? { avatarUrl } : {}),
    ...(authorEmail ? { authorEmail } : {}),
    ...(occurredAt !== undefined ? { sourceCreatedAt: occurredAt } : {}),
  });

  return json({ capture: true, react: route.ackReaction, title }, 200);
});
