import { defineTable } from "convex/server";
import { v } from "convex/values";

import { agentRunStatus, buildBriefPriority, buildBriefStatus, sourceLink } from "./schemaShared";

export const workspaceAutomationTables = {
  automationRules: defineTable({
    workspaceId: v.id("workspaces"),
    mode: v.union(v.literal("mostly_auto"), v.literal("review_first"), v.literal("manual")),
    autoUpdateFeedbackStatus: v.boolean(),
    autoUpdateRoadmapStatus: v.boolean(),
    autoDraftChangelog: v.boolean(),
    autoPublishChangelog: v.boolean(),
    autoNotifyUsers: v.boolean(),
    requireReviewBelowConfidence: v.number(),
    requireReviewForPublicCopy: v.boolean(),
    requireReviewForHighImpact: v.boolean(),
    byokProvider: v.optional(v.string()),
    byokConfigured: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_workspace", ["workspaceId"]),

  automationDecisions: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    stableKey: v.string(),
    action: v.union(
      v.literal("link_signal_to_source"),
      v.literal("draft_changelog"),
      v.literal("update_roadmap_status"),
      v.literal("update_feedback_status"),
      v.literal("notify_users"),
    ),
    targetKind: v.union(
      v.literal("changelog"),
      v.literal("roadmap"),
      v.literal("feedback"),
      v.literal("notification"),
      v.literal("source"),
    ),
    targetKey: v.string(),
    confidence: v.number(),
    needsReview: v.boolean(),
    outcome: v.union(v.literal("applied"), v.literal("queued_for_review"), v.literal("skipped")),
    summary: v.string(),
    sourceLinks: v.array(sourceLink),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_project", ["projectId"])
    .index("by_workspace_and_stableKey", ["workspaceId", "stableKey"])
    .index("by_workspace_and_action", ["workspaceId", "action"])
    .index("by_workspace_and_createdAt", ["workspaceId", "createdAt"]),

  agentRuns: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    stableKey: v.string(),
    status: agentRunStatus,
    provider: v.string(),
    providerConfigured: v.boolean(),
    decisionCount: v.number(),
    reviewCount: v.number(),
    sourceEventCount: v.number(),
    error: v.optional(v.string()),
    decisionIds: v.array(v.id("automationDecisions")),
    reviewItemIds: v.array(v.id("reviewItems")),
    sourceLinks: v.array(sourceLink),
    startedAt: v.number(),
    completedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_project", ["projectId"])
    .index("by_workspace_and_stableKey", ["workspaceId", "stableKey"])
    .index("by_workspace_and_completedAt", ["workspaceId", "completedAt"]),

  buildBriefs: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    stableKey: v.string(),
    title: v.string(),
    problem: v.string(),
    evidenceSummary: v.string(),
    recommendedScope: v.string(),
    acceptanceCriteria: v.array(v.string()),
    suggestedFiles: v.array(v.string()),
    sourceEventIds: v.array(v.id("sourceEvents")),
    feedbackItemIds: v.array(v.id("feedbackItems")),
    roadmapItemIds: v.array(v.id("roadmapItems")),
    changelogEntryIds: v.array(v.id("changelogEntries")),
    sourceLinks: v.array(sourceLink),
    status: buildBriefStatus,
    priority: buildBriefPriority,
    targetAgent: v.optional(
      v.union(v.literal("claude"), v.literal("codex"), v.literal("cursor"), v.literal("generic")),
    ),
    createdBy: v.string(),
    exportedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_project", ["projectId"])
    .index("by_workspace_and_stableKey", ["workspaceId", "stableKey"])
    .index("by_workspace_and_status", ["workspaceId", "status"])
    .index("by_workspace_and_priority", ["workspaceId", "priority"])
    .index("by_workspace_and_updatedAt", ["workspaceId", "updatedAt"]),
};
