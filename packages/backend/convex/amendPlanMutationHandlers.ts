import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { planByTier } from "./amendBackendUtils";
import { normalizePlan } from "./amendNormalizers";
import { ensureDashboardBaseRecords, requireDashboardUser } from "./amendWorkspace";

type UpdatePlanArgs = {
  workspaceSlug?: string;
  seats?: number;
  tier: Doc<"plans">["tier"];
};

export async function updatePlanHandler(ctx: MutationCtx, args: UpdatePlanArgs) {
  const user = await requireDashboardUser(ctx);
  const now = Date.now();
  const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
  const desiredPlan = planByTier(args.tier);
  const existing = await ctx.db
    .query("plans")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
    .first();
  const patch = {
    billingState: args.tier === "open_source" ? ("open_source" as const) : ("active" as const),
    isOpenSource: args.tier === "open_source",
    limits: desiredPlan.limits,
    notes: desiredPlan.notes,
    posture: desiredPlan.posture,
    priceMonthly: desiredPlan.priceMonthly,
    seats: args.seats ?? existing?.seats ?? (args.tier === "team" ? 10 : 3),
    tier: args.tier,
    updatedAt: now,
  };
  const planId = existing
    ? (await ctx.db.patch(existing._id, patch), existing._id)
    : await ctx.db.insert("plans", {
        workspaceId: workspace._id,
        ...patch,
        createdAt: now,
      });
  const plan = await ctx.db.get(planId);
  if (!plan) {
    throw new Error("Failed to update plan");
  }
  return normalizePlan(plan);
}
