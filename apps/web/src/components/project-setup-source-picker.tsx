import { Github, Inbox } from "@/lib/icons";

import type {
  GitHubInstallationAccount,
  GitHubInstallationDirectory,
  GitHubInstalledRepository,
  RepositoryDraft,
} from "@/components/amend-dashboard-types";
import { SelectableRow } from "@/components/onboarding-ui";
import { GitHubRepositoryPicker } from "@/components/project-setup-github-repository-picker";

export type ProjectSourceChoiceProps = {
  connectionMode: "feedback" | "github";
  githubDirectory: GitHubInstallationDirectory | null;
  githubDirectoryError: string | null;
  githubDirectoryLoading: boolean;
  onConnectionModeChange: (mode: "feedback" | "github") => void;
  onLoadGitHubDirectory: () => void;
  onRepositoryInputChange: (value: string) => void;
  onRepositorySearchChange: (value: string) => void;
  onSelectGitHubRepository: (repository: GitHubInstalledRepository) => void;
  repositoryCount: number;
  repositoryDirectory: GitHubInstallationAccount[];
  repositoryDraft: RepositoryDraft | null;
  repositoryInput: string;
  repoSearch: string;
};

export function ProjectSourceChoice({
  connectionMode,
  githubDirectory,
  githubDirectoryError,
  githubDirectoryLoading,
  onConnectionModeChange,
  onLoadGitHubDirectory,
  onRepositoryInputChange,
  onRepositorySearchChange,
  onSelectGitHubRepository,
  repositoryCount,
  repositoryDirectory,
  repositoryDraft,
  repositoryInput,
  repoSearch,
}: ProjectSourceChoiceProps) {
  const repositoryTrimmed = repositoryInput.trim();
  const repositoryInvalid =
    connectionMode === "github" && Boolean(repositoryTrimmed) && !repositoryDraft;

  return (
    <div className="grid gap-2.5">
      <SelectableRow
        icon={Github}
        title="GitHub repository"
        description="Turn merged pull requests into updates."
        selected={connectionMode === "github"}
        onClick={() => onConnectionModeChange("github")}
      />
      <SelectableRow
        icon={Inbox}
        title="Feedback board"
        description="Collect requests and let customers vote."
        selected={connectionMode === "feedback"}
        onClick={() => onConnectionModeChange("feedback")}
      />

      {connectionMode === "github" ? (
        <div className="mt-1.5">
          <GitHubRepositoryPicker
            directory={githubDirectory}
            directoryError={githubDirectoryError}
            directoryLoading={githubDirectoryLoading}
            onLoadDirectory={onLoadGitHubDirectory}
            onRepositoryInputChange={onRepositoryInputChange}
            onRepositorySearchChange={onRepositorySearchChange}
            onSelectRepository={onSelectGitHubRepository}
            repositoryCount={repositoryCount}
            repositoryDirectory={repositoryDirectory}
            repositoryDraft={repositoryDraft}
            repositoryInput={repositoryInput}
            repositoryInvalid={repositoryInvalid}
            repoSearch={repoSearch}
          />
        </div>
      ) : (
        <p className="mt-1 px-1 text-xs leading-5 text-muted-foreground">
          Your feedback board becomes the first source. Connect GitHub later from settings.
        </p>
      )}
    </div>
  );
}
