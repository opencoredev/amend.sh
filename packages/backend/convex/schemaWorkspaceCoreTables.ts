import { defineTable } from "convex/server";
import { v } from "convex/values";

import { memberRole, portalFeedbackMode, portalVisibility } from "./schemaShared";

export const workspaceCoreTables = {
  workspaces: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    visibility: v.union(v.literal("private"), v.literal("public")),
    portalSettings: v.optional(
      v.object({
        accentColor: v.optional(v.string()),
        changelogVisibility: portalVisibility,
        feedbackMode: portalFeedbackMode,
        headline: v.optional(v.string()),
        intro: v.optional(v.string()),
        roadmapVisibility: portalVisibility,
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  projects: defineTable({
    workspaceId: v.id("workspaces"),
    stableKey: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    repositoryUrl: v.optional(v.string()),
    sourceMode: v.optional(v.union(v.literal("feedback"), v.literal("github"))),
    visibility: v.union(v.literal("private"), v.literal("public")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_stableKey", ["workspaceId", "stableKey"])
    .index("by_workspace_and_slug", ["workspaceId", "slug"]),

  plans: defineTable({
    workspaceId: v.id("workspaces"),
    tier: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("team"),
      v.literal("scale"),
      v.literal("enterprise"),
      v.literal("open_source"),
    ),
    billingState: v.union(
      v.literal("demo"),
      v.literal("trial"),
      v.literal("active"),
      v.literal("grace"),
      v.literal("open_source"),
    ),
    isOpenSource: v.boolean(),
    seats: v.number(),
    priceMonthly: v.optional(v.number()),
    limits: v.object({
      trackedRepos: v.number(),
      reviewers: v.number(),
      monthlyNotifications: v.number(),
    }),
    posture: v.object({
      publicRoadmap: v.boolean(),
      communityFeedback: v.boolean(),
      sourceLinkedPublishing: v.boolean(),
      selfHostFriendly: v.boolean(),
    }),
    notes: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_workspace", ["workspaceId"]),

  workspaceMembers: defineTable({
    workspaceId: v.id("workspaces"),
    externalUserId: v.optional(v.string()),
    email: v.string(),
    name: v.optional(v.string()),
    role: memberRole,
    permissions: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_externalUserId", ["externalUserId"])
    .index("by_email", ["email"])
    .index("by_workspace_and_email", ["workspaceId", "email"])
    .index("by_workspace_and_role", ["workspaceId", "role"]),

  waitlistEntries: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    company: v.optional(v.string()),
    source: v.optional(v.string()),
    status: v.union(v.literal("waitlisted"), v.literal("invited"), v.literal("converted")),
    requestCount: v.number(),
    lastRequestedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),
};
