import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { slugPart } from "./amendBackendUtils";
import { ensureReviewItem, upsertChangelogDraft } from "./amendSourceIngestChangelog";
import { upsertAutomationDecision } from "./amendSourceIngestDecisions";
import { queueShippedWorkNotification } from "./amendSourceNotifications";
import type { IngestSourceEventArgs } from "./amendSourceIngestModel";
import {
  findRelatedFeedback,
  findRelatedRoadmap,
  updateRelatedFeedback,
  updateRelatedRoadmap,
} from "./amendSourceIngestRelations";
import type { SourceLink } from "./amendTypes";

type HandleShippedSourceEventArgs = {
  args: IngestSourceEventArgs;
  now: number;
  projectId?: Id<"projects">;
  provider: Doc<"sourceEvents">["provider"];
  sourceEventId: Id<"sourceEvents">;
  sourceLink: SourceLink;
  workspaceId: Id<"workspaces">;
};

export async function handleShippedSourceEvent(
  ctx: MutationCtx,
  input: HandleShippedSourceEventArgs,
) {
  const { args, now, projectId, provider, sourceEventId, sourceLink, workspaceId } = input;
  const stableKey = `source-${slugPart(args.externalId)}`;
  const rules = await ctx.db
    .query("automationRules")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .first();
  const confidence = args.kind === "release" ? 0.92 : 0.88;
  const needsReview =
    !rules ||
    rules.requireReviewForPublicCopy ||
    confidence < rules.requireReviewBelowConfidence ||
    !rules.autoPublishChangelog;
  const changelogEntryId = await upsertChangelogDraft(ctx, {
    args,
    now,
    projectId,
    sourceEventId,
    sourceLink,
    stableKey,
    workspaceId,
  });

  await upsertAutomationDecision(ctx, {
    workspaceId,
    ...(projectId ? { projectId } : {}),
    stableKey: `decision-${stableKey}`,
    action: "draft_changelog",
    targetKind: "changelog",
    targetKey: stableKey,
    confidence,
    needsReview,
    outcome: needsReview ? "queued_for_review" : "applied",
    summary: `Detected shipped GitHub ${args.kind === "release" ? "release" : "pull request"} and drafted a source-linked changelog entry.`,
    sourceLinks: [sourceLink],
    updatedAt: now,
  });

  const reviewItemId = await ensureReviewItem(ctx, {
    args,
    now,
    projectId,
    sourceLink,
    stableKey,
    workspaceId,
  });

  const relatedFeedback = await findRelatedFeedback(ctx, {
    args,
    projectId,
    provider,
    workspaceId,
  });
  await updateRelatedFeedback(ctx, {
    args,
    changelogEntryId,
    confidence,
    now,
    projectId,
    relatedFeedback,
    rules,
    sourceEventId,
    sourceLink,
    stableKey,
    workspaceId,
  });

  const relatedRoadmap = await findRelatedRoadmap(ctx, {
    args,
    projectId,
    provider,
    relatedFeedback,
    workspaceId,
  });
  await updateRelatedRoadmap(ctx, {
    args,
    changelogEntryId,
    confidence,
    now,
    projectId,
    relatedRoadmap,
    rules,
    sourceEventId,
    sourceLink,
    stableKey,
    workspaceId,
  });

  const notificationId = await queueShippedWorkNotification(ctx, {
    now,
    projectId,
    relatedFeedback,
    rules,
    sourceLink,
    stableKey,
    title: args.title,
    workspaceId,
  });

  return { changelogEntryId, notificationId, reviewItemId };
}
