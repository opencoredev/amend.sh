import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import type { ProjectMenuItem, Workspace } from "@/components/amend-dashboard-types";
import type { ProjectSourceChoiceProps } from "@/components/project-setup-source-picker";
import { useExistingProjectDraftReset } from "@/components/use-project-setup-draft-effects";
import { useProjectSetupDraftState } from "@/components/use-project-setup-draft-state";
import { useProjectSetupGithub } from "@/components/use-project-setup-github";
import { useProjectSetupSaveActions } from "@/components/use-project-setup-save-actions";

export function useProjectSetupController({
  existingProject,
  onCreated,
  surface,
  workspace,
}: {
  existingProject?: ProjectMenuItem;
  onCreated: (projectSlug: string, workspaceSlug?: string) => void;
  surface: "dashboard" | "first-run";
  workspace: Workspace;
}) {
  const draft = useProjectSetupDraftState({ existingProject, surface });
  const github = useProjectSetupGithub({
    connectionMode: draft.connectionMode,
    setMessage: draft.setMessage,
    workspace,
  });
  const {
    githubDirectory,
    githubDirectoryError,
    githubDirectoryLoading,
    loadGitHubDirectory,
    repositoryCount,
    repositoryDirectory,
    repositoryDraft,
    repositoryInput,
    repoSearch,
    selectGitHubRepository,
    setRepoSearch,
    setRepositoryInput,
  } = github;
  const hasFirstSource = draft.connectionMode === "feedback" || Boolean(repositoryDraft);
  const isRepairingProject = Boolean(existingProject);
  const { saveProject, saving } = useProjectSetupSaveActions({
    connectionMode: draft.connectionMode,
    description: draft.description,
    existingProject,
    hasFirstSource,
    onCreated,
    projectName: draft.projectName,
    projectSlug: draft.projectSlug,
    repositoryDraft,
    setMessage: draft.setMessage,
    setRepositoryInput,
    suggestion: draft.suggestion,
    visibility: draft.visibility,
    websiteUrl: draft.websiteUrl,
    workspace,
  });
  const canCreate =
    (isRepairingProject || draft.projectName.trim().length >= 2) && hasFirstSource && !saving;
  const isFirstRun = surface === "first-run";
  const setupStepCount = 2;

  useExistingProjectDraftReset({
    ...draft.draftResetProps,
    existingProject,
    setRepositoryInput,
  });

  const sourceChoiceProps: ProjectSourceChoiceProps = {
    connectionMode: draft.connectionMode,
    githubDirectory,
    githubDirectoryError,
    githubDirectoryLoading,
    onConnectionModeChange: draft.setConnectionMode,
    onLoadGitHubDirectory: () => {
      void loadGitHubDirectory();
    },
    onRepositoryInputChange: setRepositoryInput,
    onRepositorySearchChange: setRepoSearch,
    onSelectGitHubRepository: selectGitHubRepository,
    repositoryCount,
    repositoryDirectory,
    repositoryDraft,
    repositoryInput,
    repoSearch,
  };

  return {
    canCreate,
    description: draft.description,
    existingProject,
    handleFirstRunKeyDown,
    isFirstRun,
    isRepairingProject,
    message: draft.message,
    saveProject,
    setVisibility: draft.setVisibility,
    setWebsiteUrl: draft.setWebsiteUrl,
    setupStep: draft.setupStep,
    setupStepCount,
    sourceChoiceProps,
    suggestion: draft.suggestion,
    suggestionLoading: draft.suggestionLoading,
    updateDescription: draft.updateDescription,
    updateProjectName: draft.updateProjectName,
    updateProjectSlug: draft.updateProjectSlug,
    visibility: draft.visibility,
    websiteStatus: draft.websiteStatus,
    websiteUrl: draft.websiteUrl,
    projectName: draft.projectName,
    projectSlug: draft.projectSlug,
    saving,
    continueFromWebsiteStep: draft.continueFromWebsiteStep,
    goBackToWebsiteStep: draft.goBackToWebsiteStep,
  };

  function handleFirstRunKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA") return;
    event.preventDefault();
    if (draft.setupStep === 0) {
      if (!draft.suggestionLoading && (!draft.websiteUrl.trim() || draft.suggestion)) {
        draft.continueFromWebsiteStep();
      }
      return;
    }
    if (canCreate) {
      saveProject();
    }
  }
}
