import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { filterProjectDocs, latestDocs } from "./amendWorkspace";

export async function loadDashboardOverviewRecords(
  ctx: QueryCtx,
  workspace: Doc<"workspaces">,
  project: Doc<"projects"> | null,
) {
  const [
    connection,
    projectConnections,
    plan,
    allChangelog,
    allRoadmap,
    allFeedback,
    allNotifications,
    allReviews,
    allBuildBriefs,
    allAgentRuns,
    allSourceEvents,
    allAutomationDecisions,
    integrations,
  ] = await Promise.all([
    project
      ? ctx.db
          .query("githubConnections")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .first()
      : ctx.db
          .query("githubConnections")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
          .first(),
    project
      ? ctx.db
          .query("githubConnections")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect()
      : Promise.resolve([]),
    ctx.db
      .query("plans")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .first(),
    ctx.db
      .query("changelogEntries")
      .withIndex(
        project ? "by_project" : "by_workspace_and_createdAt",
        project ? (q) => q.eq("projectId", project._id) : (q) => q.eq("workspaceId", workspace._id),
      )
      .order("desc")
      .take(project ? 50 : 6),
    ctx.db
      .query("roadmapItems")
      .withIndex(
        project ? "by_project" : "by_workspace_and_createdAt",
        project ? (q) => q.eq("projectId", project._id) : (q) => q.eq("workspaceId", workspace._id),
      )
      .order("desc")
      .take(project ? 100 : 8),
    ctx.db
      .query("feedbackItems")
      .withIndex(
        project ? "by_project" : "by_workspace_and_createdAt",
        project ? (q) => q.eq("projectId", project._id) : (q) => q.eq("workspaceId", workspace._id),
      )
      .order("desc")
      .take(project ? 100 : 8),
    ctx.db
      .query("notifications")
      .withIndex(
        project ? "by_project" : "by_workspace_and_createdAt",
        project ? (q) => q.eq("projectId", project._id) : (q) => q.eq("workspaceId", workspace._id),
      )
      .order("desc")
      .take(project ? 100 : 8),
    ctx.db
      .query("reviewItems")
      .withIndex(
        project ? "by_project" : "by_workspace_and_updatedAt",
        project ? (q) => q.eq("projectId", project._id) : (q) => q.eq("workspaceId", workspace._id),
      )
      .order("desc")
      .take(project ? 100 : 8),
    ctx.db
      .query("buildBriefs")
      .withIndex(
        project ? "by_project" : "by_workspace_and_updatedAt",
        project ? (q) => q.eq("projectId", project._id) : (q) => q.eq("workspaceId", workspace._id),
      )
      .order("desc")
      .take(project ? 100 : 8),
    ctx.db
      .query("agentRuns")
      .withIndex(
        project ? "by_project" : "by_workspace_and_completedAt",
        project ? (q) => q.eq("projectId", project._id) : (q) => q.eq("workspaceId", workspace._id),
      )
      .order("desc")
      .take(project ? 100 : 8),
    ctx.db
      .query("sourceEvents")
      .withIndex("by_workspace_and_observedAt", (q) => q.eq("workspaceId", workspace._id))
      .order("desc")
      .take(project ? 100 : 8),
    ctx.db
      .query("automationDecisions")
      .withIndex(
        project ? "by_project" : "by_workspace_and_createdAt",
        project ? (q) => q.eq("projectId", project._id) : (q) => q.eq("workspaceId", workspace._id),
      )
      .order("desc")
      .take(project ? 100 : 8),
    ctx.db
      .query("integrationConnections")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .take(12),
  ]);
  const projectConnectionIds = new Set(projectConnections.map((item) => item._id));
  const sourceEvents = latestDocs(
    project
      ? allSourceEvents.filter(
          (item) =>
            item.projectId === project._id ||
            Boolean(item.connectionId && projectConnectionIds.has(item.connectionId)),
        )
      : allSourceEvents,
    (item) => item.observedAt,
    8,
  );

  return {
    connection,
    plan,
    changelog: latestDocs(filterProjectDocs(allChangelog, project), (item) => item.createdAt, 6),
    roadmap: latestDocs(filterProjectDocs(allRoadmap, project), (item) => item.createdAt, 8),
    feedback: latestDocs(filterProjectDocs(allFeedback, project), (item) => item.createdAt, 8),
    notifications: latestDocs(
      filterProjectDocs(allNotifications, project),
      (item) => item.createdAt,
      8,
    ),
    reviews: latestDocs(filterProjectDocs(allReviews, project), (item) => item.updatedAt, 8),
    buildBriefs: latestDocs(
      filterProjectDocs(allBuildBriefs, project),
      (item) => item.updatedAt,
      8,
    ),
    agentRuns: latestDocs(filterProjectDocs(allAgentRuns, project), (item) => item.completedAt, 8),
    sourceEvents,
    automationDecisions: latestDocs(
      filterProjectDocs(allAutomationDecisions, project),
      (item) => item.createdAt,
      8,
    ),
    integrations,
  };
}
