import type { Doc } from "./_generated/dataModel";

export type AnalyticsEventName = Doc<"eventRecords">["event"];
export type AnalyticsEventCategory =
  | "agent"
  | "delivery"
  | "feedback"
  | "identity"
  | "roadmap"
  | "source"
  | "update";

export const analyticsEventCategories: Record<AnalyticsEventName, AnalyticsEventCategory> = {
  account_identify: "identity",
  agent_run_completed: "agent",
  changelog_upserted: "update",
  changelog_viewed: "update",
  comment_added: "feedback",
  delivery_planned: "delivery",
  delivery_status_updated: "delivery",
  feedback_submitted: "feedback",
  identify: "identity",
  reaction_added: "feedback",
  review_status_updated: "agent",
  roadmap_upserted: "roadmap",
  roadmap_viewed: "roadmap",
  roadmap_vote_added: "roadmap",
  roadmap_vote_removed: "roadmap",
  shipped_feature_used: "update",
  source_event_ingested: "source",
  update_seen: "update",
  vote_added: "feedback",
  vote_removed: "feedback",
};

export function analyticsEventCategory(event: AnalyticsEventName) {
  return analyticsEventCategories[event];
}
