import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { DEMO_SLUG } from "../demo/amendDemoData";

import { workspaceSlug } from "../lib/amendBackendUtils";
import { demoDashboard } from "../dashboard/amendDashboardFallbacks";
import { normalizeNotification } from "../lib/amendNormalizers";
import { normalizeNotificationPreference } from "../delivery/amendNotifications";
import { getWorkspaceRecord } from "../workspace/amendWorkspace";

type WorkspaceArgs = { workspaceSlug?: string };
type UserUpdatesArgs = WorkspaceArgs & { externalUserId?: string; email?: string };

export async function getUserUpdatesHandler(ctx: QueryCtx, args: UserUpdatesArgs) {
  const requestedSlug = workspaceSlug(args.workspaceSlug);
  const workspace = await getWorkspaceRecord(ctx, requestedSlug);
  if (!workspace) {
    if (requestedSlug !== DEMO_SLUG) {
      return {
        notifications: [],
        seenUpdateKeys: [],
        user: {
          email: args.email,
          externalUserId: args.externalUserId,
          preference: null,
        },
      };
    }
    return {
      notifications: demoDashboard().notifications.filter(
        (notification) => notification.audience === "subscribers",
      ),
      seenUpdateKeys: [],
      user: {
        email: args.email,
        externalUserId: args.externalUserId,
        preference: null,
      },
    };
  }

  const [externalUser, preferenceByUser, preferenceByEmail, notifications, memberByEmail] =
    await Promise.all([
      args.externalUserId
        ? ctx.db
            .query("externalUsers")
            .withIndex("by_workspace_and_externalUserId", (q) =>
              q.eq("workspaceId", workspace._id).eq("externalUserId", args.externalUserId!),
            )
            .unique()
        : null,
      args.externalUserId
        ? ctx.db
            .query("notificationPreferences")
            .withIndex("by_workspace_and_externalUserId", (q) =>
              q.eq("workspaceId", workspace._id).eq("externalUserId", args.externalUserId!),
            )
            .unique()
        : null,
      args.email
        ? ctx.db
            .query("notificationPreferences")
            .withIndex("by_workspace_and_email", (q) =>
              q.eq("workspaceId", workspace._id).eq("email", args.email!),
            )
            .unique()
        : null,
      ctx.db
        .query("notifications")
        .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
        .order("desc")
        .take(50),
      args.email
        ? ctx.db
            .query("workspaceMembers")
            .withIndex("by_workspace_and_email", (q) =>
              q.eq("workspaceId", workspace._id).eq("email", args.email!),
            )
            .unique()
        : null,
    ]);

  const email = args.email ?? externalUser?.email;
  const preference = preferenceByUser ?? preferenceByEmail;

  const [recentFeedback, feedbackInteractions, deliveredToUser, deliveredToEmail, seenEvents] =
    await Promise.all([
      ctx.db
        .query("feedbackItems")
        .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
        .order("desc")
        .take(100),
      args.externalUserId
        ? ctx.db
            .query("feedbackInteractions")
            .withIndex("by_workspace_and_externalUserId", (q) =>
              q.eq("workspaceId", workspace._id).eq("externalUserId", args.externalUserId!),
            )
            .collect()
        : [],
      args.externalUserId
        ? ctx.db
            .query("deliveryOutbox")
            .withIndex("by_workspace_and_recipient", (q) =>
              q.eq("workspaceId", workspace._id).eq("recipient", args.externalUserId!),
            )
            .collect()
        : [],
      email
        ? ctx.db
            .query("deliveryOutbox")
            .withIndex("by_workspace_and_recipient", (q) =>
              q.eq("workspaceId", workspace._id).eq("recipient", email),
            )
            .collect()
        : [],
      args.externalUserId
        ? ctx.db
            .query("eventRecords")
            .withIndex("by_workspace_and_externalUserId", (q) =>
              q.eq("workspaceId", workspace._id).eq("externalUserId", args.externalUserId!),
            )
            .collect()
        : [],
    ]);

  const deliveredNotificationIds = new Set(
    [...deliveredToUser, ...deliveredToEmail]
      .map((delivery) => delivery.notificationId)
      .filter((id): id is Id<"notifications"> => Boolean(id)),
  );
  const feedbackKeys = new Set([
    ...feedbackInteractions.map((interaction) => interaction.feedbackKey),
    ...recentFeedback
      .filter((feedback) => feedback.authorEmail && feedback.authorEmail === email)
      .map((feedback) => feedback.stableKey),
  ]);
  const userSourceExternalIds = new Set(
    recentFeedback
      .filter((feedback) => feedbackKeys.has(feedback.stableKey))
      .flatMap((feedback) => feedback.sourceLinks.map((link) => link.externalId)),
  );
  const muted = preference?.unsubscribed || preference?.mode === "muted";

  const visibleNotifications = notifications.filter((notification) => {
    if (notification.audience === "public") {
      return true;
    }
    if (deliveredNotificationIds.has(notification._id)) {
      return true;
    }
    if (notification.audience === "subscribers") {
      if (muted) {
        return false;
      }
      return (
        Boolean(preference) ||
        feedbackKeys.has(notification.relatedKey) ||
        notification.sourceLinks.some((link) => userSourceExternalIds.has(link.externalId))
      );
    }
    if (notification.audience === "admins") {
      return memberByEmail?.role === "owner" || memberByEmail?.role === "admin";
    }
    if (notification.audience === "reviewers") {
      return (
        memberByEmail?.role === "owner" ||
        memberByEmail?.role === "admin" ||
        memberByEmail?.role === "reviewer"
      );
    }
    return false;
  });

  return {
    notifications: visibleNotifications.map(normalizeNotification),
    seenUpdateKeys: seenEvents
      .filter((event) => event.event === "update_seen" && event.updateKey)
      .map((event) => event.updateKey),
    user: {
      accountId: externalUser?.accountId ?? preference?.accountId,
      email,
      externalUserId: args.externalUserId,
      preference: preference ? normalizeNotificationPreference(preference) : null,
    },
  };
}
