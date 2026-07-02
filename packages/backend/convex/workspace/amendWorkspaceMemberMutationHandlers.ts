import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { defaultPermissionsForRole, normalizeMember } from "../lib/amendNormalizers";
import { ensureDashboardBaseRecords, requireDashboardUser } from "./amendWorkspace";

type UpsertWorkspaceMemberArgs = {
  workspaceSlug?: string;
  email: string;
  externalUserId?: string;
  name?: string;
  permissions?: string[];
  role: Doc<"workspaceMembers">["role"];
};

export async function upsertWorkspaceMemberHandler(
  ctx: MutationCtx,
  args: UpsertWorkspaceMemberArgs,
) {
  const user = await requireDashboardUser(ctx);
  const now = Date.now();
  const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
  const existing = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_and_email", (q) =>
      q.eq("workspaceId", workspace._id).eq("email", args.email),
    )
    .unique();
  const patch = {
    email: args.email,
    ...(args.externalUserId ? { externalUserId: args.externalUserId } : {}),
    ...(args.name ? { name: args.name } : {}),
    permissions: args.permissions ?? defaultPermissionsForRole(args.role),
    role: args.role,
    updatedAt: now,
  };
  const recordId = existing
    ? (await ctx.db.patch(existing._id, patch), existing._id)
    : await ctx.db.insert("workspaceMembers", {
        workspaceId: workspace._id,
        ...patch,
        createdAt: now,
      });
  const member = await ctx.db.get(recordId);
  if (!member) {
    throw new Error("Failed to save workspace member");
  }
  return normalizeMember(member);
}
