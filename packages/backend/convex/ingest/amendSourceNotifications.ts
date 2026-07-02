import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { defaultDeliveryProvider } from "../delivery/amendNotifications";
import type { SourceLink } from "../lib/amendTypes";

export async function queueShippedWorkNotification(
  ctx: MutationCtx,
  args: {
    now: number;
    projectId?: Id<"projects">;
    relatedFeedback: Doc<"feedbackItems">[];
    rules?: Doc<"automationRules"> | null;
    sourceLink: SourceLink;
    stableKey: string;
    title: string;
    workspaceId: Id<"workspaces">;
  },
) {
  if (args.relatedFeedback.length === 0) return undefined;

  const notificationKey = `notification-${args.stableKey}-shipped`;
  const existingNotification = await ctx.db
    .query("notifications")
    .withIndex("by_workspace_and_stableKey", (q) =>
      q.eq("workspaceId", args.workspaceId).eq("stableKey", notificationKey),
    )
    .unique();
  const notification = {
    workspaceId: args.workspaceId,
    ...(args.projectId ? { projectId: args.projectId } : {}),
    stableKey: notificationKey,
    title: "Requested work shipped",
    body: `${args.title} shipped and ${args.relatedFeedback.length} linked request${args.relatedFeedback.length === 1 ? "" : "s"} can be notified.`,
    channel: "in_app" as const,
    audience: "subscribers" as const,
    status: "queued" as const,
    priority: "normal" as const,
    relatedKind: "changelog" as const,
    relatedKey: args.stableKey,
    sourceLinks: [args.sourceLink],
    updatedAt: args.now,
  };
  const notificationId = existingNotification
    ? (await ctx.db.patch(existingNotification._id, notification), existingNotification._id)
    : await ctx.db.insert("notifications", {
        ...notification,
        createdAt: args.now,
      });

  const subscriberRecipients = await collectSubscriberRecipients(ctx, {
    feedback: args.relatedFeedback,
    workspaceId: args.workspaceId,
  });

  for (const [recipient, delivery] of subscriberRecipients) {
    const existingDeliveries = await ctx.db
      .query("deliveryOutbox")
      .withIndex("by_workspace_and_recipient", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("recipient", recipient),
      )
      .collect();
    if (existingDeliveries.some((item) => item.notificationId === notificationId)) {
      continue;
    }
    await ctx.db.insert("deliveryOutbox", {
      workspaceId: args.workspaceId,
      notificationId,
      channel: delivery.channel,
      recipient,
      status: args.rules?.autoNotifyUsers ? "queued" : "skipped",
      provider: defaultDeliveryProvider(delivery.channel, delivery.deliveryMode),
      payload: {
        audience: notification.audience,
        body: notification.body,
        deliveryMode: delivery.deliveryMode,
        notificationKey: notification.stableKey,
        priority: notification.priority,
        relatedFeedbackKey: delivery.source,
        relatedKey: notification.relatedKey,
        relatedKind: notification.relatedKind,
        skipReason: args.rules?.autoNotifyUsers ? undefined : "automation_rule_requires_review",
        sourceLinks: notification.sourceLinks,
        title: notification.title,
      },
      createdAt: args.now,
      updatedAt: args.now,
    });
  }

  return notificationId;
}

async function collectSubscriberRecipients(
  ctx: MutationCtx,
  args: {
    feedback: Doc<"feedbackItems">[];
    workspaceId: Id<"workspaces">;
  },
) {
  const subscriberRecipients = new Map<
    string,
    { channel: "email" | "in_app"; deliveryMode: "instant"; source: string }
  >();
  for (const feedback of args.feedback) {
    if (feedback.authorEmail) {
      subscriberRecipients.set(feedback.authorEmail, {
        channel: "email",
        deliveryMode: "instant",
        source: feedback.stableKey,
      });
    }
    const interactions = await ctx.db
      .query("feedbackInteractions")
      .withIndex("by_workspace_and_feedbackKey", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("feedbackKey", feedback.stableKey),
      )
      .collect();
    for (const interaction of interactions) {
      if (interaction.externalUserId) {
        subscriberRecipients.set(interaction.externalUserId, {
          channel: "in_app",
          deliveryMode: "instant",
          source: feedback.stableKey,
        });
      }
      if (interaction.email) {
        subscriberRecipients.set(interaction.email, {
          channel: "email",
          deliveryMode: "instant",
          source: feedback.stableKey,
        });
      }
    }
  }
  return subscriberRecipients;
}
