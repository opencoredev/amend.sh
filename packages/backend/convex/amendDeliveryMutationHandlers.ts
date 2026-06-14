import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { recordAnalyticsEvent } from "./amendAnalytics";
import { compact, workspaceSlug } from "./amendBackendUtils";
import { normalizeDelivery } from "./amendNormalizers";
import { defaultDeliveryProvider, deliveryRecipients } from "./amendNotifications";
import { ensureBaseRecords } from "./amendSeed";
import { requireDashboardUser } from "./amendWorkspace";

type PlanNotificationDeliveriesArgs = {
  workspaceSlug?: string;
  notificationKey?: string;
  channel?: Doc<"deliveryOutbox">["channel"];
  provider?: string;
};

type UpdateDeliveryStatusArgs = {
  deliveryId: Id<"deliveryOutbox">;
  lastError?: string;
  provider?: string;
  providerMessageId?: string;
  status: Doc<"deliveryOutbox">["status"];
};

export async function planNotificationDeliveriesHandler(
  ctx: MutationCtx,
  args: PlanNotificationDeliveriesArgs,
) {
  await requireDashboardUser(ctx);
  return await trustedPlanNotificationDeliveriesHandler(ctx, args);
}

export async function trustedPlanNotificationDeliveriesHandler(
  ctx: MutationCtx,
  args: PlanNotificationDeliveriesArgs,
) {
  const now = Date.now();
  const normalizedWorkspaceSlug = workspaceSlug(args.workspaceSlug);
  const workspace = await ensureBaseRecords(ctx, normalizedWorkspaceSlug);
  const notifications = args.notificationKey
    ? compact([
        await ctx.db
          .query("notifications")
          .withIndex("by_workspace_and_stableKey", (q) =>
            q.eq("workspaceId", workspace._id).eq("stableKey", args.notificationKey!),
          )
          .unique(),
      ])
    : await ctx.db
        .query("notifications")
        .withIndex("by_workspace_and_status", (q) =>
          q.eq("workspaceId", workspace._id).eq("status", "queued"),
        )
        .take(50);

  const [members, preferences, externalUsers] = await Promise.all([
    ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .collect(),
    ctx.db
      .query("notificationPreferences")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .collect(),
    ctx.db
      .query("externalUsers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .take(200),
  ]);

  let duplicate = 0;
  const deliveryIds: Array<Id<"deliveryOutbox">> = [];
  const insertedDeliveries: Array<Doc<"deliveryOutbox">> = [];

  for (const notification of notifications) {
    const channel = args.channel ?? notification.channel;
    const recipients = deliveryRecipients(
      notification,
      channel,
      members,
      preferences,
      externalUsers,
    );

    for (const recipient of recipients) {
      const existing = await ctx.db
        .query("deliveryOutbox")
        .withIndex("by_workspace_and_recipient", (q) =>
          q.eq("workspaceId", workspace._id).eq("recipient", recipient.recipient),
        )
        .collect();
      const alreadyQueued = existing.some(
        (delivery) =>
          delivery.notificationId === notification._id &&
          delivery.channel === channel &&
          delivery.status !== "failed",
      );

      if (alreadyQueued) {
        duplicate += 1;
        continue;
      }

      const status = recipient.skipped ? ("skipped" as const) : ("queued" as const);
      const deliveryId = await ctx.db.insert("deliveryOutbox", {
        workspaceId: workspace._id,
        notificationId: notification._id,
        channel,
        recipient: recipient.recipient,
        status,
        provider: args.provider ?? defaultDeliveryProvider(channel, recipient.deliveryMode),
        payload: {
          audience: notification.audience,
          body: notification.body,
          deliveryMode: recipient.deliveryMode,
          notificationKey: notification.stableKey,
          priority: notification.priority,
          relatedKey: notification.relatedKey,
          relatedKind: notification.relatedKind,
          skipReason: recipient.skipReason,
          sourceLinks: notification.sourceLinks,
          title: notification.title,
        },
        createdAt: now,
        updatedAt: now,
      });
      deliveryIds.push(deliveryId);
      const delivery = await ctx.db.get(deliveryId);
      if (delivery) {
        insertedDeliveries.push(delivery);
      }
    }
  }

  await recordAnalyticsEvent(ctx, {
    workspaceId: workspace._id,
    workspaceSlug: normalizedWorkspaceSlug,
    event: "delivery_planned",
    metadata: {
      duplicate,
      notificationCount: notifications.length,
      planned: insertedDeliveries.filter((delivery) => delivery.status === "queued").length,
      skipped: insertedDeliveries.filter((delivery) => delivery.status === "skipped").length,
    },
    source: "rest",
  });

  return {
    duplicate,
    notificationCount: notifications.length,
    planned: insertedDeliveries.filter((delivery) => delivery.status === "queued").length,
    skipped: insertedDeliveries.filter((delivery) => delivery.status === "skipped").length,
    deliveryIds,
    deliveries: insertedDeliveries.map(normalizeDelivery),
  };
}

export async function updateDeliveryStatusHandler(
  ctx: MutationCtx,
  args: UpdateDeliveryStatusArgs,
) {
  await requireDashboardUser(ctx);
  return await trustedUpdateDeliveryStatusHandler(ctx, args);
}

export async function trustedUpdateDeliveryStatusHandler(
  ctx: MutationCtx,
  args: UpdateDeliveryStatusArgs,
) {
  const delivery = await ctx.db.get(args.deliveryId);
  if (!delivery) {
    throw new Error("Delivery not found");
  }
  const now = Date.now();
  await ctx.db.patch(args.deliveryId, {
    lastError: args.lastError,
    provider: args.provider ?? delivery.provider,
    providerMessageId: args.providerMessageId,
    status: args.status,
    updatedAt: now,
    ...(args.status === "sent" ? { sentAt: now } : {}),
  });
  const updated = await ctx.db.get(args.deliveryId);
  if (!updated) {
    throw new Error("Failed to update delivery");
  }
  const workspace = await ctx.db.get(updated.workspaceId);
  if (workspace) {
    await recordAnalyticsEvent(ctx, {
      workspaceId: updated.workspaceId,
      workspaceSlug: workspace.slug,
      event: "delivery_status_updated",
      metadata: {
        channel: updated.channel,
        deliveryId: updated._id,
        notificationId: updated.notificationId,
        provider: updated.provider,
        status: updated.status,
      },
      source: "rest",
    });
  }
  return normalizeDelivery(updated);
}
