import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { workspaceSlug } from "../lib/amendBackendUtils";
import { normalizeProject } from "../lib/amendNormalizers";
import { getDashboardWorkspace, getWorkspaceRecord, requireDashboardUser } from "./amendWorkspace";

type WorkspaceArgs = { workspaceSlug?: string };

export async function getProjectsHandler(ctx: QueryCtx, args: WorkspaceArgs) {
  const user = await requireDashboardUser(ctx);
  const workspace = await getDashboardWorkspace(ctx, user, args.workspaceSlug);
  return workspace ? await collectProjects(ctx, workspace._id) : [];
}

export async function getProjectsForApiHandler(ctx: QueryCtx, args: WorkspaceArgs) {
  const workspace = await getWorkspaceRecord(ctx, workspaceSlug(args.workspaceSlug));
  return workspace ? await collectProjects(ctx, workspace._id) : [];
}

async function collectProjects(ctx: QueryCtx, workspaceId: Id<"workspaces">) {
  const [projects, repositories] = await Promise.all([
    ctx.db
      .query("projects")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect(),
    ctx.db
      .query("githubConnections")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .collect(),
  ]);

  return projects.map((project) => normalizeProjectWithRepositories(project, repositories));
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
