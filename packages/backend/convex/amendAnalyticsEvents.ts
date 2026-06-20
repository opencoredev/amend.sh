import type { Doc } from "./_generated/dataModel";

export type AnalyticsEventName = Doc<"eventRecords">["event"];
export type AnalyticsEventCategory =
  | "agent"
  | "delivery"
  | "feedback"
  | "identity"
  | "project"
  | "roadmap"
  | "source"
  | "update";

export const analyticsEventCategories: Record<AnalyticsEventName, AnalyticsEventCategory> = {
  account_identify: "identity",
  agent_run_completed: "agent",
  changelog_upserted: "update",
  changelog_published: "update",
  changelog_scheduled: "update",
  changelog_viewed: "update",
  comment_added: "feedback",
  delivery_planned: "delivery",
  delivery_status_updated: "delivery",
  feedback_submitted: "feedback",
  identify: "identity",
  project_created: "project",
  project_source_connected: "project",
  reaction_added: "feedback",
  review_status_updated: "agent",
  roadmap_upserted: "roadmap",
  roadmap_viewed: "roadmap",
  roadmap_vote_added: "roadmap",
  roadmap_vote_removed: "roadmap",
  shipped_feature_used: "update",
  source_event_ingested: "source",
  sign_in_failed: "identity",
  sign_in_submitted: "identity",
  sign_up_failed: "identity",
  sign_up_submitted: "identity",
  update_seen: "update",
  user_signed_in: "identity",
  user_signed_out: "identity",
  user_signed_up: "identity",
  vote_added: "feedback",
  vote_removed: "feedback",
};

export function analyticsEventCategory(event: AnalyticsEventName) {
  return analyticsEventCategories[event];
}
