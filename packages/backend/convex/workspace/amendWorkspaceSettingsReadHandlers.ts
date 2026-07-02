import { demoAutomationRules } from "../demo/amendDemoSettingsData";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { DEMO_NOW } from "../demo/amendDemoData";

import {
  normalizeAutomationRules,
  normalizeDomain,
  normalizeIntegration,
  normalizeMember,
  normalizeProject,
} from "../lib/amendNormalizers";
import { normalizeNotificationPreference } from "../delivery/amendNotifications";
import { PROJECT_WEBSITE_LOOKUP_RATE_LIMIT } from "../lib/amendValidators";
import { getDashboardWorkspace, getWorkspaceRecord, requireDashboardUser } from "./amendWorkspace";
import { workspaceSlug } from "../lib/amendBackendUtils";

type WorkspaceArgs = { workspaceSlug?: string };

export async function getWorkspaceSettingsHandler(ctx: QueryCtx, args: WorkspaceArgs) {
  const user = await requireDashboardUser(ctx);
  const workspace = await getDashboardWorkspace(ctx, user, args.workspaceSlug);
  return workspace ? await collectWorkspaceSettings(ctx, workspace._id) : emptyWorkspaceSettings();
}

export async function getWorkspaceSettingsForApiHandler(ctx: QueryCtx, args: WorkspaceArgs) {
  const workspace = await getWorkspaceRecord(ctx, workspaceSlug(args.workspaceSlug));
  return workspace ? await collectWorkspaceSettings(ctx, workspace._id) : emptyWorkspaceSettings();
}

function emptyWorkspaceSettings() {
  return {
    automationRules: undefined,
    customDomains: [],
    integrations: [],
    members: [],
    notificationPreferences: [],
    projects: [],
    rateLimits: {
      projectWebsiteLookup: PROJECT_WEBSITE_LOOKUP_RATE_LIMIT,
    },
  };
}

async function collectWorkspaceSettings(ctx: QueryCtx, workspaceId: Id<"workspaces">) {
  const [
    automationRules,
    members,
    integrations,
    customDomains,
    notificationPreferences,
    projects,
    repositories,
  ] = await Promise.all([
    ctx.db
      .query("automationRules")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .first(),
    ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect(),
    ctx.db
      .query("integrationConnections")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect(),
    ctx.db
      .query("customDomains")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect(),
    ctx.db
      .query("notificationPreferences")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .take(50),
    ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect(),
    ctx.db
      .query("githubConnections")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect(),
  ]);

  return {
    automationRules: automationRules
      ? normalizeAutomationRules(automationRules)
      : { ...demoAutomationRules, recordId: null, updatedAt: DEMO_NOW },
    customDomains: customDomains.map(normalizeDomain),
    integrations: integrations.map(normalizeIntegration),
    members: members.map(normalizeMember),
    notificationPreferences: notificationPreferences.map(normalizeNotificationPreference),
    projects: projects.map((project) => normalizeProjectWithRepositories(project, repositories)),
    rateLimits: {
      projectWebsiteLookup: PROJECT_WEBSITE_LOOKUP_RATE_LIMIT,
    },
  };
}

function normalizeProjectWithRepositories(
  project: Doc<"projects">,
  repositories: Array<Doc<"githubConnections">>,
) {
  return normalizeProject(
    project,
    repositories.filter((repository) => repository.projectId === project._id),
  );
}
