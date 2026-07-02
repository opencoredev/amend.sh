import { api } from "@amend/backend/convex/_generated/api";

import { MessageSquareText } from "@/lib/icons";

import type { Board } from "@/components/amend-dashboard-types";

export const dashboardOverviewQuery = api.amend.getDashboardOverview;
export const projectsQuery = api.amend.getProjects;
export const createFeedbackMutation = api.amend.createFeedback;
export const recordFeedbackInteractionMutation = api.amend.recordFeedbackInteraction;
export const upsertChangelogEntryMutation = api.amend.upsertChangelogEntry;
export const publishChangelogEntryMutation = api.amend.publishChangelogEntry;
export const generateChangelogCoverUploadUrlMutation = api.amend.generateChangelogCoverUploadUrl;
export const upsertRoadmapItemMutation = api.amend.upsertRoadmapItem;
export const voteRoadmapItemMutation = api.amend.voteRoadmapItem;

export const workspaceSettingsQuery = api.amend.getWorkspaceSettings;
export const upsertIntegrationConnectionMutation = api.amend.upsertIntegrationConnection;
export const updateProjectMutation = api.amend.updateProject;
export const generateProjectLogoUploadUrlMutation = api.amend.generateProjectLogoUploadUrl;
export const updatePortalSettingsMutation = api.amend.updatePortalSettings;
export const updateAutomationRulesMutation = api.amend.updateAutomationRules;

// Project setup — create the project, wire its first source, prefill from the website.
export const createProjectMutation = api.amend.createProject;
export const connectProjectRepositoryMutation = api.amend.connectProjectRepository;
export const markProjectFeedbackSourceMutation = api.amend.markProjectFeedbackSource;
export const listGitHubAppRepositoriesAction = api.amend.listGitHubAppRepositories;
export const suggestFromWebsiteAction = api.projects.suggestFromWebsite;

export const listWorkspaceTagsQuery = api.tags.list;
export const createWorkspaceTagMutation = api.tags.create;
export const updateWorkspaceTagMutation = api.tags.update;
export const removeWorkspaceTagMutation = api.tags.remove;

// Proactive agent — Inbox (needs)
export const listGhostsQuery = api.needs.listGhosts;
export const listAcceptedNeedsQuery = api.needs.listAccepted;
export const getNeedQuery = api.needs.get;
export const acceptGhostMutation = api.needs.acceptGhost;
export const keepGatheringMutation = api.needs.keepGathering;
export const killGhostMutation = api.needs.killGhost;
export const restoreGhostMutation = api.needs.restoreGhost;

// Proactive agent — Inbox (drafts)
export const listPendingDraftsQuery = api.drafts.listPending;
export const approveDraftMutation = api.drafts.approve;
export const rejectDraftMutation = api.drafts.reject;
export const updateDraftTextMutation = api.drafts.updateDraftText;

// Proactive agent — Memory
export const listMemoryRulesQuery = api.memory.listRules;
export const toggleMemoryRuleMutation = api.memory.toggleRule;
export const undoMemoryRuleMutation = api.memory.undoRule;

// Proactive agent — weekly digest
export const digestPreviewQuery = api.digest.preview;

// GitHub App install completion + install-context (installUrl without the
// full repository listing — used by Connections).
export const completeGithubInstallMutation = api.amendGithubInstall.completeGithubInstall;
export const githubInstallContextQuery = api.amend.getGitHubInstallContext;

export const feedbackBoard: Board = {
  id: "feedback",
  name: "Feedback",
  description:
    "Feedback, roadmap evidence, and shipped updates from the connected Amend workspace.",
  icon: <MessageSquareText />,
};
