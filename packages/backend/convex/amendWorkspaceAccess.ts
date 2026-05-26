import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";

export type DashboardAuthUser = {
  _id?: string;
  user?: {
    email?: string;
    id?: string;
    name?: string;
  };
  userId?: string;
};

export async function getWorkspaceRecord(ctx: QueryCtx | MutationCtx, slug: string) {
  return await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
}

export async function requireDashboardUser(ctx: QueryCtx | MutationCtx) {
  const authUser = (await authComponent.safeGetAuthUser(ctx)) as DashboardAuthUser | null;
  const userId = authUser?.userId ?? authUser?.user?.id ?? authUser?._id;
  if (!userId) {
    throw new Error("Sign in before using the Amend dashboard.");
  }
  return {
    email: authUser?.user?.email,
    id: userId,
    name: authUser?.user?.name,
  };
}

async function getWorkspaceMembershipForUser(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  user: Awaited<ReturnType<typeof requireDashboardUser>>,
) {
  const membershipByExternalId = (
    await ctx.db
      .query("workspaceMembers")
      .withIndex("by_externalUserId", (q) => q.eq("externalUserId", user.id))
      .collect()
  ).find((member) => member.workspaceId === workspaceId);

  if (membershipByExternalId) {
    return membershipByExternalId;
  }

  if (!user.email) {
    return null;
  }

  return await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_and_email", (q) =>
      q.eq("workspaceId", workspaceId).eq("email", user.email!),
    )
    .unique();
}

async function getDefaultWorkspaceForUser(
  ctx: QueryCtx | MutationCtx,
  user: Awaited<ReturnType<typeof requireDashboardUser>>,
) {
  const membershipByExternalId = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_externalUserId", (q) => q.eq("externalUserId", user.id))
    .first();
  const membership =
    membershipByExternalId ??
    (user.email
      ? await ctx.db
          .query("workspaceMembers")
          .withIndex("by_email", (q) => q.eq("email", user.email!))
          .first()
      : null);

  if (!membership) {
    return null;
  }

  const workspace = await ctx.db.get(membership.workspaceId);
  return workspace ?? null;
}

export async function getDashboardWorkspace(
  ctx: QueryCtx | MutationCtx,
  user: Awaited<ReturnType<typeof requireDashboardUser>>,
  slug?: string,
) {
  const trimmedSlug = slug?.trim();
  const workspace = trimmedSlug
    ? await getWorkspaceRecord(ctx, trimmedSlug)
    : await getDefaultWorkspaceForUser(ctx, user);

  if (!workspace) {
    return null;
  }

  const membership = await getWorkspaceMembershipForUser(ctx, workspace._id, user);
  if (!membership) {
    throw new Error("You do not have access to this workspace.");
  }

  return workspace;
}

export async function getDashboardProject(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  projectSlug?: string,
) {
  const trimmedProject = projectSlug?.trim();
  if (!trimmedProject || trimmedProject === "new-project") {
    return null;
  }

  return await ctx.db
    .query("projects")
    .withIndex("by_workspace_and_slug", (q) =>
      q.eq("workspaceId", workspaceId).eq("slug", trimmedProject),
    )
    .unique();
}

export async function getWritableDashboardProject(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<"workspaces">,
  projectSlug?: string,
) {
  const project = await getDashboardProject(ctx, workspaceId, projectSlug);
  if (projectSlug?.trim() && projectSlug.trim() !== "new-project" && !project) {
    throw new Error("Project not found in this workspace.");
  }
  return project;
}

export function filterProjectDocs<T extends { projectId?: Id<"projects"> }>(
  docs: T[],
  project: Doc<"projects"> | null,
) {
  if (!project) return docs;
  return docs.filter((doc) => doc.projectId === project._id);
}

export function latestDocs<T>(docs: T[], timestamp: (doc: T) => number, limit: number) {
  return [...docs].sort((a, b) => timestamp(b) - timestamp(a)).slice(0, limit);
}

export async function getDashboardWorkspaceSlugForUser(
  ctx: QueryCtx | MutationCtx,
  user: Awaited<ReturnType<typeof requireDashboardUser>>,
  slug?: string,
) {
  const trimmedSlug = slug?.trim();
  if (trimmedSlug && trimmedSlug !== "workspace") {
    const workspace = await getDashboardWorkspace(ctx, user, trimmedSlug);
    return workspace?.slug ?? trimmedSlug;
  }

  const defaultWorkspace = await getDefaultWorkspaceForUser(ctx, user);
  return defaultWorkspace?.slug ?? trimmedSlug ?? "workspace";
}

export async function requireDashboardWorkspace(
  ctx: QueryCtx | MutationCtx,
  user: Awaited<ReturnType<typeof requireDashboardUser>>,
  slug?: string,
) {
  const workspace = await getDashboardWorkspace(ctx, user, slug);
  if (!workspace) {
    throw new Error("Create a workspace before using the dashboard.");
  }
  return workspace;
}
