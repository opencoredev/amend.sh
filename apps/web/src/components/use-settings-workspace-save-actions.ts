import type { RefObject } from "react";

import type { ProjectMenuItem, Workspace } from "@/components/amend-dashboard-types";
import type { SettingsWorkspaceFormState } from "@/components/settings-workspace-controller-state";
import type { AutomationRulesDraft } from "@/components/settings-workspace-panel-types";
import { useSettingsWorkspaceLogoActions } from "@/components/use-settings-workspace-logo-actions";

type SettingsWorkspaceSaveActionsOptions = {
  activeProject: ProjectMenuItem;
  formState: SettingsWorkspaceFormState;
  generateLogoUploadUrl: (args: { projectKey: string; workspaceSlug: string }) => Promise<unknown>;
  logoFileInputRef: RefObject<HTMLInputElement | null>;
  suggestProject: (args: { websiteUrl: string }) => Promise<unknown>;
  updateAutomationRules: (args: Record<string, unknown>) => Promise<unknown>;
  updatePortal: (args: Record<string, unknown>) => Promise<unknown>;
  updateProject: (args: Record<string, unknown>) => Promise<unknown>;
  workspace: Workspace;
};

/**
 * Raw persistence for each editable settings slice. These intentionally return
 * the mutation promise without toasting — auto-save reports success/failure
 * through the toolbar status indicator instead (see {@link useSettingsAutoSave}).
 * Logo upload/load keep their own toasts since they are explicit user actions.
 */
export function useSettingsWorkspaceSaveActions({
  activeProject,
  formState,
  generateLogoUploadUrl,
  logoFileInputRef,
  suggestProject,
  updateAutomationRules,
  updatePortal,
  updateProject,
  workspace,
}: SettingsWorkspaceSaveActionsOptions) {
  const saveProject = (overrides: Record<string, unknown> = {}) =>
    updateProject({
      description: formState.description,
      logoUrl: formState.logoUrl,
      name: formState.name,
      projectKey: activeProject.id,
      visibility: workspace.visibility ?? "private",
      websiteUrl: formState.websiteUrl,
      workspaceSlug: workspace.id,
      ...overrides,
    });

  const savePortal = () =>
    updatePortal({
      changelogVisibility: "public",
      customThemeCss: formState.customThemeCss,
      feedbackMode: "open",
      headline: formState.headline,
      intro: formState.intro,
      roadmapVisibility: "public",
      themeAppearance: formState.themeAppearance,
      themePreset: formState.themePreset,
      workspaceSlug: workspace.id,
    });

  const saveAutomation = (draft: AutomationRulesDraft) =>
    updateAutomationRules({
      autoDraftChangelog: draft.autoDraftChangelog,
      autoNotifyUsers: true,
      autoPublishChangelog: false,
      autoUpdateFeedbackStatus: draft.autoUpdateFeedbackStatus,
      autoUpdateRoadmapStatus: draft.autoUpdateRoadmapStatus,
      mode: "review_first",
      requireReviewBelowConfidence: 0.82,
      requireReviewForHighImpact: true,
      requireReviewForPublicCopy: draft.requireReviewForPublicCopy,
      workspaceSlug: workspace.id,
    });

  const logoActions = useSettingsWorkspaceLogoActions({
    activeProject,
    formState,
    generateLogoUploadUrl,
    logoFileInputRef,
    saveProject,
    suggestProject,
    workspace,
  });

  return {
    loadLogoFromWebsite: logoActions.loadLogoFromWebsite,
    logoAction: logoActions.logoAction,
    saveAutomation,
    savePortal,
    saveProject,
    uploadLogoFile: logoActions.uploadLogoFile,
  };
}
