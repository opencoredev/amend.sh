import { useEffect, useState } from "react";

import type { ProjectMenuItem, Workspace } from "@/components/amend-dashboard-types";
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

export function useSettingsWorkspaceFormState({
  activeProject,
  workspace,
}: {
  activeProject: ProjectMenuItem;
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

  useEffect(() => {
    setName(activeProject.name);
    setDescription(activeProject.description ?? "");
    setLogoUrl(activeProject.logoUrl ?? "");
    setWebsiteUrl(activeProject.websiteUrl ?? "");
    setHeadline(workspace.portalSettings?.headline ?? `${activeProject.name} updates`);
    setIntro(workspace.portalSettings?.intro ?? defaultPortalIntro);
    setThemePreset(initialThemePreset(workspace));
    setThemeAppearance(initialThemeAppearance(workspace));
    setCustomThemeCss(workspace.portalSettings?.customThemeCss ?? "");
  }, [
    activeProject.description,
    activeProject.logoUrl,
    activeProject.name,
    activeProject.websiteUrl,
    workspace,
  ]);

  return {
    customThemeCss,
    description,
    headline,
    intro,
    logoUrl,
    name,
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
