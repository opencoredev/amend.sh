import { useAction, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { useRef } from "react";

import type {
  ProjectMenuItem,
  Workspace,
  WorkspaceSettingsData,
} from "@/components/amend-dashboard-types";
import { fallbackWorkspace } from "@/components/amend-dashboard-utils";
import { useSettingsWorkspaceFormState } from "@/components/settings-workspace-controller-state";
import { useSettingsWorkspaceSaveActions } from "@/components/use-settings-workspace-save-actions";
import { settingsServiceRows } from "@/components/settings-workspace-service-rows";

const suggestFromWebsite = makeFunctionReference<"action">("projects:suggestFromWebsite");
const workspaceSettingsQuery = makeFunctionReference<"query">("amend:getWorkspaceSettings");
const updateProjectMutation = makeFunctionReference<"mutation">("amend:updateProject");
const generateProjectLogoUploadUrlMutation = makeFunctionReference<"mutation">(
  "amend:generateProjectLogoUploadUrl",
);
const updatePortalSettingsMutation = makeFunctionReference<"mutation">(
  "amend:updatePortalSettings",
);
const updateAutomationRulesMutation = makeFunctionReference<"mutation">(
  "amend:updateAutomationRules",
);

export function useSettingsWorkspaceController({
  activeProject,
  workspace,
}: {
  activeProject: ProjectMenuItem;
  workspace: Workspace;
}) {
  const queryArgs = workspace.id === fallbackWorkspace.id ? {} : { workspaceSlug: workspace.id };
  const settings = useQuery(workspaceSettingsQuery, queryArgs) as WorkspaceSettingsData | undefined;
  const suggestProject = useAction(suggestFromWebsite);
  const updateProject = useMutation(updateProjectMutation);
  const generateLogoUploadUrl = useMutation(generateProjectLogoUploadUrlMutation);
  const updatePortal = useMutation(updatePortalSettingsMutation);
  const updateRules = useMutation(updateAutomationRulesMutation);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const formState = useSettingsWorkspaceFormState({ activeProject, workspace });
  const canSave = workspace.id !== fallbackWorkspace.id && activeProject.id !== "new-project";
  const actions = useSettingsWorkspaceSaveActions({
    activeProject,
    formState,
    generateLogoUploadUrl,
    logoFileInputRef,
    suggestProject,
    updateAutomationRules: updateRules,
    updatePortal,
    updateProject,
    workspace,
  });

  return {
    canSave,
    customThemeCss: formState.customThemeCss,
    description: formState.description,
    headline: formState.headline,
    intro: formState.intro,
    logoAction: actions.logoAction,
    logoFileInputRef,
    logoUrl: formState.logoUrl,
    name: formState.name,
    onAutomationSave: actions.saveAutomationRules,
    onLoadLogoFromWebsite: () => {
      void actions.loadLogoFromWebsite();
    },
    onLogoFileChange: (file: File | undefined) => {
      void actions.uploadLogoFile(file);
    },
    onPortalSave: actions.savePortalSettings,
    onProjectSave: actions.saveProjectSettings,
    saving: actions.saving,
    serviceRows: settingsServiceRows(activeProject),
    settings,
    setCustomThemeCss: formState.setCustomThemeCss,
    setDescription: formState.setDescription,
    setHeadline: formState.setHeadline,
    setIntro: formState.setIntro,
    setLogoUrl: formState.setLogoUrl,
    setName: formState.setName,
    setThemeAppearance: formState.setThemeAppearance,
    setThemePreset: formState.setThemePreset,
    setWebsiteUrl: formState.setWebsiteUrl,
    themeAppearance: formState.themeAppearance,
    themePreset: formState.themePreset,
    websiteUrl: formState.websiteUrl,
  };
}
