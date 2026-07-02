import type { MutationCtx } from "../_generated/server";
import { normalizeConnection, normalizeProject } from "../lib/amendNormalizers";
import { findProjectByKey } from "./amendProjectLookup";
import type {
  ConnectProjectRepositoryArgs,
  MarkProjectFeedbackSourceArgs,
} from "./amendProjectMutationTypes";
import { ensureDashboardBaseRecords, requireDashboardUser } from "../workspace/amendWorkspace";

export async function connectProjectRepositoryHandler(
  ctx: MutationCtx,
  args: ConnectProjectRepositoryArgs,
) {
  const user = await requireDashboardUser(ctx);
  const now = Date.now();
  const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
  const project = await findProjectByKey(ctx, workspace._id, args.projectKey);

  const existing = await ctx.db
    .query("githubConnections")
    .withIndex("by_workspace_and_owner_and_repo", (q) =>
      q.eq("workspaceId", workspace._id).eq("owner", args.owner).eq("repo", args.repo),
    )
    .unique();
  const patch = {
    defaultBranch: args.defaultBranch ?? "main",
    installationState: "connected" as const,
    lastSyncError: undefined,
    lastSyncedAt: now,
    lastWebhookDeliveryAt: now,
    owner: args.owner,
    projectId: project._id,
    provider: "github" as const,
    repo: args.repo,
    repositoryUrl: args.repositoryUrl ?? `https://github.com/${args.owner}/${args.repo}`,
    syncStatus: "healthy" as const,
    updatedAt: now,
    watches: {
      pullRequests: true,
      issues: true,
      labels: true,
      milestones: true,
      releases: true,
    },
  };
  const connectionId = existing
    ? (await ctx.db.patch(existing._id, patch), existing._id)
    : await ctx.db.insert("githubConnections", {
        workspaceId: workspace._id,
        ...patch,
        createdAt: now,
      });
  const connection = await ctx.db.get(connectionId);
  if (!connection) {
    throw new Error("Failed to connect repository");
  }
  await ctx.db.patch(project._id, {
    sourceMode: "github",
    updatedAt: now,
  });
  return normalizeConnection(connection);
}

export async function markProjectFeedbackSourceHandler(
  ctx: MutationCtx,
  args: MarkProjectFeedbackSourceArgs,
) {
  const user = await requireDashboardUser(ctx);
  const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
  const project = await findProjectByKey(ctx, workspace._id, args.projectKey);

  await ctx.db.patch(project._id, {
    sourceMode: "feedback",
    updatedAt: Date.now(),
  });

  const updatedProject = await ctx.db.get(project._id);
  if (!updatedProject) {
    throw new Error("Failed to mark project source");
  }
  return normalizeProject(updatedProject);
}
