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
import { combineAutoSaveStatus, useSettingsAutoSave } from "@/components/use-settings-autosave";

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
  const formState = useSettingsWorkspaceFormState({
    activeProject,
    automationRules: settings?.automationRules,
    workspace,
  });
  const canSave = workspace.id !== fallbackWorkspace.id && activeProject.id !== "new-project";
  const actions = useSettingsWorkspaceSaveActions({
    activeProject,
    formState,
    generateLogoUploadUrl,
    suggestProject,
    logoFileInputRef,
    updateAutomationRules: updateRules,
    updatePortal,
    updateProject,
    workspace,
  });

  // Debounced auto-save per editable slice; the toolbar shows the merged status.
  const identity = `${workspace.id}:${activeProject.id}`;
  const projectSave = useSettingsAutoSave({
    enabled: canSave,
    identity,
    save: async () => {
      await actions.saveProject();
    },
    signature: JSON.stringify({
      description: formState.description,
      logoUrl: formState.logoUrl,
      name: formState.name,
      websiteUrl: formState.websiteUrl,
    }),
  });
  const portalSave = useSettingsAutoSave({
    enabled: canSave,
    identity,
    save: async () => {
      await actions.savePortal();
    },
    signature: JSON.stringify({
      customThemeCss: formState.customThemeCss,
      headline: formState.headline,
      intro: formState.intro,
      themeAppearance: formState.themeAppearance,
      themePreset: formState.themePreset,
    }),
  });
  const automationSave = useSettingsAutoSave({
    enabled: canSave,
    // Keyed on the rules record (not just the project) so the async first load
    // of automation rules re-baselines instead of looking like a user edit.
    identity: formState.automationKey,
    save: async () => {
      await actions.saveAutomation(formState.automation);
    },
    signature: JSON.stringify(formState.automation),
  });
  const autoSave = combineAutoSaveStatus([projectSave, portalSave, automationSave]);

  return {
    automation: formState.automation,
    autoSaveStatus: autoSave.status,
    canSave,
    customThemeCss: formState.customThemeCss,
    description: formState.description,
    headline: formState.headline,
    intro: formState.intro,
    isDirty: autoSave.isDirty,
    lastSavedAt: autoSave.lastSavedAt,
    logoAction: actions.logoAction,
    logoFileInputRef,
    logoUrl: formState.logoUrl,
    name: formState.name,
    onRetrySave: autoSave.retry,
    onLoadLogoFromWebsite: () => {
      void actions.loadLogoFromWebsite();
    },
    onLogoFileChange: (file: File | undefined) => {
      void actions.uploadLogoFile(file);
    },
    serviceRows: settingsServiceRows(activeProject),
    settings,
    setAutomationRule: formState.setAutomationRule,
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
