import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { requireDashboardUser, requireDashboardWorkspace } from "./amendWorkspace";

type RevertAutomationDecisionArgs = {
  workspaceSlug?: string;
  decisionId?: Id<"automationDecisions">;
  decisionKey?: string;
};

export async function revertAutomationDecisionHandler(
  ctx: MutationCtx,
  args: RevertAutomationDecisionArgs,
) {
  const user = await requireDashboardUser(ctx);
  const now = Date.now();
  let decision = args.decisionId ? await ctx.db.get(args.decisionId) : null;

  if (!decision && args.decisionKey) {
    const workspace = await requireDashboardWorkspace(ctx, user, args.workspaceSlug);
    decision = await ctx.db
      .query("automationDecisions")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", workspace._id).eq("stableKey", args.decisionKey!),
      )
      .unique();
  }

  if (!decision) {
    throw new Error("Automation decision not found");
  }

  const decisionWorkspace = await ctx.db.get(decision.workspaceId);
  if (!decisionWorkspace) {
    throw new Error("Workspace not found");
  }
  await requireDashboardWorkspace(ctx, user, decisionWorkspace.slug);

  if (decision.targetKind === "changelog") {
    const changelog = await ctx.db
      .query("changelogEntries")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", decision.workspaceId).eq("stableKey", decision.targetKey),
      )
      .unique();
    if (changelog) {
      await ctx.db.patch(changelog._id, {
        reviewerStatus: "changes_requested",
        status: changelog.status === "published" ? "in_review" : changelog.status,
        updatedAt: now,
      });
    }
  }

  if (decision.targetKind === "feedback") {
    const feedback = await ctx.db
      .query("feedbackItems")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", decision.workspaceId).eq("stableKey", decision.targetKey),
      )
      .unique();
    if (feedback) {
      await ctx.db.patch(feedback._id, {
        status: feedback.sourceLinks.length > 0 ? "linked" : "triaged",
        updatedAt: now,
      });
    }
  }

  if (decision.targetKind === "roadmap") {
    const roadmap = await ctx.db
      .query("roadmapItems")
      .withIndex("by_workspace_and_stableKey", (q) =>
        q.eq("workspaceId", decision.workspaceId).eq("stableKey", decision.targetKey),
      )
      .unique();
    if (roadmap) {
      await ctx.db.patch(roadmap._id, {
        status: roadmap.status === "shipped" ? "under_review" : roadmap.status,
        updatedAt: now,
      });
    }
  }

  if (decision.targetKind === "notification") {
    await revertNotificationDecision(ctx, decision, now);
  }

  await ctx.db.patch(decision._id, {
    needsReview: false,
    outcome: "skipped",
    summary: `${decision.summary} Reverted from the dashboard.`,
    updatedAt: now,
  });

  return {
    decisionId: decision._id,
    revertedAt: now,
    targetKind: decision.targetKind,
    targetKey: decision.targetKey,
  };
}

async function revertNotificationDecision(
  ctx: MutationCtx,
  decision: Doc<"automationDecisions">,
  now: number,
) {
  const notification = await ctx.db
    .query("notifications")
    .withIndex("by_workspace_and_stableKey", (q) =>
      q.eq("workspaceId", decision.workspaceId).eq("stableKey", decision.targetKey),
    )
    .unique();
  if (!notification) return;

  await ctx.db.patch(notification._id, {
    status: "dismissed",
    updatedAt: now,
  });
  const deliveries = await ctx.db
    .query("deliveryOutbox")
    .withIndex("by_workspace_and_status", (q) =>
      q.eq("workspaceId", decision.workspaceId).eq("status", "queued"),
    )
    .take(100);
  await Promise.all(
    deliveries
      .filter((delivery) => delivery.notificationId === notification._id)
      .map((delivery) =>
        ctx.db.patch(delivery._id, {
          status: "skipped",
          updatedAt: now,
        }),
      ),
  );
}
