import { v } from "convex/values";

import {
  buildBriefStatusValue,
  portalRoadmapStatus,
  reviewStatus,
  sourceKindValue,
  sourceProviderValue,
} from "../lib/amendValidators";
import { projectScopeArgs, workspaceScopeArgs } from "../lib/amendFunctionArgShared";

export const getDashboardOverviewArgs = projectScopeArgs;
export const getAgentRunContextArgs = projectScopeArgs;
export const runProactiveAgentForWorkspaceArgs = projectScopeArgs;
export const getAgentRunsArgs = projectScopeArgs;
export const getAgentRunsForApiArgs = projectScopeArgs;
export const workspaceOnlyArgs = workspaceScopeArgs;

export const getPublicPortalArgs = {
  ...workspaceScopeArgs,
  roadmapStatus: v.optional(portalRoadmapStatus),
};

export const getReviewQueueArgs = {
  ...workspaceScopeArgs,
  status: v.optional(reviewStatus),
};

export const getUserUpdatesArgs = {
  ...workspaceScopeArgs,
  externalUserId: v.optional(v.string()),
  email: v.optional(v.string()),
};

export const getSourceEventsArgs = {
  ...projectScopeArgs,
  provider: v.optional(sourceProviderValue),
  kind: v.optional(sourceKindValue),
  limit: v.optional(v.number()),
};

export const getBuildBriefsArgs = {
  ...projectScopeArgs,
  status: v.optional(buildBriefStatusValue),
};

export const resolveCustomDomainArgs = {
  domain: v.string(),
  purpose: v.optional(v.union(v.literal("portal"), v.literal("embed"), v.literal("api"))),
};
