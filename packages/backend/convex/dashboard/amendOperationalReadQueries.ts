import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import {
  normalizeAgentRun,
  normalizeAutomationDecision,
  normalizeBuildBrief,
  normalizeDelivery,
  normalizeSourceEvent,
} from "../lib/amendNormalizers";
import { filterProjectDocs, getDashboardProject, latestDocs } from "../workspace/amendWorkspace";

export type WorkspaceArgs = { workspaceSlug?: string };
export type ProjectScopeArgs = WorkspaceArgs & { projectSlug?: string };
export type SourceEventsArgs = ProjectScopeArgs & {
  provider?: Doc<"sourceEvents">["provider"];
  kind?: Doc<"sourceEvents">["kind"];
  limit?: number;
};
export type BuildBriefsArgs = ProjectScopeArgs & { status?: Doc<"buildBriefs">["status"] };

export async function getDeliveryOutboxForWorkspace(ctx: QueryCtx, workspace: Doc<"workspaces">) {
  const deliveries = await ctx.db
    .query("deliveryOutbox")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
    .take(50);
  return deliveries.map(normalizeDelivery);
}

export async function getAutomationDecisionsForWorkspace(
  ctx: QueryCtx,
  workspace: Doc<"workspaces">,
) {
  const decisions = await ctx.db
    .query("automationDecisions")
    .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
    .order("desc")
    .take(50);
  return decisions.map(normalizeAutomationDecision);
}

export async function getAgentRunsForWorkspace(
  ctx: QueryCtx,
  workspace: Doc<"workspaces">,
  args: ProjectScopeArgs,
) {
  const project = await getDashboardProject(ctx, workspace._id, args.projectSlug);
  if (args.projectSlug?.trim() && !project) {
    return [];
  }
  const runs = await ctx.db
    .query("agentRuns")
    .withIndex(
      project ? "by_project" : "by_workspace_and_completedAt",
      project ? (q) => q.eq("projectId", project._id) : (q) => q.eq("workspaceId", workspace._id),
    )
    .order("desc")
    .take(50);
  return filterProjectDocs(runs, project).map(normalizeAgentRun);
}

export async function getSourceEventsForWorkspace(
  ctx: QueryCtx,
  args: SourceEventsArgs & { workspace: Doc<"workspaces"> },
) {
  const project = await getDashboardProject(ctx, args.workspace._id, args.projectSlug);
  if (args.projectSlug?.trim() && !project) {
    return [];
  }

  const limit = Math.max(1, Math.min(Math.trunc(args.limit ?? 50), 200));
  const fetchLimit = Math.max(limit, 200);
  const sourceEvents = project
    ? await ctx.db
        .query("sourceEvents")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .take(fetchLimit)
    : args.kind
      ? await ctx.db
          .query("sourceEvents")
          .withIndex("by_workspace_and_kind_and_observedAt", (q) =>
            q.eq("workspaceId", args.workspace._id).eq("kind", args.kind!),
          )
          .order("desc")
          .take(fetchLimit)
      : await ctx.db
          .query("sourceEvents")
          .withIndex("by_workspace_and_observedAt", (q) => q.eq("workspaceId", args.workspace._id))
          .order("desc")
          .take(fetchLimit);

  return latestDocs(
    sourceEvents.filter(
      (event) =>
        (!args.provider || event.provider === args.provider) &&
        (!args.kind || event.kind === args.kind),
    ),
    (event) => event.observedAt,
    limit,
  ).map(normalizeSourceEvent);
}

export async function getBuildBriefsForWorkspace(
  ctx: QueryCtx,
  workspace: Doc<"workspaces">,
  args: BuildBriefsArgs,
) {
  const project = await getDashboardProject(ctx, workspace._id, args.projectSlug);
  const briefs = args.status
    ? await ctx.db
        .query("buildBriefs")
        .withIndex("by_workspace_and_status", (q) =>
          q.eq("workspaceId", workspace._id).eq("status", args.status!),
        )
        .collect()
    : await ctx.db
        .query("buildBriefs")
        .withIndex(
          project ? "by_project" : "by_workspace_and_updatedAt",
          project
            ? (q) => q.eq("projectId", project._id)
            : (q) => q.eq("workspaceId", workspace._id),
        )
        .order("desc")
        .take(50);

  return latestDocs(filterProjectDocs(briefs, project), (brief) => brief.updatedAt, 50).map(
    normalizeBuildBrief,
  );
}
