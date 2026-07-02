import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { requireExistingWorkspace } from "./workspace/amendWorkspace";

// One-off admin purge: wipe all signal/product data for a workspace so the
// dashboard shows only real, connection-sourced signal. Configuration is kept
// (workspaces, plans, workspaceMembers, integrationConnections, githubConnections,
// projects, automationRules, workspaceTags, notificationPreferences).
//
// Run with:  bunx convex run amendPurge:purgeWorkspaceSignal '{"slug":"amend-labs"}'
const SIGNAL_TABLES = [
  "needs",
  "evidence",
  "persons",
  "identityHandles",
  "proactivePipelineEvents",
  "draftProposals",
  "memoryRules",
  "sourceEvents",
  "changelogEntries",
  "feedbackItems",
  "roadmapItems",
  "reviewItems",
  "notifications",
  "deliveryOutbox",
  "automationDecisions",
  "agentRuns",
  "buildBriefs",
  "eventRecords",
  "feedbackInteractions",
  "roadmapInteractions",
] as const;

export const purgeWorkspaceSignal = internalMutation({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const workspace = await requireExistingWorkspace(ctx, slug);
    const deleted: Record<string, number> = {};
    for (const table of SIGNAL_TABLES) {
      const rows = await ctx.db
        .query(table)
        .filter((q) => q.eq(q.field("workspaceId"), workspace._id))
        .collect();
      for (const row of rows) {
        await ctx.db.delete(row._id);
      }
      deleted[table] = rows.length;
    }
    return { slug, workspaceId: workspace._id, deleted };
  },
});
