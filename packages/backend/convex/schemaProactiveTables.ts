import { defineTable } from "convex/server";
import { v } from "convex/values";

import {
  proactiveConfidenceBucketValue,
  proactiveDraftKindValue,
  proactiveDraftStatusValue,
  proactiveMemoryKindValue,
  proactivePromotedByValue,
  proactiveSourceChannelValue,
  proactiveStatusValue,
  proactiveStrengthValue,
} from "./proactiveValidators";

export const proactiveTables = {
  needs: defineTable({
    workspaceId: v.id("workspaces"),
    title: v.string(),
    status: proactiveStatusValue,
    proofPeople: v.number(),
    proofPayingPeople: v.number(),
    proofSources: v.array(
      v.object({
        channel: proactiveSourceChannelValue,
        count: v.number(),
      }),
    ),
    proofStrength: proactiveStrengthValue,
    proofGrowthPerWeek: v.number(),
    sampleQuotes: v.array(
      v.object({
        text: v.string(),
        author: v.string(),
        channel: proactiveSourceChannelValue,
        url: v.string(),
      }),
    ),
    firstSeen: v.number(),
    lastSeen: v.number(),
    linkedShip: v.optional(
      v.object({
        prNumber: v.number(),
        sha: v.string(),
        releaseTag: v.optional(v.string()),
        mergedAt: v.number(),
        url: v.string(),
      }),
    ),
    conditionFlags: v.object({
      readyForReview: v.boolean(),
      hasLinkedShip: v.boolean(),
      digestEligible: v.boolean(),
    }),
    clusterKey: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_status", ["workspaceId", "status"])
    .index("by_workspace_and_clusterKey", ["workspaceId", "clusterKey"])
    .index("by_workspace_and_lastSeen", ["workspaceId", "lastSeen"]),

  evidence: defineTable({
    workspaceId: v.id("workspaces"),
    needId: v.id("needs"),
    sourceEventId: v.optional(v.id("sourceEvents")),
    personId: v.optional(v.id("persons")),
    sourceChannel: proactiveSourceChannelValue,
    author: v.string(),
    handle: v.optional(v.string()),
    text: v.string(),
    url: v.string(),
    confidenceBucket: proactiveConfidenceBucketValue,
    promotedBy: proactivePromotedByValue,
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_need", ["needId"])
    .index("by_sourceEvent", ["sourceEventId"])
    .index("by_person", ["personId"]),

  needVectors: defineTable({
    workspaceId: v.id("workspaces"),
    needId: v.id("needs"),
    embedding: v.array(v.float64()),
    model: v.string(),
    textHash: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_need", ["needId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["workspaceId"],
    }),

  persons: defineTable({
    workspaceId: v.id("workspaces"),
    displayName: v.string(),
    verifiedEmail: v.optional(v.string()),
    accountId: v.optional(v.string()),
    paying: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_email", ["workspaceId", "verifiedEmail"])
    .index("by_workspace_and_accountId", ["workspaceId", "accountId"]),

  identityHandles: defineTable({
    workspaceId: v.id("workspaces"),
    personId: v.id("persons"),
    provider: proactiveSourceChannelValue,
    handle: v.string(),
    verified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_person", ["personId"])
    .index("by_workspace_and_provider_and_handle", ["workspaceId", "provider", "handle"]),

  draftProposals: defineTable({
    workspaceId: v.id("workspaces"),
    kind: proactiveDraftKindValue,
    needId: v.id("needs"),
    needTitle: v.string(),
    draftText: v.string(),
    recipients: v.optional(
      v.array(
        v.object({
          handle: v.string(),
          channel: v.string(),
        }),
      ),
    ),
    status: proactiveDraftStatusValue,
    approvedAt: v.optional(v.number()),
    rejectedAt: v.optional(v.number()),
    edits: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_status", ["workspaceId", "status"])
    .index("by_need", ["needId"]),

  memoryRules: defineTable({
    workspaceId: v.id("workspaces"),
    kind: proactiveMemoryKindValue,
    text: v.string(),
    taughtBy: v.string(),
    taughtAt: v.number(),
    blastRadius: v.number(),
    enabled: v.boolean(),
    sourceNeedId: v.optional(v.id("needs")),
    undoneAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_enabled", ["workspaceId", "enabled"])
    .index("by_workspace_and_kind", ["workspaceId", "kind"]),

  proactivePipelineEvents: defineTable({
    workspaceId: v.id("workspaces"),
    sourceEventId: v.optional(v.id("sourceEvents")),
    externalId: v.string(),
    state: v.union(
      v.literal("queued"),
      v.literal("processed"),
      v.literal("suppressed"),
      v.literal("failed"),
    ),
    dedupeKey: v.string(),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_dedupeKey", ["workspaceId", "dedupeKey"])
    .index("by_workspace_and_state", ["workspaceId", "state"]),
};
