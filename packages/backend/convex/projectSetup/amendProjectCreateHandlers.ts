import type { MutationCtx } from "../_generated/server";
import { projectKey, slugPart } from "../lib/amendBackendUtils";
import type { CreateProjectArgs } from "./amendProjectMutationTypes";
import { normalizeProject } from "../lib/amendNormalizers";
import {
  createDashboardWorkspaceForProject,
  ensureDashboardBaseRecords,
  requireDashboardUser,
} from "../workspace/amendWorkspace";

export async function createProjectHandler(ctx: MutationCtx, args: CreateProjectArgs) {
  const user = await requireDashboardUser(ctx);
  const now = Date.now();
  const requestedWorkspaceSlug = args.workspaceSlug?.trim();
  const workspace =
    requestedWorkspaceSlug && requestedWorkspaceSlug !== "workspace"
      ? await ensureDashboardBaseRecords(ctx, user, requestedWorkspaceSlug)
      : await createDashboardWorkspaceForProject(ctx, user, {
          description: args.description,
          name: args.name,
          slug: args.slug,
        });
  const slug = args.slug ? slugPart(args.slug) : slugPart(args.name);
  const stableKey = projectKey(slug);
  const existing = await ctx.db
    .query("projects")
    .withIndex("by_workspace_and_stableKey", (q) =>
      q.eq("workspaceId", workspace._id).eq("stableKey", stableKey),
    )
    .unique();

  const patch = {
    name: args.name,
    slug,
    stableKey,
    updatedAt: now,
    visibility: args.visibility ?? "private",
    ...(args.description ? { description: args.description } : {}),
    ...(args.logoUrl ? { logoUrl: args.logoUrl } : {}),
    ...(args.sourceMode ? { sourceMode: args.sourceMode } : {}),
    ...(args.websiteUrl ? { websiteUrl: args.websiteUrl } : {}),
  };
  const projectId = existing
    ? (await ctx.db.patch(existing._id, patch), existing._id)
    : await ctx.db.insert("projects", {
        workspaceId: workspace._id,
        ...patch,
        createdAt: now,
      });
  const project = await ctx.db.get(projectId);
  if (!project) {
    throw new Error("Failed to save project");
  }
  return {
    ...normalizeProject(project),
    workspaceSlug: workspace.slug,
  };
}
