import { useEffect, useState } from "react";

import type { ProjectMenuItem, Workspace } from "@/components/amend-dashboard-types";

const defaultPortalIntro = "Feedback, roadmap moves, and shipped updates with source evidence.";

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

  useEffect(() => {
    setName(activeProject.name);
    setDescription(activeProject.description ?? "");
    setLogoUrl(activeProject.logoUrl ?? "");
    setWebsiteUrl(activeProject.websiteUrl ?? "");
    setHeadline(workspace.portalSettings?.headline ?? `${activeProject.name} updates`);
    setIntro(workspace.portalSettings?.intro ?? defaultPortalIntro);
  }, [
    activeProject.description,
    activeProject.logoUrl,
    activeProject.name,
    activeProject.websiteUrl,
    workspace.portalSettings?.headline,
    workspace.portalSettings?.intro,
  ]);

  return {
    description,
    headline,
    intro,
    logoUrl,
    name,
    setDescription,
    setHeadline,
    setIntro,
    setLogoUrl,
    setName,
    setWebsiteUrl,
    websiteUrl,
  };
}

export type SettingsWorkspaceFormState = ReturnType<typeof useSettingsWorkspaceFormState>;
