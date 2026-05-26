import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { requireDashboardUser, requireDashboardWorkspace } from "./amendWorkspace";

type UpdateReviewStatusArgs = {
  workspaceSlug?: string;
  reviewItemId?: Id<"reviewItems">;
  reviewKey?: string;
  status: Doc<"reviewItems">["status"];
  reviewerName?: string;
  note?: string;
};

export async function updateReviewStatusHandler(ctx: MutationCtx, args: UpdateReviewStatusArgs) {
  const user = await requireDashboardUser(ctx);
  const now = Date.now();
  let review = args.reviewItemId ? await ctx.db.get(args.reviewItemId) : null;

  if (!review && args.reviewKey) {
    const workspace = await requireDashboardWorkspace(ctx, user, args.workspaceSlug);
    review = await ctx.db
      .query("reviewItems")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspace._id).eq("stableKey", args.reviewKey!),
      )
      .unique();
  }

  if (!review) {
    throw new Error("Review item not found");
  }

  const reviewWorkspace = await ctx.db.get(review.workspaceId);
  if (!reviewWorkspace) {
    throw new Error("Workspace not found");
  }
  await requireDashboardWorkspace(ctx, user, reviewWorkspace.slug);

  const comments = args.note
    ? [
        ...review.comments,
        {
          authorName: args.reviewerName ?? "Reviewer",
          body: args.note,
          createdAt: now,
        },
      ]
    : review.comments;

  await ctx.db.patch(review._id, {
    status: args.status,
    reviewedAt: now,
    comments,
    updatedAt: now,
    ...(args.reviewerName ? { reviewedBy: args.reviewerName } : {}),
  });

  const approved = args.status === "approved" || args.status === "published";
  if (approved) {
    await applyApprovedReview(ctx, review, args.status, now);
  }

  return {
    reviewItemId: review._id,
    status: args.status,
    reviewedAt: now,
  };
}

async function applyApprovedReview(
  ctx: MutationCtx,
  review: Doc<"reviewItems">,
  status: Doc<"reviewItems">["status"],
  now: number,
) {
  const decisions = await ctx.db
    .query("automationDecisions")
    .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", review.workspaceId))
    .order("desc")
    .take(50);
  await Promise.all(
    decisions
      .filter((decision) => decision.targetKey === review.targetKey && decision.needsReview)
      .map((decision) =>
        ctx.db.patch(decision._id, {
          needsReview: false,
          outcome: "applied",
          updatedAt: now,
        }),
      ),
  );

  if (review.kind === "changelog") {
    await applyApprovedChangelogReview(ctx, review, status, now);
  }

  if (review.kind === "feedback") {
    await applyApprovedFeedbackReview(ctx, review, status, now);
  }

  if (review.kind === "notification") {
    await applyApprovedNotificationReview(ctx, review, now);
  }
}

async function applyApprovedChangelogReview(
  ctx: MutationCtx,
  review: Doc<"reviewItems">,
  status: Doc<"reviewItems">["status"],
  now: number,
) {
  const changelog = await ctx.db
    .query("changelogEntries")
    .withIndex("by_workspace_and_stableKey", (q) =>
      q.eq("workspaceId", review.workspaceId).eq("stableKey", review.targetKey),
    )
    .unique();
  if (changelog) {
    await ctx.db.patch(changelog._id, {
      publishedAt: status === "published" ? now : changelog.publishedAt,
      reviewerStatus: "approved",
      status: status === "published" ? "published" : "in_review",
      updatedAt: now,
    });
  }
}

async function applyApprovedFeedbackReview(
  ctx: MutationCtx,
  review: Doc<"reviewItems">,
  status: Doc<"reviewItems">["status"],
  now: number,
) {
  const feedback = await ctx.db
    .query("feedbackItems")
    .withIndex("by_workspace_and_stableKey", (q) =>
      q.eq("workspaceId", review.workspaceId).eq("stableKey", review.targetKey),
    )
    .unique();
  if (feedback) {
    await ctx.db.patch(feedback._id, {
      status: status === "published" ? "shipped" : "linked",
      updatedAt: now,
    });
  }
}

async function applyApprovedNotificationReview(
  ctx: MutationCtx,
  review: Doc<"reviewItems">,
  now: number,
) {
  const notification = await ctx.db
    .query("notifications")
    .withIndex("by_workspace_and_stableKey", (q) =>
      q.eq("workspaceId", review.workspaceId).eq("stableKey", review.targetKey),
    )
    .unique();
  if (notification) {
    await ctx.db.patch(notification._id, {
      status: "queued",
      updatedAt: now,
    });
  }
}
