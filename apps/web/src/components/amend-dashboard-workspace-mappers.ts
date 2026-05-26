import { fallbackWorkspace } from "@/components/amend-dashboard-constants";
import { initialsFor, titleizeSlug } from "@/components/amend-dashboard-format";
import type {
  DashboardOverview,
  DashboardProject,
  ProjectMenuItem,
  RepositoryDraft,
  Workspace,
} from "@/components/amend-dashboard-types";

export function parseRepositoryInput(value: string): RepositoryDraft | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://github.com/${trimmed}`;
  try {
    const url = new URL(normalized);
    if (!["github.com", "www.github.com"].includes(url.hostname.toLowerCase())) {
      return null;
    }
    const [owner, repoPart] = url.pathname.split("/").filter(Boolean);
    const repo = repoPart?.replace(/\.git$/i, "");
    if (!owner || !repo) return null;
    if (!/^[a-z0-9_.-]+$/i.test(owner) || !/^[a-z0-9_.-]+$/i.test(repo)) {
      return null;
    }
    return {
      owner,
      repo,
      repositoryUrl: `https://github.com/${owner}/${repo}`,
    };
  } catch {
    return null;
  }
}

export function workspaceFromDashboard(
  dashboard: DashboardOverview | undefined,
  requestedSlug: string,
): Workspace {
  if (!dashboard?.workspace) {
    if (requestedSlug && requestedSlug !== fallbackWorkspace.id) {
      return {
        ...fallbackWorkspace,
        id: requestedSlug,
        portal: `${requestedSlug}.amend.sh`,
      };
    }
    return fallbackWorkspace;
  }

  const name = dashboard.workspace.name || fallbackWorkspace.name;
  const repo =
    dashboard.github?.owner && dashboard.github.repo
      ? `${dashboard.github.owner}/${dashboard.github.repo}`
      : fallbackWorkspace.repo;
  const slug = dashboard.workspace.slug || "portal";

  return {
    description: dashboard.workspace.description,
    id: slug,
    initials: initialsFor(name),
    name,
    plan: "Workspace",
    portalSettings: dashboard.workspace.portalSettings,
    repo,
    portal: `${slug}.amend.sh`,
    visibility: dashboard.workspace.visibility,
  };
}

export function projectsToMenuItems(
  projects: DashboardProject[] | undefined,
  fallback: Workspace,
): ProjectMenuItem[] {
  if (projects === undefined) {
    return [];
  }

  if (projects.length === 0) {
    return [
      {
        id: "new-project",
        initials: fallback.initials,
        name: "No project yet",
        plan: "Setup required",
        repo: fallback.repo,
        portal: fallback.portal,
        sourceReady: false,
      },
    ];
  }

  return [...projects]
    .sort((left, right) => (right.updatedAt ?? 0) - (left.updatedAt ?? 0))
    .map((project) => {
      const repository = project.repositories?.[0];
      const sourceReady = Boolean(repository) || project.sourceMode === "feedback";
      const repo =
        repository?.owner && repository.repo
          ? `${repository.owner}/${repository.repo}`
          : repository?.repositoryUrl ||
            (project.sourceMode === "feedback" ? "Feedback board only" : "Connect source");

      return {
        description: project.description,
        id: project.slug,
        initials: initialsFor(project.name),
        logoUrl: project.logoUrl,
        name: project.name,
        plan: "Project",
        repo,
        portal: `${project.slug}.amend.sh`,
        sourceReady,
        websiteUrl: project.websiteUrl,
      };
    });
}

export function optimisticProjectMenuItem(
  projectSlug: string,
  workspace: Workspace,
  dashboard: DashboardOverview | undefined,
): ProjectMenuItem {
  const repo =
    dashboard?.github?.owner && dashboard.github.repo
      ? `${dashboard.github.owner}/${dashboard.github.repo}`
      : workspace.repo;
  return {
    id: projectSlug,
    initials: initialsFor(projectSlug),
    name: titleizeSlug(projectSlug),
    plan: "Project",
    portal: `${projectSlug}.amend.sh`,
    repo,
    sourceReady: repo !== fallbackWorkspace.repo,
  };
}
