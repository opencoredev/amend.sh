import type { QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";
import { demoPlan, planCatalog } from "./amendDemoData";
import { planByTier } from "./amendBackendUtils";
import { normalizePlan } from "./amendNormalizers";
import { getDashboardWorkspace } from "./amendWorkspace";
import type { DashboardAuthUser } from "./amendWorkspace";

type WorkspaceArgs = { workspaceSlug?: string };

export async function getPlanCatalogHandler(ctx: QueryCtx, args: WorkspaceArgs) {
  const authUser = (await authComponent.safeGetAuthUser(ctx)) as DashboardAuthUser | null;
  const userId = authUser?.userId ?? authUser?.user?.id ?? authUser?._id;
  const workspace =
    userId === undefined
      ? null
      : await getDashboardWorkspace(
          ctx,
          {
            email: authUser?.user?.email,
            id: userId,
            name: authUser?.user?.name,
          },
          args.workspaceSlug,
        );
  const currentPlan = workspace
    ? await ctx.db
        .query("plans")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .first()
    : null;
  return {
    currentPlan: currentPlan ? normalizePlan(currentPlan) : { ...demoPlan, recordId: null },
    plans: [
      ...planCatalog,
      {
        ...planByTier("enterprise"),
        tier: "enterprise" as const,
      },
    ],
  };
}
