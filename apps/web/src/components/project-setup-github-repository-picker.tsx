import { cn } from "@amend/ui/lib/utils";
import { ExternalLink } from "@/lib/icons";

import type {
  GitHubInstallationAccount,
  GitHubInstallationDirectory,
  GitHubInstalledRepository,
  RepositoryDraft,
} from "@/components/amend-dashboard-types";
import { RepositoryDirectoryList } from "@/components/project-setup-repository-directory-list";
import {
  SettingsInput,
  settingsSecondaryButtonClass,
} from "@/components/settings-workspace-panel-primitives";

const surfaceClass = "rounded-xl bg-[#151518] ring-1 ring-white/[0.055] ring-inset";
const labelClass = "text-xs font-medium text-muted-foreground";

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
      <div className={cn(surfaceClass, "p-3.5")}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">GitHub App</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {directoryLoading
                ? "Refreshing organizations…"
                : repositoryCount > 0
                  ? `${repositoryCount} repositories across ${directory?.accounts.length ?? 0} accounts.`
                  : "Install the app, then choose a repository."}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {installUrl ? (
              <button
                type="button"
                className={settingsSecondaryButtonClass}
                onClick={() => window.open(installUrl, "_blank", "noopener,noreferrer")}
              >
                <ExternalLink />
                Install
              </button>
            ) : null}
            <button
              type="button"
              className={settingsSecondaryButtonClass}
              disabled={directoryLoading}
              onClick={onLoadDirectory}
            >
              Refresh
            </button>
          </div>
        </div>
        {directoryUnavailable ? (
          <p className="mt-3 border-t border-white/[0.06] pt-3 text-xs leading-5 text-muted-foreground">
            {directoryUnavailable}
          </p>
        ) : null}
      </div>

      <label className="grid gap-2">
        <span className={labelClass}>Search repositories</span>
        <SettingsInput
          placeholder="org, repo, or description"
          value={repoSearch}
          onChange={(event) => onRepositorySearchChange(event.target.value)}
        />
      </label>

      <div className={cn(surfaceClass, "max-h-56 overflow-auto")}>
        <RepositoryDirectoryList
          directory={directory}
          directoryLoading={directoryLoading}
          onSelectRepository={onSelectRepository}
          repositoryDirectory={repositoryDirectory}
          repositoryInput={repositoryInput}
        />
      </div>

      <label className="grid gap-2">
        <span className={labelClass}>Or paste a repository</span>
        <SettingsInput
          placeholder="owner/repo"
          value={repositoryInput}
          onChange={(event) => onRepositoryInputChange(event.target.value)}
        />
        <span
          className={cn(
            "min-h-4 text-xs leading-5 text-muted-foreground",
            repositoryInvalid && "text-foreground",
          )}
        >
          {repositoryInvalid
            ? "Use a GitHub owner/repo path or repository URL."
            : repositoryDraft
              ? `Will connect ${repositoryDraft.owner}/${repositoryDraft.repo}.`
              : null}
        </span>
      </label>
    </div>
  );
}
