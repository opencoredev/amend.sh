import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { DEMO_SLUG, demoConnection } from "./amendDemoData";
import { ensureDemoBaseRecords } from "./amendSeedBase";
import { ensureDemoProductRecords } from "./amendSeedContent";
import {
  ensureChannelPlaceholders,
  ensureWorkspacePlanAndRules,
  requireExistingWorkspace,
} from "./amendWorkspace";

export async function ensureBaseRecords(ctx: MutationCtx, slug: string) {
  if (slug === DEMO_SLUG) {
    return await ensureDemoBaseRecords(ctx, slug);
  }
  const workspace = await requireExistingWorkspace(ctx, slug);
  await ensureWorkspacePlanAndRules(ctx, workspace._id);
  await ensureChannelPlaceholders(ctx, workspace._id);
  return workspace;
}

export async function ensureGitHubConnection(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  owner: string | undefined,
  repo: string | undefined,
) {
  const existing = await ctx.db
    .query("githubConnections")
    .withIndex("by_workspace_and_owner_and_repo", (q) =>
      q
        .eq("workspaceId", workspaceId)
        .eq("owner", owner ?? demoConnection.owner)
        .eq("repo", repo ?? demoConnection.repo),
    )
    .first();

  if (existing) {
    return existing;
  }

  const connectionId = await ctx.db.insert("githubConnections", {
    workspaceId,
    provider: "github",
    owner: owner ?? demoConnection.owner,
    repo: repo ?? demoConnection.repo,
    repositoryUrl: `https://github.com/${owner ?? demoConnection.owner}/${repo ?? demoConnection.repo}`,
    defaultBranch: "main",
    installationState: "connected",
    watches: {
      pullRequests: true,
      issues: true,
      labels: true,
      milestones: true,
      releases: true,
    },
    syncStatus: "syncing",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  const connection = await ctx.db.get(connectionId);
  if (!connection) {
    throw new Error("Failed to create GitHub connection");
  }
  return connection;
}

export async function ensureDemoDataForWorkspace(ctx: MutationCtx, slug: string) {
  const workspace = await ensureBaseRecords(ctx, slug);
  const connection = await ctx.db
    .query("githubConnections")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
    .first();
  await ensureDemoProductRecords(ctx, {
    connectionId: connection?._id,
    projectId: connection?.projectId,
    workspaceId: workspace._id,
  });
  return workspace._id;
}
