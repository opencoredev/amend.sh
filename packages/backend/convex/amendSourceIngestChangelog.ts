import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import type { IngestSourceEventArgs } from "./amendSourceIngestModel";
import type { SourceLink } from "./amendTypes";

export async function upsertChangelogDraft(
  ctx: MutationCtx,
  input: {
    args: IngestSourceEventArgs;
    now: number;
    projectId?: Id<"projects">;
    sourceEventId: Id<"sourceEvents">;
    sourceLink: SourceLink;
    stableKey: string;
    workspaceId: Id<"workspaces">;
  },
) {
  const { args, now, projectId, sourceEventId, sourceLink, stableKey, workspaceId } = input;
  const existingChangelog = await ctx.db
    .query("changelogEntries")
    .withIndex("by_workspace_and_stableKey", (q) =>
      q.eq("workspaceId", workspaceId).eq("stableKey", stableKey),
    )
    .unique();

  if (existingChangelog) {
    await ctx.db.patch(existingChangelog._id, {
      ...(projectId ? { projectId } : {}),
      sourceEventIds: [sourceEventId],
      sourceLinks: [sourceLink],
      updatedAt: now,
    });
    return existingChangelog._id;
  }

  return ctx.db.insert("changelogEntries", {
    workspaceId,
    ...(projectId ? { projectId } : {}),
    stableKey,
    title: args.title,
    summary: `Drafted from ${args.kind === "release" ? "GitHub release" : "merged pull request"} source evidence.`,
    body: `Amend detected shipped GitHub work and prepared this source-linked draft for review: ${args.title}`,
    status: "draft",
    category: "changed",
    tags: ["github", "auto-draft"],
    sourceEventIds: [sourceEventId],
    sourceLinks: [sourceLink],
    reviewerStatus: "needs_review",
    authorName: "Amend",
    createdAt: now,
    updatedAt: now,
  });
}

export async function ensureReviewItem(
  ctx: MutationCtx,
  input: {
    args: IngestSourceEventArgs;
    now: number;
    projectId?: Id<"projects">;
    sourceLink: SourceLink;
    stableKey: string;
    workspaceId: Id<"workspaces">;
  },
) {
  const { args, now, projectId, sourceLink, stableKey, workspaceId } = input;
  const reviewKey = `review-${stableKey}`;
  const existingReview = await ctx.db
    .query("reviewItems")
    .withIndex("by_workspace_and_stableKey", (q) =>
      q.eq("workspaceId", workspaceId).eq("stableKey", reviewKey),
    )
    .unique();

  if (existingReview) return existingReview._id;

  return ctx.db.insert("reviewItems", {
    workspaceId,
    ...(projectId ? { projectId } : {}),
    stableKey: reviewKey,
    kind: "changelog",
    status: "needs_review",
    title: `Review shipped update: ${args.title}`,
    summary: "GitHub shipped work created a source-linked changelog draft.",
    targetKey: stableKey,
    sourceLinks: [sourceLink],
    comments: [],
    requestedBy: "Amend",
    createdAt: now,
    updatedAt: now,
  });
}
