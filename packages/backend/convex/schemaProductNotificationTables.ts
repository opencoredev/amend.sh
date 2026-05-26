import { defineTable } from "convex/server";
import { v } from "convex/values";

import { sourceLink } from "./schemaShared";

export const productNotificationTables = {
  notificationPreferences: defineTable({
    workspaceId: v.id("workspaces"),
    externalUserId: v.optional(v.string()),
    email: v.optional(v.string()),
    accountId: v.optional(v.string()),
    mode: v.union(v.literal("instant"), v.literal("digest"), v.literal("muted")),
    unsubscribed: v.boolean(),
    digestDay: v.optional(v.string()),
    digestHour: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_externalUserId", ["workspaceId", "externalUserId"])
    .index("by_workspace_and_email", ["workspaceId", "email"]),

  notifications: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    stableKey: v.string(),
    title: v.string(),
    body: v.string(),
    channel: v.union(
      v.literal("in_app"),
      v.literal("email"),
      v.literal("slack"),
      v.literal("webhook"),
    ),
    audience: v.union(
      v.literal("admins"),
      v.literal("reviewers"),
      v.literal("subscribers"),
      v.literal("public"),
    ),
    status: v.union(
      v.literal("queued"),
      v.literal("sent"),
      v.literal("read"),
      v.literal("dismissed"),
      v.literal("failed"),
    ),
    priority: v.union(v.literal("low"), v.literal("normal"), v.literal("high")),
    relatedKind: v.union(
      v.literal("changelog"),
      v.literal("roadmap"),
      v.literal("feedback"),
      v.literal("review"),
      v.literal("plan"),
    ),
    relatedKey: v.string(),
    sourceLinks: v.array(sourceLink),
    createdAt: v.number(),
    updatedAt: v.number(),
    sentAt: v.optional(v.number()),
    readAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_project", ["projectId"])
    .index("by_workspace_and_stableKey", ["workspaceId", "stableKey"])
    .index("by_workspace_and_status", ["workspaceId", "status"])
    .index("by_workspace_and_createdAt", ["workspaceId", "createdAt"]),

  deliveryOutbox: defineTable({
    workspaceId: v.id("workspaces"),
    notificationId: v.optional(v.id("notifications")),
    channel: v.union(
      v.literal("in_app"),
      v.literal("email"),
      v.literal("slack"),
      v.literal("webhook"),
    ),
    recipient: v.string(),
    status: v.union(
      v.literal("queued"),
      v.literal("sent"),
      v.literal("skipped"),
      v.literal("failed"),
    ),
    provider: v.optional(v.string()),
    providerMessageId: v.optional(v.string()),
    payload: v.any(),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    sentAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_status", ["workspaceId", "status"])
    .index("by_workspace_and_recipient", ["workspaceId", "recipient"]),
};
