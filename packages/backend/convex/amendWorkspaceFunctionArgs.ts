import { v } from "convex/values";

import {
  integrationDirectionValue,
  integrationProviderValue,
  integrationStateValue,
  memberRoleValue,
  planTierValue,
  portalFeedbackMode,
  portalVisibility,
} from "./amendValidators";
import { workspaceScopeArgs } from "./amendFunctionArgShared";

export const joinSeededDemoWorkspaceArgs = {
  ...workspaceScopeArgs,
  email: v.string(),
  name: v.optional(v.string()),
};

export const upsertWorkspaceMemberArgs = {
  ...workspaceScopeArgs,
  email: v.string(),
  externalUserId: v.optional(v.string()),
  name: v.optional(v.string()),
  permissions: v.optional(v.array(v.string())),
  role: memberRoleValue,
};

export const upsertIntegrationConnectionArgs = {
  ...workspaceScopeArgs,
  config: v.optional(v.any()),
  direction: integrationDirectionValue,
  displayName: v.optional(v.string()),
  provider: integrationProviderValue,
  state: integrationStateValue,
};

export const updatePortalSettingsArgs = {
  ...workspaceScopeArgs,
  accentColor: v.optional(v.string()),
  changelogVisibility: v.optional(portalVisibility),
  customThemeCss: v.optional(v.string()),
  feedbackMode: v.optional(portalFeedbackMode),
  headline: v.optional(v.string()),
  intro: v.optional(v.string()),
  roadmapVisibility: v.optional(portalVisibility),
  themeAppearance: v.optional(v.union(v.literal("light"), v.literal("dark"))),
  themePreset: v.optional(v.string()),
};

export const updateWorkspaceArgs = {
  workspaceSlug: v.string(),
  description: v.optional(v.string()),
  name: v.optional(v.string()),
  visibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
};

export const updatePlanArgs = {
  ...workspaceScopeArgs,
  seats: v.optional(v.number()),
  tier: planTierValue,
};

export const createProjectArgs = {
  ...workspaceScopeArgs,
  name: v.string(),
  slug: v.optional(v.string()),
  description: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  sourceMode: v.optional(v.union(v.literal("feedback"), v.literal("github"))),
  visibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
  websiteUrl: v.optional(v.string()),
};

export const connectProjectRepositoryArgs = {
  ...workspaceScopeArgs,
  projectKey: v.string(),
  owner: v.string(),
  repo: v.string(),
  defaultBranch: v.optional(v.string()),
  repositoryUrl: v.optional(v.string()),
};

export const projectKeyArgs = {
  ...workspaceScopeArgs,
  projectKey: v.string(),
};

export const updateProjectArgs = {
  ...projectKeyArgs,
  name: v.string(),
  description: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  logoStorageId: v.optional(v.id("_storage")),
  websiteUrl: v.optional(v.string()),
  visibility: v.optional(v.union(v.literal("private"), v.literal("public"))),
};

export const registerCustomDomainArgs = {
  ...workspaceScopeArgs,
  domain: v.string(),
  purpose: v.union(v.literal("portal"), v.literal("embed"), v.literal("api")),
};

export const updateCustomDomainStatusArgs = {
  domain: v.string(),
  status: v.union(v.literal("pending"), v.literal("verified"), v.literal("failed")),
};
