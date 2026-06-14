import { Input } from "@amend/ui/components/input";
import { cn } from "@amend/ui/lib/utils";
import { ExternalLink, Search } from "@/lib/icons";

import type {
  GitHubInstallationAccount,
  GitHubInstallationDirectory,
  GitHubInstalledRepository,
  RepositoryDraft,
} from "@/components/amend-dashboard-types";
import { RepositoryDirectoryList } from "@/components/project-setup-repository-directory-list";

export function GitHubRepositoryPicker({
  directory,
  directoryError,
  directoryLoading,
  onLoadDirectory,
  onRepositoryInputChange,
  onRepositorySearchChange,
  onSelectRepository,
  repositoryCount,
  repositoryDirectory,
  repositoryDraft,
  repositoryInput,
  repositoryInvalid,
  repoSearch,
}: {
  directory: GitHubInstallationDirectory | null;
  directoryError: string | null;
  directoryLoading: boolean;
  onLoadDirectory: () => void;
  onRepositoryInputChange: (value: string) => void;
  onRepositorySearchChange: (value: string) => void;
  onSelectRepository: (repository: GitHubInstalledRepository) => void;
  repositoryCount: number;
  repositoryDirectory: GitHubInstallationAccount[];
  repositoryDraft: RepositoryDraft | null;
  repositoryInput: string;
  repositoryInvalid: boolean;
  repoSearch: string;
}) {
  const installUrl = directory?.installUrl;
  const directoryUnavailable = directoryError || directory?.error;

  return (
    <div className="grid gap-3">
      <div className="border border-border bg-muted/20 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">GitHub App repositories</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {directoryLoading
                ? "Refreshing installed organizations."
                : repositoryCount > 0
                  ? `${repositoryCount} repositories available across ${directory?.accounts.length ?? 0} accounts.`
                  : "Install the app in an organization, then choose a repository."}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {installUrl ? (
              <button
                type="button"
                className="inline-flex h-8 items-center gap-1.5 border border-border bg-background px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
                onClick={() => window.open(installUrl, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink className="size-3.5" />
                Install
              </button>
            ) : null}
            <button
              type="button"
              className="h-8 border border-border bg-background px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
              disabled={directoryLoading}
              onClick={onLoadDirectory}
            >
              Refresh
            </button>
          </div>
        </div>
        {directoryUnavailable ? (
          <p className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
            {directoryUnavailable}
          </p>
        ) : null}
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">Search repositories</span>
        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-10 bg-background pl-9 text-sm"
            onChange={(event) => onRepositorySearchChange(event.target.value)}
            placeholder="Search org, repo, description"
            value={repoSearch}
          />
        </div>
      </label>

      <div className="max-h-64 overflow-auto border border-border bg-background">
        <RepositoryDirectoryList
          directory={directory}
          directoryLoading={directoryLoading}
          onSelectRepository={onSelectRepository}
          repositoryDirectory={repositoryDirectory}
          repositoryInput={repositoryInput}
        />
      </div>

      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">
          Manual repository fallback
        </span>
        <Input
          className="mt-2 h-11 bg-background text-sm"
          onChange={(event) => onRepositoryInputChange(event.target.value)}
          placeholder="owner/repo or https://github.com/owner/repo"
          value={repositoryInput}
        />
        <span
          className={cn(
            "mt-2 block min-h-5 text-xs leading-5 text-muted-foreground",
            repositoryInvalid && "text-foreground",
          )}
        >
          {repositoryInvalid
            ? "Use a GitHub owner/repo path or repository URL."
            : repositoryDraft
              ? `Will connect ${repositoryDraft.owner}/${repositoryDraft.repo}.`
              : "Choose an installed repository, install another org, or start with Feedback board."}
        </span>
      </label>
    </div>
  );
}
