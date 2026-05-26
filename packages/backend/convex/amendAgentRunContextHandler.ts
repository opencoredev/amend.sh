import type { QueryCtx } from "./_generated/server";
import type { AgentContext } from "./amendAgent";
import type { ScopedProjectArgs } from "./amendAgentRunTypes";
import {
  normalizeAutomationRules,
  normalizeChangelog,
  normalizeFeedback,
  normalizeRoadmap,
  normalizeSourceEvent,
  normalizeWorkspace,
} from "./amendNormalizers";
import {
  filterProjectDocs,
  getDashboardProject,
  getDashboardWorkspace,
  latestDocs,
  requireDashboardUser,
} from "./amendWorkspace";

export async function getAgentRunContextHandler(
  ctx: QueryCtx,
  args: ScopedProjectArgs,
): Promise<AgentContext> {
  const user = await requireDashboardUser(ctx);
  const workspace = await getDashboardWorkspace(ctx, user, args.workspaceSlug);
  if (!workspace) {
    return {
      feedback: [],
      recentChangelog: [],
      roadmap: [],
      sourceEvents: [],
    };
  }
  const project = await getDashboardProject(ctx, workspace._id, args.projectSlug);
  const projectConnections = project
    ? await ctx.db
        .query("githubConnections")
        .withIndex("by_project", (q) => q.eq("projectId", project._id))
        .collect()
    : [];
  const projectConnectionIds = new Set(projectConnections.map((connection) => connection._id));
  const [rules, allSourceEvents, allFeedback, allRoadmap, allRecentChangelog] = await Promise.all([
    ctx.db
      .query("automationRules")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .first(),
    ctx.db
      .query("sourceEvents")
      .withIndex("by_workspace_and_observedAt", (q) => q.eq("workspaceId", workspace._id))
      .order("desc")
      .take(project ? 100 : 20),
    project
      ? ctx.db
          .query("feedbackItems")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect()
      : ctx.db
          .query("feedbackItems")
          .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
          .order("desc")
          .take(20),
    project
      ? ctx.db
          .query("roadmapItems")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect()
      : ctx.db
          .query("roadmapItems")
          .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
          .order("desc")
          .take(12),
    project
      ? ctx.db
          .query("changelogEntries")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect()
      : ctx.db
          .query("changelogEntries")
          .withIndex("by_workspace_and_createdAt", (q) => q.eq("workspaceId", workspace._id))
          .order("desc")
          .take(12),
  ]);
  const sourceEvents = project
    ? latestDocs(
        allSourceEvents.filter(
          (event) =>
            event.projectId === project._id ||
            Boolean(event.connectionId && projectConnectionIds.has(event.connectionId)),
        ),
        (event) => event.observedAt,
        20,
      )
    : allSourceEvents;
  const feedback = latestDocs(
    filterProjectDocs(allFeedback, project),
    (item) => item.createdAt,
    20,
  );
  const roadmap = latestDocs(filterProjectDocs(allRoadmap, project), (item) => item.createdAt, 12);
  const recentChangelog = latestDocs(
    filterProjectDocs(allRecentChangelog, project),
    (item) => item.createdAt,
    12,
  );

  return {
    automationRules: rules ? normalizeAutomationRules(rules) : undefined,
    feedback: feedback.map(normalizeFeedback),
    recentChangelog: recentChangelog.map(normalizeChangelog),
    roadmap: roadmap.map(normalizeRoadmap),
    sourceEvents: sourceEvents.map(normalizeSourceEvent),
    workspace: normalizeWorkspace(workspace),
  };
}
