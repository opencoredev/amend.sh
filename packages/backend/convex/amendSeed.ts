import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { DEMO_SLUG, demoConnection } from "./amendDemoData";
import { ensureDemoBaseRecords } from "./amendSeedBase";
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

/**
 * Resolve a public-portal slug to its workspace + project. Portal URLs are
 * PROJECT slugs (each project has its own portal), so we resolve the project
 * (and its workspace) first and fall back to a workspace slug for workspace-level
 * portals + the demo. Mirrors getPublicPortal so portal writes land on the same
 * project the reader sees.
 */
export async function resolvePublicScope(ctx: MutationCtx, slug: string) {
  const project = await getUniquePublicProject(ctx, slug);
  if (project) {
    const workspace = await ctx.db.get(project.workspaceId);
    if (workspace) {
      await ensureWorkspacePlanAndRules(ctx, workspace._id);
      await ensureChannelPlaceholders(ctx, workspace._id);
      return { project, workspace };
    }
  }
  return { project: null, workspace: await ensureBaseRecords(ctx, slug) };
}

async function getUniquePublicProject(ctx: MutationCtx, slug: string) {
  const matches = await ctx.db
    .query("projects")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .take(2);
  return matches.length === 1 ? matches[0] : null;
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
  // Demo PRODUCT seeding is DISABLED for the beta: amend-labs is now the real
  // workspace and must not be pre-filled with fake needs/drafts/changelog/source
  // events. Only base config (workspace/plan/members/connection) is ensured here.
  const workspace = await ensureBaseRecords(ctx, slug);
  return workspace._id;
}
