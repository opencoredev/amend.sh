import { defineTable } from "convex/server";
import { v } from "convex/values";

import {
  changelogCategory,
  changelogStatus,
  portalRoadmapStatus,
  sourceLink,
} from "./schemaShared";

export const productContentTables = {
  changelogEntries: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    stableKey: v.string(),
    title: v.string(),
    summary: v.string(),
    body: v.string(),
    version: v.optional(v.string()),
    status: changelogStatus,
    category: changelogCategory,
    tags: v.array(v.string()),
    sourceEventIds: v.array(v.id("sourceEvents")),
    sourceLinks: v.array(sourceLink),
    reviewerStatus: v.union(
      v.literal("needs_review"),
      v.literal("approved"),
      v.literal("changes_requested"),
    ),
    authorName: v.string(),
    scheduledFor: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_project", ["projectId"])
    .index("by_workspace_and_stableKey", ["workspaceId", "stableKey"])
    .index("by_workspace_and_status", ["workspaceId", "status"])
    .index("by_workspace_and_publishedAt", ["workspaceId", "publishedAt"])
    .index("by_workspace_and_createdAt", ["workspaceId", "createdAt"]),

  roadmapItems: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    stableKey: v.string(),
    title: v.string(),
    description: v.string(),
    status: portalRoadmapStatus,
    priority: v.union(v.literal("P0"), v.literal("P1"), v.literal("P2"), v.literal("P3")),
    target: v.optional(v.string()),
    impact: v.string(),
    votes: v.optional(v.number()),
    feedbackItemIds: v.array(v.id("feedbackItems")),
    changelogEntryIds: v.array(v.id("changelogEntries")),
    sourceEventIds: v.array(v.id("sourceEvents")),
    sourceLinks: v.array(sourceLink),
    createdAt: v.number(),
    updatedAt: v.number(),
    shippedAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_project", ["projectId"])
    .index("by_workspace_and_stableKey", ["workspaceId", "stableKey"])
    .index("by_workspace_and_status", ["workspaceId", "status"])
    .index("by_workspace_and_priority", ["workspaceId", "priority"])
    .index("by_workspace_and_createdAt", ["workspaceId", "createdAt"]),

  feedbackItems: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    stableKey: v.string(),
    title: v.string(),
    body: v.string(),
    authorName: v.string(),
    authorEmail: v.optional(v.string()),
    source: v.union(
      v.literal("portal"),
      v.literal("github_issue"),
      v.literal("imported"),
      v.literal("internal"),
    ),
    status: v.union(
      v.literal("new"),
      v.literal("triaged"),
      v.literal("linked"),
      v.literal("planned"),
      v.literal("shipped"),
      v.literal("closed"),
    ),
    sentiment: v.union(v.literal("positive"), v.literal("neutral"), v.literal("negative")),
    votes: v.number(),
    labels: v.array(v.string()),
    linkedRoadmapItemIds: v.array(v.id("roadmapItems")),
    linkedChangelogEntryIds: v.array(v.id("changelogEntries")),
    sourceEventIds: v.array(v.id("sourceEvents")),
    sourceLinks: v.array(sourceLink),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_project", ["projectId"])
    .index("by_workspace_and_stableKey", ["workspaceId", "stableKey"])
    .index("by_workspace_and_status", ["workspaceId", "status"])
    .index("by_workspace_and_createdAt", ["workspaceId", "createdAt"])
    .searchIndex("search_feedback", {
      searchField: "body",
      filterFields: ["workspaceId", "status"],
    }),
};
