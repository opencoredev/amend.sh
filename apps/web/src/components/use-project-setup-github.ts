import { useAction } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { useCallback, useEffect, useMemo, useState } from "react";

import type {
  GitHubInstallationDirectory,
  GitHubInstalledRepository,
  Workspace,
} from "@/components/amend-dashboard-types";
import { fallbackWorkspace, parseRepositoryInput } from "@/components/amend-dashboard-utils";

const listGitHubAppRepositoriesAction = makeFunctionReference<"action">(
  "amend:listGitHubAppRepositories",
);

export type ProjectConnectionMode = "feedback" | "github";

export function useProjectSetupGithub({
  connectionMode,
  setMessage,
  workspace,
}: {
  connectionMode: ProjectConnectionMode;
  setMessage: (message: string) => void;
  workspace: Workspace;
}) {
  const listGitHubRepositories = useAction(listGitHubAppRepositoriesAction);
  const [repositoryInput, setRepositoryInput] = useState("");
  const [repoSearch, setRepoSearch] = useState("");
  const [githubDirectory, setGithubDirectory] = useState<GitHubInstallationDirectory | null>(null);
  const [githubDirectoryLoading, setGithubDirectoryLoading] = useState(false);
  const [githubDirectoryError, setGithubDirectoryError] = useState<string | null>(null);
  const repositoryDraft = useMemo(() => parseRepositoryInput(repositoryInput), [repositoryInput]);
  const repositoryDirectory = useMemo(() => {
    const query = repoSearch.trim().toLowerCase();
    const accounts = githubDirectory?.accounts ?? [];
    if (!query) return accounts;
    return accounts
      .map((account) => ({
        ...account,
        repositories: account.repositories.filter((repository) => {
          const haystack = [
            account.login,
            repository.fullName,
            repository.description ?? "",
            repository.private ? "private" : "public",
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(query);
        }),
      }))
      .filter(
        (account) => account.login.toLowerCase().includes(query) || account.repositories.length > 0,
      );
  }, [githubDirectory, repoSearch]);
  const repositoryCount = useMemo(
    () =>
      (githubDirectory?.accounts ?? []).reduce(
        (count, account) => count + account.repositories.length,
        0,
      ),
    [githubDirectory],
  );

  const loadGitHubDirectory = useCallback(() => {
    setGithubDirectoryLoading(true);
    setGithubDirectoryError(null);
    const args = workspace.id === fallbackWorkspace.id ? {} : { workspaceSlug: workspace.id };
    return listGitHubRepositories(args)
      .then((directory) => {
        setGithubDirectory(directory as GitHubInstallationDirectory);
      })
      .catch((error: unknown) => {
        const text = error instanceof Error ? error.message : "Could not load GitHub installs.";
        setGithubDirectoryError(text);
      })
      .finally(() => setGithubDirectoryLoading(false));
  }, [listGitHubRepositories, workspace.id]);

  useEffect(() => {
    if (connectionMode !== "github") return;
    void loadGitHubDirectory();
  }, [connectionMode, loadGitHubDirectory]);

  function selectGitHubRepository(repository: GitHubInstalledRepository) {
    setRepositoryInput(repository.fullName);
    setMessage(`Selected ${repository.fullName}.`);
  }

  return {
    githubDirectory,
    githubDirectoryError,
    githubDirectoryLoading,
    loadGitHubDirectory,
    repositoryCount,
    repositoryDirectory,
    repositoryDraft,
    repositoryInput,
    repoSearch,
    selectGitHubRepository,
    setRepoSearch,
    setRepositoryInput,
  };
}
