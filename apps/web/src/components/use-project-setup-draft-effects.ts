import { useEffect } from "react";

import type {
  ProjectMenuItem,
  ProjectSuggestion,
  WebsiteLookupStatus,
} from "@/components/amend-dashboard-types";
import { isCompleteDomainInput } from "@/components/amend-dashboard-utils";
import type { ProjectConnectionMode } from "@/components/use-project-setup-github";

type EditedRef = { current: boolean };

type ExistingProjectDraftResetOptions = {
  descriptionEditedRef: EditedRef;
  existingProject?: ProjectMenuItem;
  nameEditedRef: EditedRef;
  setConnectionMode: (mode: ProjectConnectionMode) => void;
  setDescription: (description: string) => void;
  setMessage: (message: string) => void;
  setProjectName: (name: string) => void;
  setProjectSlug: (slug: string) => void;
  setRepositoryInput: (input: string) => void;
  slugEditedRef: EditedRef;
};

type WebsiteSuggestionOptions = {
  descriptionEditedRef: EditedRef;
  existingProject?: ProjectMenuItem;
  nameEditedRef: EditedRef;
  setDescription: (description: string) => void;
  setMessage: (message: string) => void;
  setProjectName: (name: string) => void;
  setProjectSlug: (slug: string) => void;
  setSuggestion: (suggestion: ProjectSuggestion | null) => void;
  setSuggestionLoading: (loading: boolean) => void;
  setWebsiteStatus: (status: WebsiteLookupStatus) => void;
  slugEditedRef: EditedRef;
  suggestProject: (args: { websiteUrl: string }) => Promise<unknown>;
  websiteUrl: string;
};

export function useExistingProjectDraftReset({
  descriptionEditedRef,
  existingProject,
  nameEditedRef,
  setConnectionMode,
  setDescription,
  setMessage,
  setProjectName,
  setProjectSlug,
  setRepositoryInput,
  slugEditedRef,
}: ExistingProjectDraftResetOptions) {
  useEffect(() => {
    if (!existingProject) return;
    nameEditedRef.current = true;
    slugEditedRef.current = true;
    descriptionEditedRef.current = true;
    setProjectName(existingProject.name);
    setProjectSlug(existingProject.id);
    setDescription(existingProject.description ?? "");
    setRepositoryInput("");
    setConnectionMode("github");
    setMessage(
      `${existingProject.name} needs GitHub or the feedback board before the agent can run.`,
    );
  }, [
    descriptionEditedRef,
    existingProject,
    nameEditedRef,
    setConnectionMode,
    setDescription,
    setMessage,
    setProjectName,
    setProjectSlug,
    setRepositoryInput,
    slugEditedRef,
  ]);
}

export function useProjectSetupWebsiteSuggestion({
  descriptionEditedRef,
  existingProject,
  nameEditedRef,
  setDescription,
  setMessage,
  setProjectName,
  setProjectSlug,
  setSuggestion,
  setSuggestionLoading,
  setWebsiteStatus,
  slugEditedRef,
  suggestProject,
  websiteUrl,
}: WebsiteSuggestionOptions) {
  useEffect(() => {
    const trimmed = websiteUrl.trim();
    setSuggestion(null);
    if (!trimmed) {
      setWebsiteStatus("idle");
      setSuggestionLoading(false);
      setMessage(
        existingProject
          ? `${existingProject.name} needs GitHub or the feedback board before the agent can run.`
          : "Add a website to prefill details, then choose a first source.",
      );
      return;
    }

    if (!isCompleteDomainInput(trimmed)) {
      setWebsiteStatus("idle");
      setSuggestionLoading(false);
      setMessage("Finish the domain, like yourproduct.com.");
      return;
    }

    setWebsiteStatus("idle");
    setSuggestionLoading(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setWebsiteStatus("checking");
      setMessage("Reading website metadata.");
      void suggestProject({ websiteUrl: trimmed })
        .then((next) => {
          if (controller.signal.aborted) return;
          const nextSuggestion = next as ProjectSuggestion;
          setSuggestion(nextSuggestion);
          if (!nameEditedRef.current) {
            setProjectName(nextSuggestion.name);
          }
          if (!slugEditedRef.current) {
            setProjectSlug(nextSuggestion.slug);
          }
          if (!descriptionEditedRef.current && nextSuggestion.description) {
            setDescription(nextSuggestion.description);
          }
          setWebsiteStatus("valid");
          setMessage("Domain verified. Project surface ready.");
          setSuggestionLoading(false);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          const text = error instanceof Error ? error.message : "Could not read that website yet.";
          setWebsiteStatus("invalid");
          setMessage(text);
          setSuggestionLoading(false);
        });
    }, 1100);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [
    descriptionEditedRef,
    existingProject,
    nameEditedRef,
    setDescription,
    setMessage,
    setProjectName,
    setProjectSlug,
    setSuggestion,
    setSuggestionLoading,
    setWebsiteStatus,
    slugEditedRef,
    suggestProject,
    websiteUrl,
  ]);
}
