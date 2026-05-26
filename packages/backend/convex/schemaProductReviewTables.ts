import { defineTable } from "convex/server";
import { v } from "convex/values";

import { reviewStatus, sourceLink } from "./schemaShared";

export const productReviewTables = {
  reviewItems: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    stableKey: v.string(),
    kind: v.union(
      v.literal("changelog"),
      v.literal("roadmap"),
      v.literal("feedback"),
      v.literal("notification"),
      v.literal("plan"),
    ),
    status: reviewStatus,
    title: v.string(),
    summary: v.string(),
    targetKey: v.string(),
    sourceLinks: v.array(sourceLink),
    comments: v.array(
      v.object({
        authorName: v.string(),
        body: v.string(),
        createdAt: v.number(),
      }),
    ),
    requestedBy: v.string(),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_project", ["projectId"])
    .index("by_workspace_and_stableKey", ["workspaceId", "stableKey"])
    .index("by_workspace_and_status", ["workspaceId", "status"])
    .index("by_workspace_and_kind_and_status", ["workspaceId", "kind", "status"])
    .index("by_workspace_and_updatedAt", ["workspaceId", "updatedAt"]),
};
