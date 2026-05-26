import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { normalizeAutomationRules } from "./amendNormalizers";
import { ensureDashboardBaseRecords, requireDashboardUser } from "./amendWorkspace";

type UpdateAutomationRulesArgs = {
  workspaceSlug?: string;
  mode?: Doc<"automationRules">["mode"];
  autoUpdateFeedbackStatus?: boolean;
  autoUpdateRoadmapStatus?: boolean;
  autoDraftChangelog?: boolean;
  autoPublishChangelog?: boolean;
  autoNotifyUsers?: boolean;
  requireReviewBelowConfidence?: number;
  requireReviewForPublicCopy?: boolean;
  requireReviewForHighImpact?: boolean;
  byokProvider?: string;
  byokConfigured?: boolean;
};

export async function updateAutomationRulesHandler(
  ctx: MutationCtx,
  args: UpdateAutomationRulesArgs,
) {
  const user = await requireDashboardUser(ctx);
  const workspace = await ensureDashboardBaseRecords(ctx, user, args.workspaceSlug);
  const rules = await ctx.db
    .query("automationRules")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
    .first();
  if (!rules) {
    throw new Error("Automation rules were not initialized");
  }

  await ctx.db.patch(rules._id, {
    ...(args.mode ? { mode: args.mode } : {}),
    ...(args.autoUpdateFeedbackStatus === undefined
      ? {}
      : { autoUpdateFeedbackStatus: args.autoUpdateFeedbackStatus }),
    ...(args.autoUpdateRoadmapStatus === undefined
      ? {}
      : { autoUpdateRoadmapStatus: args.autoUpdateRoadmapStatus }),
    ...(args.autoDraftChangelog === undefined
      ? {}
      : { autoDraftChangelog: args.autoDraftChangelog }),
    ...(args.autoPublishChangelog === undefined
      ? {}
      : { autoPublishChangelog: args.autoPublishChangelog }),
    ...(args.autoNotifyUsers === undefined ? {} : { autoNotifyUsers: args.autoNotifyUsers }),
    ...(args.requireReviewBelowConfidence === undefined
      ? {}
      : { requireReviewBelowConfidence: args.requireReviewBelowConfidence }),
    ...(args.requireReviewForPublicCopy === undefined
      ? {}
      : { requireReviewForPublicCopy: args.requireReviewForPublicCopy }),
    ...(args.requireReviewForHighImpact === undefined
      ? {}
      : { requireReviewForHighImpact: args.requireReviewForHighImpact }),
    ...(args.byokProvider ? { byokProvider: args.byokProvider } : {}),
    ...(args.byokConfigured === undefined ? {} : { byokConfigured: args.byokConfigured }),
    updatedAt: Date.now(),
  });

  const updated = await ctx.db.get(rules._id);
  if (!updated) {
    throw new Error("Failed to update automation rules");
  }
  return normalizeAutomationRules(updated);
}
