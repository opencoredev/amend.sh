import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import type { SourceLink } from "../lib/amendTypes";

type AutomationDecisionInput = {
  workspaceId: Id<"workspaces">;
  projectId?: Id<"projects">;
  stableKey: string;
  action: Doc<"automationDecisions">["action"];
  targetKind: Doc<"automationDecisions">["targetKind"];
  targetKey: string;
  confidence: number;
  needsReview: boolean;
  outcome: Doc<"automationDecisions">["outcome"];
  summary: string;
  sourceLinks: SourceLink[];
  updatedAt: number;
};

export async function upsertAutomationDecision(
  ctx: MutationCtx,
  decision: AutomationDecisionInput,
) {
  const existingDecision = await ctx.db
    .query("automationDecisions")
    .withIndex("by_workspace_and_stableKey", (q) =>
      q.eq("workspaceId", decision.workspaceId).eq("stableKey", decision.stableKey),
    )
    .unique();
  if (existingDecision) {
    await ctx.db.patch(existingDecision._id, decision);
    return existingDecision._id;
  }
  return ctx.db.insert("automationDecisions", {
    ...decision,
    createdAt: decision.updatedAt,
  });
}
