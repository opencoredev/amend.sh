import { v } from "convex/values";

import { agentDecisionCandidateValue, reviewStatus } from "../lib/amendValidators";
import { projectScopeArgs, workspaceScopeArgs } from "../lib/amendFunctionArgShared";

export const persistProactiveAgentRunArgs = {
  ...projectScopeArgs,
  decisions: v.array(agentDecisionCandidateValue),
  provider: v.string(),
  providerConfigured: v.boolean(),
  error: v.optional(v.string()),
};

export const updateAutomationRulesArgs = {
  ...workspaceScopeArgs,
  mode: v.optional(
    v.union(v.literal("mostly_auto"), v.literal("review_first"), v.literal("manual")),
  ),
  autoUpdateFeedbackStatus: v.optional(v.boolean()),
  autoUpdateRoadmapStatus: v.optional(v.boolean()),
  autoDraftChangelog: v.optional(v.boolean()),
  autoPublishChangelog: v.optional(v.boolean()),
  autoNotifyUsers: v.optional(v.boolean()),
  requireReviewBelowConfidence: v.optional(v.number()),
  requireReviewForPublicCopy: v.optional(v.boolean()),
  requireReviewForHighImpact: v.optional(v.boolean()),
  byokProvider: v.optional(v.string()),
  byokConfigured: v.optional(v.boolean()),
};

export const updateReviewStatusArgs = {
  ...workspaceScopeArgs,
  reviewItemId: v.optional(v.id("reviewItems")),
  reviewKey: v.optional(v.string()),
  status: reviewStatus,
  reviewerName: v.optional(v.string()),
  note: v.optional(v.string()),
};

export const revertAutomationDecisionArgs = {
  ...workspaceScopeArgs,
  decisionId: v.optional(v.id("automationDecisions")),
  decisionKey: v.optional(v.string()),
};
