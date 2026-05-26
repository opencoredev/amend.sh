import type { QueryCtx } from "./_generated/server";
import { isDraftChangelogStatus } from "./amendBackendUtils";
import { emptyDashboard } from "./amendDashboardFallbacks";
import { loadDashboardOverviewRecords } from "./amendDashboardOverviewRecords";
import { demoConnection, demoPlan } from "./amendDemoData";
import {
  buildAgentActivity,
  buildChannelSummaries,
  normalizeAgentRun,
  normalizeAutomationDecision,
  normalizeBuildBrief,
  normalizeChangelog,
  normalizeConnection,
  normalizeFeedback,
  normalizeNotification,
  normalizePlan,
  normalizeReview,
  normalizeRoadmap,
  normalizeSourceEvent,
  normalizeWorkspace,
} from "./amendNormalizers";
import { getDashboardProject, getDashboardWorkspace, requireDashboardUser } from "./amendWorkspace";

type GetDashboardOverviewArgs = {
  projectSlug?: string;
  workspaceSlug?: string;
};

export async function getDashboardOverviewHandler(ctx: QueryCtx, args: GetDashboardOverviewArgs) {
  const user = await requireDashboardUser(ctx);
  const workspace = await getDashboardWorkspace(ctx, user, args.workspaceSlug);
  if (!workspace) {
    return emptyDashboard();
  }
  const project = await getDashboardProject(ctx, workspace._id, args.projectSlug);
  if (args.projectSlug?.trim() && !project) {
    return {
      ...emptyDashboard(),
      workspace: normalizeWorkspace(workspace),
    };
  }

  const {
    agentRuns,
    automationDecisions,
    buildBriefs,
    changelog,
    connection,
    feedback,
    integrations,
    notifications,
    plan,
    reviews,
    roadmap,
    sourceEvents,
  } = await loadDashboardOverviewRecords(ctx, workspace, project);

  return {
    workspace: normalizeWorkspace(workspace),
    github: connection ? normalizeConnection(connection) : { ...demoConnection, recordId: null },
    plan: plan ? normalizePlan(plan) : { ...demoPlan, recordId: null },
    metrics: {
      openFeedback: feedback.filter((item) => item.status !== "closed" && item.status !== "shipped")
        .length,
      roadmapInProgress: roadmap.filter((item) => item.status === "in_progress").length,
      changelogDrafts: changelog.filter((item) => isDraftChangelogStatus(item.status)).length,
      reviewNeedsReview: reviews.filter((item) => item.status === "needs_review").length,
      queuedNotifications: notifications.filter((item) => item.status === "queued").length,
      sourceLinkedRecords:
        changelog.filter((item) => item.sourceLinks.length > 0).length +
        roadmap.filter((item) => item.sourceLinks.length > 0).length +
        feedback.filter((item) => item.sourceLinks.length > 0).length +
        notifications.filter((item) => item.sourceLinks.length > 0).length +
        buildBriefs.filter((item) => item.sourceLinks.length > 0).length,
    },
    recentChangelog: changelog.map(normalizeChangelog),
    roadmap: roadmap.map(normalizeRoadmap),
    feedback: feedback.map(normalizeFeedback),
    notifications: notifications.map(normalizeNotification),
    reviewQueue: reviews.map(normalizeReview),
    buildBriefs: buildBriefs.map(normalizeBuildBrief),
    agentRuns: agentRuns.map(normalizeAgentRun),
    automationDecisions: automationDecisions.map(normalizeAutomationDecision),
    sourceEvents: sourceEvents.map(normalizeSourceEvent),
    agentActivity: buildAgentActivity({
      agentRuns,
      automationDecisions,
      notifications,
      reviews,
      sourceEvents,
    }),
    channels: buildChannelSummaries({
      connection,
      feedback,
      integrations,
      sourceEvents,
    }),
  };
}
