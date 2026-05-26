import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { DEMO_NOW, demoBuildBriefs, demoNotifications, demoReviews } from "./amendDemoData";

type DemoWorkflowLinks = {
  changelogIds: Array<Id<"changelogEntries">>;
  feedbackIds: Array<Id<"feedbackItems">>;
  roadmapIds: Array<Id<"roadmapItems">>;
  sourceIds: Array<Id<"sourceEvents">>;
};

export async function ensureDemoNotifications(ctx: MutationCtx, workspaceId: Id<"workspaces">) {
  for (const notification of demoNotifications) {
    const existing = await ctx.db
      .query("notifications")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspaceId).eq("stableKey", notification.stableKey),
      )
      .unique();
    if (!existing) {
      await ctx.db.insert("notifications", {
        workspaceId,
        ...notification,
        createdAt: DEMO_NOW,
        updatedAt: DEMO_NOW,
        ...(notification.status === "sent" ? { sentAt: DEMO_NOW - 1_800_000 } : {}),
      });
    }
  }
}

export async function ensureDemoReviewItems(ctx: MutationCtx, workspaceId: Id<"workspaces">) {
  for (const review of demoReviews) {
    const existing = await ctx.db
      .query("reviewItems")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspaceId).eq("stableKey", review.stableKey),
      )
      .unique();
    if (!existing) {
      await ctx.db.insert("reviewItems", {
        workspaceId,
        ...review,
        createdAt: DEMO_NOW,
        updatedAt: DEMO_NOW,
        ...("reviewedBy" in review ? { reviewedBy: review.reviewedBy } : {}),
        ...("reviewedAt" in review ? { reviewedAt: review.reviewedAt } : {}),
      });
    }
  }
}

export async function ensureDemoBuildBriefs(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  linkedIds: DemoWorkflowLinks,
) {
  for (const brief of demoBuildBriefs) {
    const existing = await ctx.db
      .query("buildBriefs")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspaceId).eq("stableKey", brief.stableKey),
      )
      .unique();
    if (!existing) {
      await ctx.db.insert("buildBriefs", {
        workspaceId,
        ...brief,
        feedbackItemIds: linkedIds.feedbackIds,
        roadmapItemIds: linkedIds.roadmapIds,
        changelogEntryIds: linkedIds.changelogIds,
        sourceEventIds: linkedIds.sourceIds,
        createdAt: DEMO_NOW,
        updatedAt: DEMO_NOW,
      });
    }
  }
}
