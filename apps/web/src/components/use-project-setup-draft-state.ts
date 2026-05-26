import { useAction } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { useRef, useState } from "react";

import type {
  ProjectMenuItem,
  ProjectSuggestion,
  WebsiteLookupStatus,
} from "@/components/amend-dashboard-types";
import { fallbackProjectNameFromUrl, slugPart } from "@/components/amend-dashboard-utils";
import { useProjectSetupWebsiteSuggestion } from "@/components/use-project-setup-draft-effects";
import type { ProjectConnectionMode } from "@/components/use-project-setup-github";

const suggestFromWebsite = makeFunctionReference<"action">("projects:suggestFromWebsite");

export function useProjectSetupDraftState({
  existingProject,
  surface,
}: {
  existingProject?: ProjectMenuItem;
  surface: "dashboard" | "first-run";
}) {
  const suggestProject = useAction(suggestFromWebsite);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectSlug, setProjectSlug] = useState("");
  const [description, setDescription] = useState("");
  const [connectionMode, setConnectionMode] = useState<ProjectConnectionMode>("github");
  const [visibility, setVisibility] = useState<"private" | "public">(
    surface === "first-run" ? "public" : "private",
  );
  const [suggestion, setSuggestion] = useState<ProjectSuggestion | null>(null);
  const [message, setMessage] = useState(
    "Add a website to prefill details, then choose a first source.",
  );
  const [websiteStatus, setWebsiteStatus] = useState<WebsiteLookupStatus>("idle");
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [setupStep, setSetupStep] = useState(0);
  const nameEditedRef = useRef(false);
  const slugEditedRef = useRef(false);
  const descriptionEditedRef = useRef(false);

  useProjectSetupWebsiteSuggestion({
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
  });

  function updateProjectName(nextName: string) {
    nameEditedRef.current = true;
    setProjectName(nextName);
    if (!slugEditedRef.current) {
      setProjectSlug(slugPart(nextName, "project"));
    }
  }

  function updateProjectSlug(nextSlug: string) {
    slugEditedRef.current = true;
    setProjectSlug(slugPart(nextSlug, ""));
  }

  function updateDescription(nextDescription: string) {
    descriptionEditedRef.current = true;
    setDescription(nextDescription);
  }

  function continueFromWebsiteStep() {
    if (websiteUrl.trim() && !suggestion) {
      setMessage("Wait for the domain check to finish before continuing.");
      return;
    }
    if (!projectName.trim()) {
      const fallbackName = fallbackProjectNameFromUrl(websiteUrl);
      if (fallbackName && !nameEditedRef.current) {
        setProjectName(fallbackName);
      }
      if (fallbackName && !slugEditedRef.current) {
        setProjectSlug(slugPart(fallbackName, "project"));
      }
    }
    setSetupStep(1);
  }

  function goBackToWebsiteStep() {
    setSetupStep(0);
  }

  return {
    connectionMode,
    continueFromWebsiteStep,
    description,
    draftResetProps: {
      descriptionEditedRef,
      nameEditedRef,
      setConnectionMode,
      setDescription,
      setMessage,
      setProjectName,
      setProjectSlug,
      slugEditedRef,
    },
    goBackToWebsiteStep,
    message,
    projectName,
    projectSlug,
    setConnectionMode,
    setMessage,
    setVisibility,
    setWebsiteUrl,
    setupStep,
    suggestion,
    suggestionLoading,
    updateDescription,
    updateProjectName,
    updateProjectSlug,
    visibility,
    websiteStatus,
    websiteUrl,
  };
}
