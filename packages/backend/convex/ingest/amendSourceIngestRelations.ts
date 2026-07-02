import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { upsertAutomationDecision } from "./amendSourceIngestDecisions";
import { sourceLinkMatchesEvent, type IngestSourceEventArgs } from "./amendSourceIngestModel";
import type { SourceLink } from "../lib/amendTypes";

export async function findRelatedFeedback(
  ctx: MutationCtx,
  input: {
    args: IngestSourceEventArgs;
    projectId?: Id<"projects">;
    provider: Doc<"sourceEvents">["provider"];
    workspaceId: Id<"workspaces">;
  },
) {
  const feedbackCandidates = await ctx.db
    .query("feedbackItems")
    .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", input.workspaceId))
    .order("desc")
    .take(100);
  return feedbackCandidates.filter(
    (item) =>
      (!input.projectId || !item.projectId || item.projectId === input.projectId) &&
      item.sourceLinks.some((link) => sourceLinkMatchesEvent(link, input.args, input.provider)),
  );
}

export async function updateRelatedFeedback(
  ctx: MutationCtx,
  input: {
    args: IngestSourceEventArgs;
    changelogEntryId?: Id<"changelogEntries">;
    confidence: number;
    now: number;
    projectId?: Id<"projects">;
    relatedFeedback: Doc<"feedbackItems">[];
    rules?: Doc<"automationRules"> | null;
    sourceEventId: Id<"sourceEvents">;
    sourceLink: SourceLink;
    stableKey: string;
    workspaceId: Id<"workspaces">;
  },
) {
  const canAutoUpdateFeedback = Boolean(input.rules?.autoUpdateFeedbackStatus);
  for (const feedback of input.relatedFeedback) {
    const sourceLinks = feedback.sourceLinks.some(
      (link) => link.externalId === input.sourceLink.externalId,
    )
      ? feedback.sourceLinks
      : [...feedback.sourceLinks, input.sourceLink];
    const sourceEventIds = feedback.sourceEventIds.includes(input.sourceEventId)
      ? feedback.sourceEventIds
      : [...feedback.sourceEventIds, input.sourceEventId];
    const linkedChangelogEntryIds =
      !input.changelogEntryId || feedback.linkedChangelogEntryIds.includes(input.changelogEntryId)
        ? feedback.linkedChangelogEntryIds
        : [...feedback.linkedChangelogEntryIds, input.changelogEntryId];

    await ctx.db.patch(feedback._id, {
      linkedChangelogEntryIds,
      sourceEventIds,
      sourceLinks,
      status: canAutoUpdateFeedback ? "shipped" : feedback.status,
      updatedAt: input.now,
    });

    await upsertAutomationDecision(ctx, {
      workspaceId: input.workspaceId,
      ...(feedback.projectId
        ? { projectId: feedback.projectId }
        : input.projectId
          ? { projectId: input.projectId }
          : {}),
      stableKey: `decision-${input.stableKey}-${feedback.stableKey}`,
      action: "update_feedback_status",
      targetKind: "feedback",
      targetKey: feedback.stableKey,
      confidence: input.confidence,
      needsReview: !canAutoUpdateFeedback,
      outcome: canAutoUpdateFeedback ? "applied" : "queued_for_review",
      summary: canAutoUpdateFeedback
        ? `Marked feedback as shipped because related GitHub work shipped: ${input.args.title}`
        : `Queued feedback status review because related GitHub work shipped: ${input.args.title}`,
      sourceLinks: [input.sourceLink],
      updatedAt: input.now,
    });
  }
}

export async function findRelatedRoadmap(
  ctx: MutationCtx,
  input: {
    args: IngestSourceEventArgs;
    projectId?: Id<"projects">;
    provider: Doc<"sourceEvents">["provider"];
    relatedFeedback: Doc<"feedbackItems">[];
    workspaceId: Id<"workspaces">;
  },
) {
  const relatedFeedbackIds = new Set(input.relatedFeedback.map((feedback) => feedback._id));
  const roadmapCandidates = await ctx.db
    .query("roadmapItems")
    .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", input.workspaceId))
    .order("desc")
    .take(100);
  return roadmapCandidates.filter(
    (item) =>
      (!input.projectId || !item.projectId || item.projectId === input.projectId) &&
      (item.feedbackItemIds.some((feedbackId) => relatedFeedbackIds.has(feedbackId)) ||
        item.sourceLinks.some((link) => sourceLinkMatchesEvent(link, input.args, input.provider))),
  );
}

export async function updateRelatedRoadmap(
  ctx: MutationCtx,
  input: {
    args: IngestSourceEventArgs;
    changelogEntryId?: Id<"changelogEntries">;
    confidence: number;
    now: number;
    projectId?: Id<"projects">;
    relatedRoadmap: Doc<"roadmapItems">[];
    rules?: Doc<"automationRules"> | null;
    sourceEventId: Id<"sourceEvents">;
    sourceLink: SourceLink;
    stableKey: string;
    workspaceId: Id<"workspaces">;
  },
) {
  const canAutoUpdateRoadmap = Boolean(input.rules?.autoUpdateRoadmapStatus);
  for (const roadmapItem of input.relatedRoadmap) {
    const sourceLinks = roadmapItem.sourceLinks.some(
      (link) => link.externalId === input.sourceLink.externalId,
    )
      ? roadmapItem.sourceLinks
      : [...roadmapItem.sourceLinks, input.sourceLink];
    const sourceEventIds = roadmapItem.sourceEventIds.includes(input.sourceEventId)
      ? roadmapItem.sourceEventIds
      : [...roadmapItem.sourceEventIds, input.sourceEventId];
    const changelogEntryIds =
      !input.changelogEntryId || roadmapItem.changelogEntryIds.includes(input.changelogEntryId)
        ? roadmapItem.changelogEntryIds
        : [...roadmapItem.changelogEntryIds, input.changelogEntryId];

    await ctx.db.patch(roadmapItem._id, {
      changelogEntryIds,
      ...(canAutoUpdateRoadmap ? { shippedAt: input.now } : {}),
      sourceEventIds,
      sourceLinks,
      status: canAutoUpdateRoadmap ? "shipped" : roadmapItem.status,
      updatedAt: input.now,
    });

    await upsertAutomationDecision(ctx, {
      workspaceId: input.workspaceId,
      ...(roadmapItem.projectId
        ? { projectId: roadmapItem.projectId }
        : input.projectId
          ? { projectId: input.projectId }
          : {}),
      stableKey: `decision-${input.stableKey}-${roadmapItem.stableKey}`,
      action: "update_roadmap_status",
      targetKind: "roadmap",
      targetKey: roadmapItem.stableKey,
      confidence: input.confidence,
      needsReview: !canAutoUpdateRoadmap,
      outcome: canAutoUpdateRoadmap ? "applied" : "queued_for_review",
      summary: canAutoUpdateRoadmap
        ? `Updated roadmap status from shipped GitHub source evidence: ${input.args.title}`
        : `Queued roadmap status update for review from shipped GitHub source evidence: ${input.args.title}`,
      sourceLinks: [input.sourceLink],
      updatedAt: input.now,
    });
  }
}
