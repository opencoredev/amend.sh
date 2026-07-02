import { v } from "convex/values";

import {
  buildBriefStatusValue,
  changelogCategoryValue,
  changelogStatusValue,
  feedbackInteractionKind,
  integrationProviderValue,
  loopEvent,
  memberRoleValue,
  portalFeedbackMode,
  portalRoadmapStatus,
  portalVisibility,
  reviewStatus,
  sourceKindValue,
  sourceProviderValue,
  sourceStateValue,
} from "../lib/amendValidators";

export const sourceProvider = sourceProviderValue;
export const sourceKind = sourceKindValue;
export const sourceState = sourceStateValue;
export const buildBriefStatus = buildBriefStatusValue;
export const changelogStatus = changelogStatusValue;
export const changelogCategory = changelogCategoryValue;
export const integrationProvider = integrationProviderValue;
export const memberRole = memberRoleValue;

export {
  feedbackInteractionKind,
  loopEvent,
  portalFeedbackMode,
  portalRoadmapStatus,
  portalVisibility,
  reviewStatus,
};

export const buildBriefPriority = v.union(
  v.literal("P0"),
  v.literal("P1"),
  v.literal("P2"),
  v.literal("P3"),
);

export const agentRunStatus = v.union(
  v.literal("completed"),
  v.literal("completed_with_fallback"),
  v.literal("failed"),
);

export const sourceLink = v.object({
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

export const watches = v.object({
  pullRequests: v.boolean(),
  issues: v.boolean(),
  releases: v.boolean(),
  labels: v.boolean(),
  milestones: v.boolean(),
});
