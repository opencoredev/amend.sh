import { useState } from "react";

import type {
  ProjectMenuItem,
  Workspace,
  WorkspaceSettingsData,
} from "@/components/amend-dashboard-types";
import type { AutomationRulesDraft } from "@/components/settings-workspace-panel-types";
import { getPortalThemePreset, type PortalThemeAppearance } from "@/lib/portal-themes";

const defaultPortalIntro = "Feedback, roadmap moves, and shipped updates with source evidence.";

function initialThemePreset(workspace: Workspace) {
  return workspace.portalSettings?.themePreset ?? "amend";
}

function initialThemeAppearance(workspace: Workspace): PortalThemeAppearance {
  const preset = initialThemePreset(workspace);
  return (
    workspace.portalSettings?.themeAppearance ??
    getPortalThemePreset(preset)?.defaultAppearance ??
    "dark"
  );
}

function automationDraftFromRules(
  rules: WorkspaceSettingsData["automationRules"],
): AutomationRulesDraft {
  return {
    autoDraftChangelog: rules?.autoDraftChangelog ?? false,
    autoUpdateFeedbackStatus: rules?.autoUpdateFeedbackStatus ?? false,
    autoUpdateRoadmapStatus: rules?.autoUpdateRoadmapStatus ?? false,
    requireReviewForPublicCopy: rules?.requireReviewForPublicCopy ?? true,
  };
}

export function useSettingsWorkspaceFormState({
  activeProject,
  automationRules,
  workspace,
}: {
  activeProject: ProjectMenuItem;
  automationRules: WorkspaceSettingsData["automationRules"];
  workspace: Workspace;
}) {
  const [name, setName] = useState(activeProject.name);
  const [description, setDescription] = useState(activeProject.description ?? "");
  const [logoUrl, setLogoUrl] = useState(activeProject.logoUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(activeProject.websiteUrl ?? "");
  const [headline, setHeadline] = useState(
    workspace.portalSettings?.headline ?? `${activeProject.name} updates`,
  );
  const [intro, setIntro] = useState(workspace.portalSettings?.intro ?? defaultPortalIntro);
  const [themePreset, setThemePreset] = useState(initialThemePreset(workspace));
  const [themeAppearance, setThemeAppearance] = useState<PortalThemeAppearance>(
    initialThemeAppearance(workspace),
  );
  const [customThemeCss, setCustomThemeCss] = useState(
    workspace.portalSettings?.customThemeCss ?? "",
  );
  const [automation, setAutomation] = useState<AutomationRulesDraft>(() =>
    automationDraftFromRules(automationRules),
  );

  // Re-seed during render (React's "adjust state when a prop changes" pattern)
  // rather than in an effect, so identity-keyed fields and the auto-save
  // identity move together — no one-render gap that would fire a spurious save.
  // Keyed on project identity, so editing a project never resets it from the
  // live-query echo of our own auto-save; only a *different* project re-seeds.
  const identity = `${workspace.id}:${activeProject.id}`;
  const [seededIdentity, setSeededIdentity] = useState(identity);
  if (seededIdentity !== identity) {
    setSeededIdentity(identity);
    setName(activeProject.name);
    setDescription(activeProject.description ?? "");
    setLogoUrl(activeProject.logoUrl ?? "");
    setWebsiteUrl(activeProject.websiteUrl ?? "");
    setHeadline(workspace.portalSettings?.headline ?? `${activeProject.name} updates`);
    setIntro(workspace.portalSettings?.intro ?? defaultPortalIntro);
    setThemePreset(initialThemePreset(workspace));
    setThemeAppearance(initialThemeAppearance(workspace));
    setCustomThemeCss(workspace.portalSettings?.customThemeCss ?? "");
  }

  // Automation rules arrive from the settings query (async) and update in place
  // after a save. Re-seed only when the backing record changes (first load or
  // project switch) so a toggle the user just flipped never snaps back.
  const automationKey = `${identity}:${automationRules?.recordId ?? null}`;
  const [seededAutomationKey, setSeededAutomationKey] = useState(automationKey);
  if (seededAutomationKey !== automationKey) {
    setSeededAutomationKey(automationKey);
    setAutomation(automationDraftFromRules(automationRules));
  }

  function setAutomationRule(key: keyof AutomationRulesDraft, value: boolean) {
    setAutomation((current) => ({ ...current, [key]: value }));
  }

  return {
    automation,
    automationKey,
    customThemeCss,
    description,
    headline,
    intro,
    logoUrl,
    name,
    setAutomationRule,
    setCustomThemeCss,
    setDescription,
    setHeadline,
    setIntro,
    setLogoUrl,
    setName,
    setThemeAppearance,
    setThemePreset,
    setWebsiteUrl,
    themeAppearance,
    themePreset,
    websiteUrl,
  };
}

export type SettingsWorkspaceFormState = ReturnType<typeof useSettingsWorkspaceFormState>;
