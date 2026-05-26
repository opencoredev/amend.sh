import { defineTable } from "convex/server";
import { v } from "convex/values";

import { sourceKind, sourceProvider, sourceState, watches } from "./schemaShared";

export const workspaceSourceTables = {
  githubConnections: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    provider: v.literal("github"),
    owner: v.string(),
    repo: v.string(),
    repositoryUrl: v.string(),
    defaultBranch: v.string(),
    installationState: v.union(
      v.literal("demo"),
      v.literal("connected"),
      v.literal("disconnected"),
    ),
    watches,
    syncStatus: v.optional(
      v.union(v.literal("healthy"), v.literal("syncing"), v.literal("attention")),
    ),
    lastSyncError: v.optional(v.string()),
    lastSyncedAt: v.optional(v.number()),
    lastWebhookDeliveryAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_project", ["projectId"])
    .index("by_workspace_and_owner_and_repo", ["workspaceId", "owner", "repo"])
    .index("by_owner_and_repo", ["owner", "repo"]),

  sourceEvents: defineTable({
    workspaceId: v.id("workspaces"),
    connectionId: v.optional(v.id("githubConnections")),
    projectId: v.optional(v.id("projects")),
    provider: sourceProvider,
    owner: v.optional(v.string()),
    repo: v.optional(v.string()),
    kind: sourceKind,
    externalId: v.string(),
    number: v.optional(v.number()),
    title: v.string(),
    url: v.string(),
    state: v.optional(sourceState),
    labels: v.array(v.string()),
    milestone: v.optional(v.string()),
    author: v.optional(v.string()),
    sourceCreatedAt: v.number(),
    sourceUpdatedAt: v.number(),
    observedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_project", ["projectId"])
    .index("by_workspace_and_externalId", ["workspaceId", "externalId"])
    .index("by_workspace_and_kind_and_observedAt", ["workspaceId", "kind", "observedAt"])
    .index("by_workspace_and_observedAt", ["workspaceId", "observedAt"]),
};
