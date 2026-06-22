import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
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
  const normalizedWorkspaceSlug = workspaceSlug(args.workspaceSlug);
  const workspace = await ensureBaseRecords(ctx, normalizedWorkspaceSlug);
  const connection =
    provider === "github"
      ? await ensureGitHubConnection(ctx, workspace._id, args.owner, args.repo)
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
