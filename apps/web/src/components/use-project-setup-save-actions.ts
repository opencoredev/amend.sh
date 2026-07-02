import { useMutation } from "convex/react";
import { useState } from "react";

import { fallbackWorkspace } from "@/components/amend-dashboard-constants";
import {
  connectProjectRepositoryMutation,
  createProjectMutation,
  markProjectFeedbackSourceMutation,
} from "@/components/amend-dashboard-data";
import type {
  CreatedProject,
  ProjectMenuItem,
  ProjectSuggestion,
  RepositoryDraft,
  Workspace,
} from "@/components/amend-dashboard-types";
import type { ProjectConnectionMode } from "@/components/use-project-setup-github";
import { normalizeOptionalUrl, slugPart } from "@/components/amend-dashboard-format";
import { capturePostHogEvent } from "@/lib/posthog";
import { errorMessage, toast } from "@/lib/toast";

export function useProjectSetupSaveActions({
  connectionMode,
  description,
  existingProject,
  hasFirstSource,
  onCreated,
  projectName,
  projectSlug,
  repositoryDraft,
  setMessage,
  setRepositoryInput,
  suggestion,
  visibility,
  websiteUrl,
  workspace,
}: {
  connectionMode: ProjectConnectionMode;
  description: string;
  existingProject?: ProjectMenuItem;
  hasFirstSource: boolean;
  onCreated: (projectSlug: string, workspaceSlug?: string) => void;
  projectName: string;
  projectSlug: string;
  repositoryDraft: RepositoryDraft | null;
  setMessage: (message: string) => void;
  setRepositoryInput: (input: string) => void;
  suggestion: ProjectSuggestion | null;
  visibility: "private" | "public";
  websiteUrl: string;
  workspace: Workspace;
}) {
  const create = useMutation(createProjectMutation);
  const connectRepository = useMutation(connectProjectRepositoryMutation);
  const markFeedbackSource = useMutation(markProjectFeedbackSourceMutation);
  const [saving, setSaving] = useState(false);

  function saveProject() {
    if (existingProject) {
      saveExistingProjectSource(existingProject);
      return;
    }
    createProject();
  }

  function saveExistingProjectSource(project: ProjectMenuItem) {
    if (!hasFirstSource || saving) {
      setMessage("Connect a repository or choose Feedback board as the first source.");
      return;
    }

    setSaving(true);
    const task =
      connectionMode === "github" && repositoryDraft
        ? connectRepository({
            defaultBranch: "main",
            owner: repositoryDraft.owner,
            projectKey: project.id,
            repo: repositoryDraft.repo,
            repositoryUrl: repositoryDraft.repositoryUrl,
            workspaceSlug: workspace.id,
          })
        : markFeedbackSource({
            projectKey: project.id,
            workspaceSlug: workspace.id,
          });

    void task
      .then(() => {
        toast.success(
          connectionMode === "github" ? "Repository connected" : "Feedback board source saved",
        );
        void capturePostHogEvent("project_source_connected", {
          project_slug: project.id,
          source_mode: connectionMode,
          surface: "project_setup",
          workspace_slug: workspace.id,
        });
        setRepositoryInput("");
        onCreated(project.id, workspace.id);
      })
      .catch((error: unknown) => {
        toast.error({
          title: "Source connection failed",
          description: errorMessage(
            error,
            connectionMode === "github"
              ? "The selected GitHub repository could not be connected. Check the GitHub installation and try again."
              : "The feedback board source could not be saved. Refresh the project setup page and try again.",
          ),
        });
      })
      .finally(() => setSaving(false));
  }

  function createProject() {
    const name = projectName.trim();
    if (!name) return;
    if (!hasFirstSource) {
      setMessage("Connect a repository or choose Feedback board as the first source.");
      return;
    }
    const slug = slugPart(projectSlug || projectName || websiteUrl, "project");
    const normalizedWebsiteUrl = normalizeOptionalUrl(websiteUrl);
    setSaving(true);
    void create({
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(suggestion?.logoUrl ? { logoUrl: suggestion.logoUrl } : {}),
      ...(connectionMode === "feedback" ? { sourceMode: "feedback" as const } : {}),
      ...(normalizedWebsiteUrl ? { websiteUrl: normalizedWebsiteUrl } : {}),
      name,
      slug,
      visibility,
      ...(workspace.id === fallbackWorkspace.id ? {} : { workspaceSlug: workspace.id }),
    })
      .then(async (created) => {
        const createdProject: CreatedProject = created;
        const projectSlug = createdProject.slug || slug;
        if (connectionMode === "github" && repositoryDraft) {
          try {
            await connectRepository({
              defaultBranch: "main",
              owner: repositoryDraft.owner,
              projectKey: projectSlug,
              repo: repositoryDraft.repo,
              repositoryUrl: repositoryDraft.repositoryUrl,
              workspaceSlug: createdProject.workspaceSlug ?? workspace.id,
            });
          } catch (error) {
            toast.error({
              title: "Project created, repository not connected",
              description: errorMessage(
                error,
                `Project "${name}" was created, but ${repositoryDraft.owner}/${repositoryDraft.repo} could not be connected. Open setup and reconnect the repository.`,
              ),
            });
            void capturePostHogEvent("project_created", {
              has_website_url: Boolean(normalizedWebsiteUrl),
              project_slug: projectSlug,
              source_mode: connectionMode,
              visibility,
              workspace_slug: createdProject.workspaceSlug ?? workspace.id,
            });
            onCreated(projectSlug, createdProject.workspaceSlug);
            return;
          }
        }
        toast.success(
          connectionMode === "github" && repositoryDraft
            ? "Project created and repository connected"
            : "Project created with feedback board source",
        );
        void capturePostHogEvent("project_created", {
          has_website_url: Boolean(normalizedWebsiteUrl),
          project_slug: projectSlug,
          source_mode: connectionMode,
          visibility,
          workspace_slug: createdProject.workspaceSlug ?? workspace.id,
        });
        void capturePostHogEvent("project_source_connected", {
          project_slug: projectSlug,
          source_mode: connectionMode,
          surface: "project_setup",
          workspace_slug: createdProject.workspaceSlug ?? workspace.id,
        });
        onCreated(projectSlug, createdProject.workspaceSlug);
      })
      .catch((error: unknown) => {
        toast.error({
          title: "Project was not created",
          description: errorMessage(
            error,
            `Project "${name}" could not be created in this workspace. Check the slug "${slug}" and try again.`,
          ),
        });
      })
      .finally(() => setSaving(false));
  }

  return { saveProject, saving };
}
