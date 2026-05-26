export type IdentifyExternalUserArgs = {
  workspaceSlug?: string;
  externalUserId: string;
  email?: string;
  name?: string;
  accountId?: string;
  traits?: unknown;
};

export type TrackEventArgs = {
  workspaceSlug?: string;
  event:
    | "account_identify"
    | "changelog_viewed"
    | "comment_added"
    | "feedback_submitted"
    | "identify"
    | "reaction_added"
    | "roadmap_viewed"
    | "shipped_feature_used"
    | "update_seen"
    | "vote_added";
  externalUserId?: string;
  accountId?: string;
  updateKey?: string;
  metadata?: unknown;
  source?: "embed" | "portal" | "rest" | "sdk";
};

export type RecordFeedbackInteractionArgs = {
  workspaceSlug?: string;
  projectSlug?: string;
  feedbackKey: string;
  kind: "comment" | "reaction" | "vote";
  externalUserId?: string;
  email?: string;
  body?: string;
  reaction?: string;
  source?: "embed" | "portal" | "rest" | "sdk";
};

export type CreateFeedbackArgs = {
  workspaceSlug?: string;
  projectSlug?: string;
  title: string;
  body: string;
  authorName?: string;
  authorEmail?: string;
  sourceUrl?: string;
  labels?: string[];
};
