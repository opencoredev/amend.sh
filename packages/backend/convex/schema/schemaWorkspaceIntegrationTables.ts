import { defineTable } from "convex/server";
import { v } from "convex/values";

import { integrationProvider } from "./schemaShared";

export const workspaceIntegrationTables = {
  integrationConnections: defineTable({
    workspaceId: v.id("workspaces"),
    provider: integrationProvider,
    direction: v.union(v.literal("inbound"), v.literal("outbound"), v.literal("bidirectional")),
    state: v.union(
      v.literal("planned"),
      v.literal("connected"),
      v.literal("attention"),
      v.literal("disabled"),
    ),
    displayName: v.string(),
    config: v.optional(v.any()),
    lastSyncedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_provider", ["workspaceId", "provider"])
    .index("by_workspace_and_state", ["workspaceId", "state"]),

  customDomains: defineTable({
    workspaceId: v.id("workspaces"),
    domain: v.string(),
    purpose: v.union(v.literal("portal"), v.literal("embed"), v.literal("api")),
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("failed")),
    verificationToken: v.string(),
    lastCheckedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_domain", ["domain"])
    .index("by_workspace_and_status", ["workspaceId", "status"]),
};
