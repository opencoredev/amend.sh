import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const sourceProvider = v.union(v.literal("github"), v.literal("portal"), v.literal("manual"));

const sourceKind = v.union(
  v.literal("pull_request"),
  v.literal("issue"),
  v.literal("release"),
  v.literal("label"),
  v.literal("milestone"),
  v.literal("discussion"),
  v.literal("portal_feedback"),
);

const sourceState = v.union(
  v.literal("open"),
  v.literal("closed"),
  v.literal("merged"),
  v.literal("published"),
  v.literal("draft"),
);

const sourceLink = v.object({
  provider: sourceProvider,
  owner: v.optional(v.string()),
  repo: v.optional(v.string()),
  kind: sourceKind,
  externalId: v.string(),
  number: v.optional(v.number()),
  title: v.string(),
  url: v.string(),
  state: v.optional(sourceState),
  observedAt: v.number(),
});

const watches = v.object({
  pullRequests: v.boolean(),
  issues: v.boolean(),
  releases: v.boolean(),
  labels: v.boolean(),
  milestones: v.boolean(),
});

const loopEvent = v.union(
  v.literal("identify"),
  v.literal("account_identify"),
  v.literal("feedback_submitted"),
  v.literal("vote_added"),
  v.literal("vote_removed"),
  v.literal("comment_added"),
  v.literal("reaction_added"),
  v.literal("roadmap_viewed"),
  v.literal("changelog_viewed"),
  v.literal("update_seen"),
  v.literal("shipped_feature_used"),
);

const feedbackInteractionKind = v.union(
  v.literal("vote"),
  v.literal("comment"),
  v.literal("reaction"),
);

const integrationProvider = v.union(
  v.literal("github"),
  v.literal("linear"),
  v.literal("slack"),
  v.literal("discord"),
  v.literal("x"),
  v.literal("posthog"),
  v.literal("databuddy"),
  v.literal("support"),
);

const memberRole = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("reviewer"),
  v.literal("member"),
  v.literal("viewer"),
);

export default defineSchema({
  workspaces: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    visibility: v.union(v.literal("private"), v.literal("public")),
    portalSettings: v.optional(
      v.object({
        accentColor: v.optional(v.string()),
        changelogVisibility: v.union(v.literal("public"), v.literal("private")),
        feedbackMode: v.union(v.literal("open"), v.literal("authenticated"), v.literal("closed")),
        headline: v.optional(v.string()),
        intro: v.optional(v.string()),
        roadmapVisibility: v.union(v.literal("public"), v.literal("private")),
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

  changelogEntries: defineTable({
    workspaceId: v.id("workspaces"),
    projectId: v.optional(v.id("projects")),
    stableKey: v.string(),
    title: v.string(),
    summary: v.string(),
    body: v.string(),
    version: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("in_review"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("archived"),
    ),
    category: v.union(
      v.literal("added"),
      v.literal("changed"),
      v.literal("fixed"),
      v.literal("removed"),
      v.literal("security"),
    ),
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
    status: v.union(
      v.literal("considering"),
      v.literal("under_review"),
      v.literal("planned"),
      v.literal("in_progress"),
      v.literal("shipped"),
      v.literal("closed"),
      v.literal("paused"),
    ),
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
    source: v.union(v.literal("sdk"), v.literal("rest"), v.literal("portal"), v.literal("embed")),
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
    source: v.union(v.literal("sdk"), v.literal("rest"), v.literal("portal"), v.literal("embed")),
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
    source: v.union(v.literal("sdk"), v.literal("rest"), v.literal("portal"), v.literal("embed")),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_and_event", ["workspaceId", "event"])
    .index("by_workspace_and_externalUserId", ["workspaceId", "externalUserId"])
    .index("by_workspace_and_createdAt", ["workspaceId", "createdAt"]),

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
    status: v.union(
      v.literal("needs_review"),
      v.literal("approved"),
      v.literal("changes_requested"),
      v.literal("published"),
      v.literal("skipped"),
    ),
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
});
