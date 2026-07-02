import { demoPlan } from "../demo/amendDemoData";
import type { QueryCtx } from "../_generated/server";
import { demoConnection } from "../demo/amendDemoWorkspaceData";
import { isDraftChangelogStatus } from "../lib/amendBackendUtils";
import { analyticsEventCategory } from "./amendAnalyticsEvents";
import { emptyDashboard } from "./amendDashboardFallbacks";
import { loadDashboardOverviewRecords } from "./amendDashboardOverviewRecords";

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
} from "../lib/amendNormalizers";
import { getDashboardProject, getDashboardWorkspace, requireDashboardUser } from "../workspace/amendWorkspace";

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
    eventRecords,
    feedback,
    integrations,
    notifications,
    plan,
    reviews,
    roadmap,
    sourceEvents,
  } = await loadDashboardOverviewRecords(ctx, workspace, project);

  // Which feedback/roadmap items has the current viewer already upvoted? Powers the
  // voted vs not-voted state of the upvote controls. Votes are stored under the
  // dashboard user's id (externalUserId), so look both interaction tables up by it.
  const [viewerFeedbackVotes, viewerRoadmapVotes] = await Promise.all([
    ctx.db
      .query("feedbackInteractions")
      .withIndex("by_workspace_and_externalUserId", (q) =>
        q.eq("workspaceId", workspace._id).eq("externalUserId", user.id),
      )
      .collect(),
    ctx.db
      .query("roadmapInteractions")
      .withIndex("by_workspace_and_externalUserId", (q) =>
        q.eq("workspaceId", workspace._id).eq("externalUserId", user.id),
      )
      .collect(),
  ]);
  const votedFeedbackKeys = new Set(
    viewerFeedbackVotes.filter((vote) => vote.kind === "vote").map((vote) => vote.feedbackKey),
  );
  const votedRoadmapKeys = new Set(viewerRoadmapVotes.map((vote) => vote.roadmapKey));
  const roadmapHasViewerVote = (item: (typeof roadmap)[number]) => {
    if (votedRoadmapKeys.has(item.stableKey)) {
      return true;
    }
    // Feedback-backed roadmap items record their vote against the feedback item.
    const feedbackLink = item.sourceLinks.find((link) =>
      link.externalId?.startsWith("feedback:"),
    );
    const feedbackKey = feedbackLink?.externalId?.slice("feedback:".length);
    return feedbackKey ? votedFeedbackKeys.has(feedbackKey) : false;
  };

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
    analytics: {
      totalEvents: eventRecords.length,
      uniqueAccounts: new Set(
        eventRecords.flatMap((item) => (item.accountId ? [item.accountId] : [])),
      ).size,
      uniqueUsers: new Set(
        eventRecords.flatMap((item) => (item.externalUserId ? [item.externalUserId] : [])),
      ).size,
      recentEvents: eventRecords.slice(0, 8).map((item) => ({
        accountId: item.accountId,
        createdAt: item.createdAt,
        event: item.event,
        externalUserId: item.externalUserId,
        source: item.source,
        updateKey: item.updateKey,
      })),
      topEvents: Object.entries(
        eventRecords.reduce<Record<string, number>>((counts, item) => {
          counts[item.event] = (counts[item.event] ?? 0) + 1;
          return counts;
        }, {}),
      )
        .map(([event, count]) => ({ count, event }))
        .sort((a, b) => b.count - a.count || a.event.localeCompare(b.event))
        .slice(0, 6),
      topCategories: Object.entries(
        eventRecords.reduce<Record<string, number>>((counts, item) => {
          const category = analyticsEventCategory(item.event);
          counts[category] = (counts[category] ?? 0) + 1;
          return counts;
        }, {}),
      )
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category)),
    },
    recentChangelog: await Promise.all(
      changelog.map(async (entry) => ({
        ...normalizeChangelog(entry),
        coverImageStorageId: entry.coverImageStorageId ?? null,
        coverImageUrl: entry.coverImageStorageId
          ? await ctx.storage.getUrl(entry.coverImageStorageId)
          : null,
        metaDescription: entry.metaDescription ?? null,
      })),
    ),
    roadmap: roadmap.map((item) => ({
      ...normalizeRoadmap(item),
      viewerHasVoted: roadmapHasViewerVote(item),
    })),
    feedback: feedback.map((item) => ({
      ...normalizeFeedback(item),
      viewerHasVoted: votedFeedbackKeys.has(item.stableKey),
    })),
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
