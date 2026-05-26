import { useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";

import type {
  DashboardOverview,
  Workspace,
  WorkspaceSettingsData,
} from "@/components/amend-dashboard-types";
import { fallbackWorkspace } from "@/components/amend-dashboard-utils";
import { useProactivationActions } from "@/components/use-proactivation-actions";

const workspaceSettingsQuery = makeFunctionReference<"query">("amend:getWorkspaceSettings");
export type {
  AutomationMode,
  ChannelState,
  ReviewStatus,
} from "@/components/use-proactivation-actions";

export function useProactivationController({
  dashboard,
  workspace,
}: {
  dashboard: DashboardOverview | undefined;
  workspace: Workspace;
}) {
  const queryArgs = workspace.id === fallbackWorkspace.id ? {} : { workspaceSlug: workspace.id };
  const settings = useQuery(workspaceSettingsQuery, queryArgs) as WorkspaceSettingsData | undefined;
  const channels = dashboard?.channels ?? [];
  const analytics = dashboard?.analytics;
  const activity = dashboard?.agentActivity ?? [];
  const runs = dashboard?.agentRuns ?? [];
  const decisions = dashboard?.automationDecisions ?? [];
  const buildBriefs = dashboard?.buildBriefs ?? [];
  const reviews = dashboard?.reviewQueue ?? [];
  const sources = dashboard?.sourceEvents ?? [];
  const rules = settings?.automationRules;
  const latestReview = reviews.find((item) => item.status === "needs_review") ?? reviews[0];
  const latestDecision = decisions[0];
  const latestRun = runs[0];
  const connectedChannels = channels.filter((channel) => channel.state === "connected").length;
  const inputChannels = channels.filter((channel) => channel.kind === "input");
  const canRun = workspace.id !== fallbackWorkspace.id;
  const actions = useProactivationActions({ latestDecision, latestReview, workspace });

  return {
    activity,
    analytics,
    buildBriefs,
    canRun,
    channels,
    connectedChannels,
    decisions,
    inputChannels,
    latestDecision,
    latestReview,
    latestRun,
    reviews,
    rules,
    runAgentNow: actions.runAgentNow,
    running: actions.running,
    runs,
    saveAutomationMode: actions.saveAutomationMode,
    savingChannel: actions.savingChannel,
    savingMode: actions.savingMode,
    savingReview: actions.savingReview,
    sources,
    revertingDecision: actions.revertingDecision,
    revertLatestDecision: actions.revertLatestDecision,
    updateChannelState: actions.updateChannelState,
    updateLatestReviewStatus: actions.updateLatestReviewStatus,
  };
}
