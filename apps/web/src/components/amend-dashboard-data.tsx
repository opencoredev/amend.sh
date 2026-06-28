import { MessageSquareText } from "@/lib/icons";
import { makeFunctionReference } from "convex/server";

import type { Board } from "@/components/amend-dashboard-types";

export const dashboardOverviewQuery = makeFunctionReference<"query">("amend:getDashboardOverview");
export const projectsQuery = makeFunctionReference<"query">("amend:getProjects");
export const createFeedbackMutation = makeFunctionReference<"mutation">("amend:createFeedback");
export const recordFeedbackInteractionMutation = makeFunctionReference<"mutation">(
  "amend:recordFeedbackInteraction",
);
export const upsertChangelogEntryMutation = makeFunctionReference<"mutation">(
  "amend:upsertChangelogEntry",
);
export const publishChangelogEntryMutation = makeFunctionReference<"mutation">(
  "amend:publishChangelogEntry",
);
export const generateChangelogCoverUploadUrlMutation = makeFunctionReference<"mutation">(
  "amend:generateChangelogCoverUploadUrl",
);
export const upsertRoadmapItemMutation =
  makeFunctionReference<"mutation">("amend:upsertRoadmapItem");
export const voteRoadmapItemMutation = makeFunctionReference<"mutation">("amend:voteRoadmapItem");

export const workspaceSettingsQuery = makeFunctionReference<"query">("amend:getWorkspaceSettings");
export const upsertIntegrationConnectionMutation = makeFunctionReference<"mutation">(
  "amend:upsertIntegrationConnection",
);

export const listWorkspaceTagsQuery = makeFunctionReference<"query">("tags:list");
export const createWorkspaceTagMutation = makeFunctionReference<"mutation">("tags:create");
export const updateWorkspaceTagMutation = makeFunctionReference<"mutation">("tags:update");
export const removeWorkspaceTagMutation = makeFunctionReference<"mutation">("tags:remove");

// Proactive agent — Inbox (needs)
export const listGhostsQuery = makeFunctionReference<"query">("needs:listGhosts");
export const listAcceptedNeedsQuery = makeFunctionReference<"query">("needs:listAccepted");
export const getNeedQuery = makeFunctionReference<"query">("needs:get");
export const acceptGhostMutation = makeFunctionReference<"mutation">("needs:acceptGhost");
export const keepGatheringMutation = makeFunctionReference<"mutation">("needs:keepGathering");
export const killGhostMutation = makeFunctionReference<"mutation">("needs:killGhost");
export const restoreGhostMutation = makeFunctionReference<"mutation">("needs:restoreGhost");

// Proactive agent — Inbox (drafts)
export const listPendingDraftsQuery = makeFunctionReference<"query">("drafts:listPending");
export const approveDraftMutation = makeFunctionReference<"mutation">("drafts:approve");
export const rejectDraftMutation = makeFunctionReference<"mutation">("drafts:reject");
export const updateDraftTextMutation = makeFunctionReference<"mutation">("drafts:updateDraftText");

// Proactive agent — Memory
export const listMemoryRulesQuery = makeFunctionReference<"query">("memory:listRules");
export const toggleMemoryRuleMutation = makeFunctionReference<"mutation">("memory:toggleRule");
export const undoMemoryRuleMutation = makeFunctionReference<"mutation">("memory:undoRule");

// Proactive agent — weekly digest
export const digestPreviewQuery = makeFunctionReference<"query">("digest:preview");

// GitHub App install completion
export const completeGithubInstallMutation = makeFunctionReference<"mutation">(
  "amendGithubInstall:completeGithubInstall",
);

export const feedbackBoard: Board = {
  id: "feedback",
  name: "Feedback",
  description:
    "Feedback, roadmap evidence, and shipped updates from the connected Amend workspace.",
  icon: <MessageSquareText />,
};
