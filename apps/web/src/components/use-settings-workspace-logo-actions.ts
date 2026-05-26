import { useState } from "react";
import type { RefObject } from "react";

import type {
  ProjectMenuItem,
  ProjectSuggestion,
  Workspace,
} from "@/components/amend-dashboard-types";
import type { SettingsWorkspaceFormState } from "@/components/settings-workspace-controller-state";
import type { LogoActionState } from "@/components/settings-workspace-panel-types";
import { errorMessage, toast } from "@/lib/toast";

type SaveProject = (overrides?: Record<string, unknown>) => Promise<unknown>;

export function useSettingsWorkspaceLogoActions({
  activeProject,
  formState,
  generateLogoUploadUrl,
  logoFileInputRef,
  saveProject,
  suggestProject,
  workspace,
}: {
  activeProject: ProjectMenuItem;
  formState: SettingsWorkspaceFormState;
  generateLogoUploadUrl: (args: { projectKey: string; workspaceSlug: string }) => Promise<unknown>;
  logoFileInputRef: RefObject<HTMLInputElement | null>;
  saveProject: SaveProject;
  suggestProject: (args: { websiteUrl: string }) => Promise<unknown>;
  workspace: Workspace;
}) {
  const [logoAction, setLogoAction] = useState<LogoActionState>(null);

  return {
    loadLogoFromWebsite,
    logoAction,
    uploadLogoFile,
  };

  async function uploadLogoFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error({
        title: "Logo was not uploaded",
        description: "Choose an image file like PNG, JPG, SVG, or WebP.",
      });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error({
        title: "Logo is too large",
        description: "Use an image smaller than 4 MB.",
      });
      return;
    }

    setLogoAction("upload");
    try {
      const uploadUrl = (await generateLogoUploadUrl({
        projectKey: activeProject.id,
        workspaceSlug: workspace.id,
      })) as string;
      const response = await fetch(uploadUrl, {
        body: file,
        headers: { "Content-Type": file.type },
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Convex storage rejected the uploaded image.");
      }
      const { storageId } = (await response.json()) as { storageId: string };
      const saved = (await saveProject({ logoStorageId: storageId })) as { logoUrl?: string };
      if (saved.logoUrl) formState.setLogoUrl(saved.logoUrl);
      toast.success("Logo uploaded");
    } catch (error) {
      toast.error({
        title: "Logo was not uploaded",
        description: errorMessage(
          error,
          "The image could not be stored. Try a smaller image or use a logo URL instead.",
        ),
      });
    } finally {
      setLogoAction(null);
      if (logoFileInputRef.current) logoFileInputRef.current.value = "";
    }
  }

  async function loadLogoFromWebsite() {
    const trimmed = formState.websiteUrl.trim();
    if (!trimmed) {
      toast.error({
        title: "Website URL is missing",
        description: "Enter the project website URL first.",
      });
      return;
    }

    setLogoAction("website");
    try {
      const suggestion = (await suggestProject({ websiteUrl: trimmed })) as ProjectSuggestion;
      formState.setWebsiteUrl(suggestion.websiteUrl);
      if (suggestion.logoUrl) {
        formState.setLogoUrl(suggestion.logoUrl);
        toast.success("Logo loaded from website");
        return;
      }
      toast.warning({
        title: "No logo found",
        description: "The website was reachable, but it did not expose a logo or favicon.",
      });
    } catch (error) {
      toast.error({
        title: "Logo was not loaded",
        description: errorMessage(
          error,
          "We could not read that website. Check the URL and try again.",
        ),
      });
    } finally {
      setLogoAction(null);
    }
  }
}
