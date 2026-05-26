import type { MutationCtx } from "./_generated/server";
import { normalizeProject } from "./amendNormalizers";
import { findProjectByKey } from "./amendProjectLookup";
import type {
  GenerateProjectLogoUploadUrlArgs,
  UpdateProjectArgs,
} from "./amendProjectMutationTypes";
import { ensureDashboardBaseRecords, requireDashboardUser } from "./amendWorkspace";

export async function updateProjectHandler(ctx: MutationCtx, args: UpdateProjectArgs) {
  const user = await requireDashboardUser(ctx);
  const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
  const project = await findProjectByKey(ctx, workspace._id, args.projectKey);
  const storedLogoUrl = args.logoStorageId
    ? await ctx.storage.getUrl(args.logoStorageId)
    : undefined;

  await ctx.db.patch(project._id, {
    name: args.name.trim() || project.name,
    description: args.description?.trim() || undefined,
    logoUrl: storedLogoUrl ?? args.logoUrl?.trim() ?? undefined,
    ...(args.logoStorageId ? { logoStorageId: args.logoStorageId } : {}),
    websiteUrl: args.websiteUrl?.trim() || undefined,
    visibility: args.visibility ?? project.visibility,
    updatedAt: Date.now(),
  });

  const updatedProject = await ctx.db.get(project._id);
  if (!updatedProject) {
    throw new Error("Failed to save project");
  }

  const repositories = await ctx.db
    .query("githubConnections")
    .withIndex("by_project", (q) => q.eq("projectId", project._id))
    .collect();

  return normalizeProject(updatedProject, repositories);
}

export async function generateProjectLogoUploadUrlHandler(
  ctx: MutationCtx,
  args: GenerateProjectLogoUploadUrlArgs,
) {
  const user = await requireDashboardUser(ctx);
  const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
  await findProjectByKey(ctx, workspace._id, args.projectKey);
  return await ctx.storage.generateUploadUrl();
}
