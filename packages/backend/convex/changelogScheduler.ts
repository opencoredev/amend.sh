import { v } from "convex/values";

import { internalMutation } from "./_generated/server";
import { recordAnalyticsEvent } from "./dashboard/amendAnalytics";
import { trustedPlanNotificationDeliveriesHandler } from "./delivery/amendDeliveryMutationHandlers";

/**
 * Publishes scheduled changelog entries once their time arrives. Driven by a
 * frequent cron (see crons.ts). Mirrors the immediate publish-now transition:
 * stamp publishedAt, approve review, and clear the schedule. Bounded per run so
 * a backlog drains over a few ticks rather than in one long transaction.
 */
export const publishDueScheduled = internalMutation({
  args: {},
  returns: v.object({ published: v.number() }),
  handler: async (ctx) => {
    const now = Date.now();
    const due = await ctx.db
      .query("changelogEntries")
      .withIndex("by_status_and_scheduledFor", (q) =>
        q.eq("status", "scheduled").lte("scheduledFor", now),
      )
      .take(100);

    let published = 0;
    for (const entry of due) {
      await ctx.db.patch(entry._id, {
        status: "published",
        publishedAt: entry.publishedAt ?? now,
        scheduledFor: undefined,
        reviewerStatus: "approved",
        updatedAt: now,
      });
      const workspace = await ctx.db.get(entry.workspaceId);
      await recordAnalyticsEvent(ctx, {
        workspaceId: entry.workspaceId,
        workspaceSlug: workspace?.slug ?? "",
        event: "changelog_published",
        metadata: {
          changelogEntryId: entry._id,
          stableKey: entry.stableKey,
          status: "published",
          title: entry.title,
          scheduled: true,
        },
        source: "rest",
      });
      if (workspace) {
        const notificationKey = `changelog-published-${entry.stableKey}-${now}`;
        await ctx.db.insert("notifications", {
          workspaceId: entry.workspaceId,
          ...(entry.projectId ? { projectId: entry.projectId } : {}),
          stableKey: notificationKey,
          title: entry.title,
          body: entry.summary,
          channel: "email",
          audience: "subscribers",
          status: "queued",
          priority: "normal",
          relatedKind: "changelog",
          relatedKey: entry.stableKey,
          sourceLinks: entry.sourceLinks,
          createdAt: now,
          updatedAt: now,
        });
        await trustedPlanNotificationDeliveriesHandler(ctx, {
          workspaceSlug: workspace.slug,
          notificationKey,
          channel: "email",
        });
      }
      published += 1;
    }

    return { published };
  },
});
