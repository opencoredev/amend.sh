import { type Infer, v } from "convex/values";

export const PROJECT_WEBSITE_LOOKUP_RATE_LIMIT = {
  capacity: 4,
  period: "minute",
  rate: 12,
};

export const reviewStatus = v.union(
  v.literal("needs_review"),
  v.literal("approved"),
  v.literal("changes_requested"),
  v.literal("published"),
  v.literal("skipped"),
);

export const portalRoadmapStatus = v.union(
  v.literal("considering"),
  v.literal("under_review"),
  v.literal("planned"),
  v.literal("in_progress"),
  v.literal("shipped"),
  v.literal("closed"),
  v.literal("paused"),
);

export const portalVisibility = v.union(v.literal("public"), v.literal("private"));
export const portalFeedbackMode = v.union(
  v.literal("open"),
  v.literal("authenticated"),
  v.literal("closed"),
);

export const changelogStatusValue = v.union(
  v.literal("draft"),
  v.literal("in_review"),
  v.literal("scheduled"),
  v.literal("published"),
  v.literal("archived"),
);

export const changelogCategoryValue = v.union(
  v.literal("added"),
  v.literal("changed"),
  v.literal("fixed"),
  v.literal("removed"),
  v.literal("security"),
);

export const planTierValue = v.union(
  v.literal("free"),
  v.literal("starter"),
  v.literal("pro"),
  v.literal("team"),
  v.literal("scale"),
  v.literal("enterprise"),
  v.literal("open_source"),
);

export const memberRoleValue = v.union(
  v.literal("owner"),
  v.literal("admin"),
  v.literal("reviewer"),
  v.literal("member"),
  v.literal("viewer"),
);

export const integrationProviderValue = v.union(
  v.literal("github"),
  v.literal("linear"),
  v.literal("slack"),
  v.literal("discord"),
  v.literal("x"),
  v.literal("posthog"),
  v.literal("databuddy"),
  v.literal("support"),
);

export const integrationDirectionValue = v.union(
  v.literal("inbound"),
  v.literal("outbound"),
  v.literal("bidirectional"),
);

export const integrationStateValue = v.union(
  v.literal("planned"),
  v.literal("connected"),
  v.literal("attention"),
  v.literal("disabled"),
);

const agentTargetKindValue = v.union(
  v.literal("changelog"),
  v.literal("feedback"),
  v.literal("notification"),
  v.literal("roadmap"),
  v.literal("source"),
);

export const agentDecisionCandidateValue = v.object({
  action: v.union(
    v.literal("link_signal_to_source"),
    v.literal("draft_changelog"),
    v.literal("update_roadmap_status"),
    v.literal("update_feedback_status"),
    v.literal("notify_users"),
  ),
  confidence: v.number(),
  needsReview: v.boolean(),
  outcome: v.union(v.literal("applied"), v.literal("queued_for_review"), v.literal("skipped")),
  sourceEventExternalIds: v.array(v.string()),
  summary: v.string(),
  targetKey: v.string(),
  targetKind: agentTargetKindValue,
});

export const buildBriefStatusValue = v.union(
  v.literal("draft"),
  v.literal("in_review"),
  v.literal("approved"),
  v.literal("exported"),
  v.literal("archived"),
);

export const sourceProviderValue = v.union(
  v.literal("api"),
  v.literal("cli"),
  v.literal("discord"),
  v.literal("email"),
  v.literal("embed"),
  v.literal("github"),
  v.literal("import"),
  v.literal("linear"),
  v.literal("manual"),
  v.literal("portal"),
  v.literal("sdk"),
  v.literal("slack"),
  v.literal("support"),
  v.literal("telegram"),
  v.literal("x"),
);

export type SourceProvider = Infer<typeof sourceProviderValue>;

export const sourceKindValue = v.union(
  v.literal("pull_request"),
  v.literal("issue"),
  v.literal("release"),
  v.literal("label"),
  v.literal("milestone"),
  v.literal("discussion"),
  v.literal("customer_signal"),
  v.literal("import_record"),
  v.literal("portal_feedback"),
  v.literal("support_ticket"),
  v.literal("usage_event"),
);

export const sourceStateValue = v.union(
  v.literal("open"),
  v.literal("closed"),
  v.literal("merged"),
  v.literal("published"),
  v.literal("draft"),
);

export const loopEvent = v.union(
  v.literal("identify"),
  v.literal("account_identify"),
  v.literal("sign_in_failed"),
  v.literal("sign_in_submitted"),
  v.literal("sign_up_failed"),
  v.literal("sign_up_submitted"),
  v.literal("user_signed_in"),
  v.literal("user_signed_out"),
  v.literal("user_signed_up"),
  v.literal("agent_run_completed"),
  v.literal("changelog_upserted"),
  v.literal("changelog_published"),
  v.literal("changelog_scheduled"),
  v.literal("feedback_submitted"),
  v.literal("project_created"),
  v.literal("project_source_connected"),
  v.literal("vote_added"),
  v.literal("vote_removed"),
  v.literal("comment_added"),
  v.literal("delivery_planned"),
  v.literal("delivery_status_updated"),
  v.literal("reaction_added"),
  v.literal("review_status_updated"),
  v.literal("roadmap_upserted"),
  v.literal("roadmap_vote_added"),
  v.literal("roadmap_vote_removed"),
  v.literal("roadmap_viewed"),
  v.literal("changelog_viewed"),
  v.literal("source_event_ingested"),
  v.literal("update_seen"),
  v.literal("shipped_feature_used"),
);

export const feedbackInteractionKind = v.union(
  v.literal("vote"),
  v.literal("comment"),
  v.literal("reaction"),
);
