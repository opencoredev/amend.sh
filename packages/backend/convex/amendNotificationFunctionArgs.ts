import { v } from "convex/values";

import { workspaceScopeArgs } from "./amendFunctionArgShared";

export const upsertNotificationPreferenceArgs = {
  ...workspaceScopeArgs,
  externalUserId: v.optional(v.string()),
  email: v.optional(v.string()),
  accountId: v.optional(v.string()),
  mode: v.union(v.literal("instant"), v.literal("digest"), v.literal("muted")),
  unsubscribed: v.optional(v.boolean()),
  digestDay: v.optional(v.string()),
  digestHour: v.optional(v.number()),
};

export const planNotificationDeliveriesArgs = {
  ...workspaceScopeArgs,
  notificationKey: v.optional(v.string()),
  channel: v.optional(
    v.union(v.literal("in_app"), v.literal("email"), v.literal("slack"), v.literal("webhook")),
  ),
  provider: v.optional(v.string()),
};

export const updateDeliveryStatusArgs = {
  deliveryId: v.id("deliveryOutbox"),
  lastError: v.optional(v.string()),
  provider: v.optional(v.string()),
  providerMessageId: v.optional(v.string()),
  status: v.union(
    v.literal("queued"),
    v.literal("sent"),
    v.literal("skipped"),
    v.literal("failed"),
  ),
};
