import { defineTable } from "convex/server";
import { v } from "convex/values";

import { feedbackInteractionKind, loopEvent } from "./schemaShared";
import { sdkEventSource } from "./schemaProductCommon";

export const productIdentityTables = {
  feedbackInteractions: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    feedbackItemId: v.id("feedbackItems"),
    feedbackKey: v.string(),
    kind: feedbackInteractionKind,
    externalUserId: v.optional(v.string()),
    email: v.optional(v.string()),
    body: v.optional(v.string()),
    reaction: v.optional(v.string()),
    source: sdkEventSource,
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_project", ["projectId"])
    .index("by_feedback", ["feedbackItemId"])
    .index("by_workspace_and_feedbackKey", ["workspaceId", "feedbackKey"])
    .index("by_workspace_and_externalUserId", ["workspaceId", "externalUserId"])
    .index("by_workspace_and_createdAt", ["workspaceId", "createdAt"]),

  roadmapInteractions: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    roadmapItemId: v.id("roadmapItems"),
    roadmapKey: v.string(),
    externalUserId: v.optional(v.string()),
    email: v.optional(v.string()),
    source: sdkEventSource,
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_project", ["projectId"])
    .index("by_roadmap", ["roadmapItemId"])
    .index("by_workspace_and_roadmapKey", ["workspaceId", "roadmapKey"])
    .index("by_workspace_and_externalUserId", ["workspaceId", "externalUserId"]),

  externalUsers: defineTable({
    workspaceId: v.id("workspaces"),
    externalUserId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    accountId: v.optional(v.string()),
    traits: v.optional(v.any()),
    firstSeenAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_externalUserId", ["workspaceId", "externalUserId"])
    .index("by_workspace_and_accountId", ["workspaceId", "accountId"]),

  eventRecords: defineTable({
    workspaceId: v.id("workspaces"),
    event: loopEvent,
    externalUserId: v.optional(v.string()),
    accountId: v.optional(v.string()),
    updateKey: v.optional(v.string()),
    metadata: v.optional(v.any()),
    source: sdkEventSource,
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_event", ["workspaceId", "event"])
    .index("by_workspace_and_externalUserId", ["workspaceId", "externalUserId"])
    .index("by_workspace_and_createdAt", ["workspaceId", "createdAt"]),
};
