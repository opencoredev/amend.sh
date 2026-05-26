import { cn } from "@amend/ui/lib/utils";

import type {
  GitHubInstallationAccount,
  GitHubInstallationDirectory,
  GitHubInstalledRepository,
  RepositoryDraft,
} from "@/components/amend-dashboard-types";
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
    <div className="grid gap-3">
      <div>
        <span className="text-xs font-semibold text-muted-foreground">First source</span>
        <div className="mt-2 grid grid-cols-2 border border-border">
          {[
            ["github", "GitHub repo"],
            ["feedback", "Feedback board"],
          ].map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              className={cn(
                "h-10 text-sm font-semibold transition-[background-color,color]",
                connectionMode === mode
                  ? "bg-foreground text-background"
                  : "bg-background text-muted-foreground hover:text-foreground",
              )}
              onClick={() => onConnectionModeChange(mode as "feedback" | "github")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {connectionMode === "github" ? (
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
      ) : (
        <div className="border border-border bg-muted/20 p-3 text-xs leading-5 text-muted-foreground">
          Feedback board will be the required first source. You can connect GitHub later from setup.
        </div>
      )}
    </div>
  );
}
