import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import {
  DEMO_NOW,
  demoAutomationRules,
  demoConnection,
  demoIntegrations,
  demoMembers,
  demoPlan,
  demoProject,
} from "./amendDemoData";
import { ensureDemoWorkspace } from "./amendWorkspace";

export async function ensureDemoBaseRecords(ctx: MutationCtx, slug: string) {
  const workspace = await ensureDemoWorkspace(ctx, slug);
  const existingProject = await ctx.db
    .query("projects")
    .withIndex("by_workspace_and_stableKey", (q) =>
      q.eq("workspaceId", workspace._id).eq("stableKey", demoProject.stableKey),
    )
    .unique();
  const projectId =
    existingProject?._id ??
    (await ctx.db.insert("projects", {
      workspaceId: workspace._id,
      ...demoProject,
      createdAt: DEMO_NOW,
      updatedAt: DEMO_NOW,
    }));

  await ensureDemoConnection(ctx, workspace._id, projectId);
  await ensureDemoPlan(ctx, workspace._id);
  await ensureDemoAutomationRules(ctx, workspace._id);
  await ensureDemoMembers(ctx, workspace._id);
  await ensureDemoIntegrations(ctx, workspace._id);

  return workspace;
}

async function ensureDemoConnection(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  projectId: Id<"projects">,
) {
  const existingConnection = await ctx.db
    .query("githubConnections")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .first();

  if (!existingConnection) {
    await ctx.db.insert("githubConnections", {
      workspaceId,
      projectId,
      ...demoConnection,
      createdAt: DEMO_NOW,
      updatedAt: DEMO_NOW,
    });
  } else if (!existingConnection.projectId) {
    await ctx.db.patch(existingConnection._id, {
      projectId,
      updatedAt: DEMO_NOW,
    });
  }
}

async function ensureDemoPlan(ctx: MutationCtx, workspaceId: Id<"workspaces">) {
  const existingPlan = await ctx.db
    .query("plans")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .first();

  if (!existingPlan) {
    await ctx.db.insert("plans", {
      workspaceId,
      ...demoPlan,
      createdAt: DEMO_NOW,
      updatedAt: DEMO_NOW,
    });
  }
}

async function ensureDemoAutomationRules(ctx: MutationCtx, workspaceId: Id<"workspaces">) {
  const existingRules = await ctx.db
    .query("automationRules")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .first();

  if (!existingRules) {
    await ctx.db.insert("automationRules", {
      workspaceId,
      ...demoAutomationRules,
      createdAt: DEMO_NOW,
      updatedAt: DEMO_NOW,
    });
  }
}

async function ensureDemoMembers(ctx: MutationCtx, workspaceId: Id<"workspaces">) {
  for (const member of demoMembers) {
    const existingMember = await ctx.db
      .query("workspaceMembers")
      .withIndex("by_workspace_and_email", (q) =>
        q.eq("workspaceId", workspaceId).eq("email", member.email),
      )
      .unique();
    if (!existingMember) {
      await ctx.db.insert("workspaceMembers", {
        workspaceId,
        ...member,
        createdAt: DEMO_NOW,
        updatedAt: DEMO_NOW,
      });
    }
  }
}

async function ensureDemoIntegrations(ctx: MutationCtx, workspaceId: Id<"workspaces">) {
  for (const integration of demoIntegrations) {
    const existingIntegration = await ctx.db
      .query("integrationConnections")
      .withIndex("by_workspace_and_provider", (q) =>
        q.eq("workspaceId", workspaceId).eq("provider", integration.provider),
      )
      .first();
    if (!existingIntegration) {
      await ctx.db.insert("integrationConnections", {
        workspaceId,
        ...integration,
        createdAt: DEMO_NOW,
        updatedAt: DEMO_NOW,
      });
    }
  }
}
