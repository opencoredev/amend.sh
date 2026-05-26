import { useState } from "react";
import type { RefObject } from "react";

import type { ProjectMenuItem, Workspace } from "@/components/amend-dashboard-types";
import type { SettingsWorkspaceFormState } from "@/components/settings-workspace-controller-state";
import type { SettingsSavingState } from "@/components/settings-workspace-panels";
import { useSettingsWorkspaceLogoActions } from "@/components/use-settings-workspace-logo-actions";
import { errorMessage, toast } from "@/lib/toast";

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
  const [saving, setSaving] = useState<SettingsSavingState>(null);

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
    saveAutomationRules,
    savePortalSettings,
    saveProjectSettings,
    saving,
    uploadLogoFile: logoActions.uploadLogoFile,
  };

  function saveProjectSettings() {
    setSaving("project");
    void saveProject()
      .then(() => toast.success("Project saved"))
      .catch((error: unknown) =>
        toast.error({
          title: "Project was not saved",
          description: errorMessage(
            error,
            "The selected project could not be updated. Check the values and try again.",
          ),
        }),
      )
      .finally(() => setSaving(null));
  }

  function savePortalSettings() {
    setSaving("portal");
    void updatePortal({
      changelogVisibility: "public",
      feedbackMode: "open",
      headline: formState.headline,
      intro: formState.intro,
      roadmapVisibility: "public",
      workspaceSlug: workspace.id,
    })
      .then(() => toast.success("Portal settings saved"))
      .catch((error: unknown) =>
        toast.error({
          title: "Portal settings were not saved",
          description: errorMessage(
            error,
            "The public portal copy could not be updated. Check the fields and try again.",
          ),
        }),
      )
      .finally(() => setSaving(null));
  }

  function saveAutomationRules() {
    setSaving("automation");
    void updateAutomationRules({
      autoDraftChangelog: true,
      autoNotifyUsers: true,
      autoPublishChangelog: false,
      autoUpdateFeedbackStatus: true,
      autoUpdateRoadmapStatus: true,
      mode: "review_first",
      requireReviewBelowConfidence: 0.82,
      requireReviewForHighImpact: true,
      requireReviewForPublicCopy: true,
      workspaceSlug: workspace.id,
    })
      .then(() => toast.success("Automation rules saved"))
      .catch((error: unknown) =>
        toast.error({
          title: "Automation settings were not saved",
          description: errorMessage(
            error,
            "The automation rules could not be updated. Refresh the settings page and try again.",
          ),
        }),
      )
      .finally(() => setSaving(null));
  }
}
