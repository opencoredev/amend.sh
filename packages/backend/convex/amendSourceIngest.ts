import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { recordAnalyticsEvent } from "./amendAnalytics";
import { workspaceSlug } from "./amendBackendUtils";
import { ensureBaseRecords, ensureGitHubConnection } from "./amendSeed";
import {
  createSourceLink,
  isShippedSourceEvent,
  type IngestSourceEventArgs,
} from "./amendSourceIngestModel";
import { handleShippedSourceEvent } from "./amendSourceIngestShipped";
import { getWritableDashboardProject, requireDashboardUser } from "./amendWorkspace";

export async function ingestSourceEventHandler(ctx: MutationCtx, args: IngestSourceEventArgs) {
  await requireDashboardUser(ctx);
  return await trustedIngestSourceEventHandler(ctx, args);
}

export async function trustedIngestSourceEventHandler(
  ctx: MutationCtx,
  args: IngestSourceEventArgs,
) {
  const now = Date.now();
  const observedAt = args.observedAt ?? now;
  const provider = args.provider ?? "github";

  // Route incoming GitHub webhooks by the repository they came from rather than a
  // slug in the payload. Real GitHub deliveries don't carry a workspace slug, so
  // when an existing githubConnections row owns this `owner/repo`, the event
  // belongs to that connection's workspace. If no connection matches we fall back
  // to the slug-based path, preserving behavior for REST/CLI callers and the demo
  // workspace.
  //
  // Only do this for HMAC-verified GitHub webhooks (`verifiedRepoRouting`).
  // Otherwise an unverified caller could spoof an `owner/repo` another workspace
  // connected and hijack that repo's events; unverified/REST/CLI/Discord callers
  // therefore keep using the slug-based fallback below.
  const routedConnection =
    provider === "github" && args.verifiedRepoRouting === true
      ? await resolveGithubConnectionByRepository(ctx, args.owner, args.repo)
      : undefined;

  const normalizedWorkspaceSlug = routedConnection
    ? ((await ctx.db.get(routedConnection.workspaceId))?.slug ?? workspaceSlug(args.workspaceSlug))
    : workspaceSlug(args.workspaceSlug);
  const workspace = await ensureBaseRecords(ctx, normalizedWorkspaceSlug);
  const connection =
    provider === "github"
      ? (routedConnection ??
        (await ensureGitHubConnection(ctx, workspace._id, args.owner, args.repo)))
      : undefined;
  const requestedProject = await getWritableDashboardProject(ctx, workspace._id, args.projectSlug);
  const projectId = requestedProject?._id ?? connection?.projectId;
  const existing = await ctx.db
    .query("sourceEvents")
    .withIndex("by_workspace_and_externalId", (q) =>
      q.eq("workspaceId", workspace._id).eq("externalId", args.externalId),
    )
    .unique();

  const sourceEventPatch = {
    externalId: args.externalId,
    kind: args.kind,
    labels: args.labels ?? [],
    observedAt,
    provider,
    sourceCreatedAt: args.sourceCreatedAt ?? now,
    sourceUpdatedAt: args.sourceUpdatedAt ?? now,
    title: args.title,
    url: args.url,
    workspaceId: workspace._id,
    ...(args.author ? { author: args.author } : {}),
    ...(projectId ? { projectId } : {}),
    ...(args.milestone ? { milestone: args.milestone } : {}),
    ...(args.number ? { number: args.number } : {}),
    ...(args.owner ? { owner: args.owner } : {}),
    ...(args.repo ? { repo: args.repo } : {}),
    ...(args.state ? { state: args.state } : {}),
    ...(connection ? { connectionId: connection._id } : {}),
  };

  const sourceEventId = existing
    ? (await ctx.db.patch(existing._id, sourceEventPatch), existing._id)
    : await ctx.db.insert("sourceEvents", sourceEventPatch);

  if (connection) {
    await ctx.db.patch(connection._id, {
      lastSyncError: undefined,
      lastSyncedAt: observedAt,
      lastWebhookDeliveryAt: now,
      syncStatus: "healthy",
      updatedAt: now,
    });
  }

  const sourceLink = createSourceLink(args, observedAt, provider);

  let changelogEntryId: Id<"changelogEntries"> | undefined;
  let notificationId: Id<"notifications"> | undefined;
  let reviewItemId: Id<"reviewItems"> | undefined;

  await ctx.scheduler.runAfter(0, internal.pipeline.processEvent, {
    workspaceId: workspace._id,
    sourceEventId,
    externalId: args.externalId,
    text: [args.title, args.labels?.join(" "), args.milestone].filter(Boolean).join("\n"),
    title: args.title,
    author: args.author,
    url: args.url,
    provider,
    labels: args.labels ?? [],
  });

  if (isShippedSourceEvent(args)) {
    const shippedResult = await handleShippedSourceEvent(ctx, {
      args,
      now,
      projectId,
      provider,
      sourceEventId,
      sourceLink,
      workspaceId: workspace._id,
    });
    changelogEntryId = shippedResult.changelogEntryId;
    notificationId = shippedResult.notificationId;
    reviewItemId = shippedResult.reviewItemId;
  }

  await recordAnalyticsEvent(ctx, {
    workspaceId: workspace._id,
    workspaceSlug: normalizedWorkspaceSlug,
    event: "source_event_ingested",
    metadata: {
      externalId: args.externalId,
      kind: args.kind,
      provider,
      sourceEventId,
      status: existing ? "updated" : "created",
      title: args.title,
    },
    source: "rest",
  });

  return {
    changelogEntryId,
    notificationId,
    reviewItemId,
    sourceEventId,
    status: existing ? "updated" : "created",
  };
}

/**
 * Resolve the githubConnections row that owns an incoming GitHub event's
 * repository, so webhook deliveries land in the workspace that actually
 * connected the repo. Returns `undefined` when the repository is unknown (no
 * owner/repo on the event, or no connection has been created yet), letting the
 * caller fall back to slug-based resolution.
 *
 * Callers MUST only invoke this for HMAC-verified GitHub deliveries (see the
 * `verifiedRepoRouting` gate above), since the (owner,repo) is the routing key.
 *
 * TODO(hardening): the next step is to route by GitHub App `installation_id`
 * (the `by_installation` index) instead of (owner,repo), which uniquely
 * identifies the installation that GitHub signed the delivery for and removes
 * the remaining ambiguity when the same repo is connected by multiple
 * workspaces.
 */
async function resolveGithubConnectionByRepository(
  ctx: MutationCtx,
  owner: string | undefined,
  repo: string | undefined,
): Promise<Doc<"githubConnections"> | undefined> {
  if (!owner || !repo) {
    return undefined;
  }
  const connections = await ctx.db
    .query("githubConnections")
    .withIndex("by_owner_and_repo", (q) => q.eq("owner", owner).eq("repo", repo))
    .collect();
  // Ignore rows whose installation was explicitly disconnected — a stale
  // disconnected row must never capture another workspace's live webhooks.
  const live = connections.filter(
    (connection) => connection.installationState !== "disconnected",
  );
  if (live.length === 0) {
    return undefined;
  }
  // Deterministically pick the FIRST registrant (earliest createdAt). This makes
  // a later workspace connecting the same repo unable to hijack routing away
  // from the workspace that connected it first; ties break on _id for stability.
  return live.reduce((earliest, connection) => {
    if (connection.createdAt !== earliest.createdAt) {
      return connection.createdAt < earliest.createdAt ? connection : earliest;
    }
    return connection._id < earliest._id ? connection : earliest;
  });
}
