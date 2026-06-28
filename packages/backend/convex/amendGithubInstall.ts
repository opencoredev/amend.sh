import { v } from "convex/values";

import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation } from "./_generated/server";
import { requireProactiveWorkspace } from "./proactiveShared";

/**
 * Persist the GitHub App `installation_id` for a workspace after the user is
 * redirected back from GitHub's install flow.
 *
 * GitHub App webhooks are routed to a workspace by repository (see
 * `amendSourceIngest.ts`), but the installation id is what lets us mint
 * installation access tokens for the GitHub API. Nothing recorded it until now;
 * this mutation closes that gap. The dashboard setup page calls it with the
 * `installation_id` GitHub appends to the redirect, optionally scoped to the
 * `owner/repo` the user just connected.
 */
export const completeGithubInstall = mutation({
  args: {
    workspaceSlug: v.optional(v.string()),
    installationId: v.string(),
    owner: v.optional(v.string()),
    repo: v.optional(v.string()),
  },
  returns: v.object({
    ok: v.literal(true),
    installationState: v.literal("connected"),
    connections: v.number(),
  }),
  handler: async (ctx, args) => {
    const workspace = await requireProactiveWorkspace(ctx, args);
    const installationId = args.installationId.trim();
    if (!installationId) {
      throw new Error("A GitHub installation_id is required to complete setup.");
    }
    const now = Date.now();

    const owner = args.owner?.trim() || undefined;
    const repo = args.repo?.trim() || undefined;

    // When the user connected a specific repository, target (and create if
    // needed) that exact connection. Otherwise scope minimally: only connections
    // that aren't already bound to a *different* installation, so a caller-
    // supplied installationId can't silently rebind repositories that already
    // belong to another GitHub App installation.
    //
    // TODO(hardening): verify `installationId` against the GitHub API server-side
    // (e.g. list the installation's repositories with an installation token)
    // before stamping it, instead of trusting the value from the redirect.
    const targets =
      owner && repo
        ? [await ensureWorkspaceConnection(ctx, workspace._id, owner, repo, now)]
        : (
            await ctx.db
              .query("githubConnections")
              .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
              .collect()
          ).filter(
            (connection) =>
              !connection.installationId || connection.installationId === installationId,
          );

    for (const connection of targets) {
      await ctx.db.patch(connection._id, {
        installationId,
        installationState: "connected",
        updatedAt: now,
      });
    }

    return {
      ok: true as const,
      installationState: "connected" as const,
      connections: targets.length,
    };
  },
});

async function ensureWorkspaceConnection(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">,
  owner: string,
  repo: string,
  now: number,
): Promise<Doc<"githubConnections">> {
  const existing = await ctx.db
    .query("githubConnections")
    .withIndex("by_workspace_and_owner_and_repo", (q) =>
      q.eq("workspaceId", workspaceId).eq("owner", owner).eq("repo", repo),
    )
    .unique();
  if (existing) {
    return existing;
  }

  const connectionId = await ctx.db.insert("githubConnections", {
    workspaceId,
    provider: "github",
    owner,
    repo,
    repositoryUrl: `https://github.com/${owner}/${repo}`,
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
    createdAt: now,
    updatedAt: now,
  });
  const connection = await ctx.db.get(connectionId);
  if (!connection) {
    throw new Error("Failed to record GitHub connection.");
  }
  return connection;
}
