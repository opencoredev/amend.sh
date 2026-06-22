import { cn } from "@amend/ui/lib/utils";
import { Check, Users } from "@/lib/icons";

import type {
  GitHubInstallationAccount,
  GitHubInstallationDirectory,
  GitHubInstalledRepository,
} from "@/components/amend-dashboard-types";

export function RepositoryDirectoryList({
  directory,
  directoryLoading,
  onSelectRepository,
  repositoryDirectory,
  repositoryInput,
}: {
  directory: GitHubInstallationDirectory | null;
  directoryLoading: boolean;
  onSelectRepository: (repository: GitHubInstalledRepository) => void;
  repositoryDirectory: GitHubInstallationAccount[];
  repositoryInput: string;
}) {
  if (directoryLoading && !directory) {
    return (
      <div className="grid min-h-24 place-items-center px-3 text-xs text-muted-foreground">
        Loading installs…
      </div>
    );
  }

  if (repositoryDirectory.length === 0) {
    return (
      <div className="grid min-h-24 place-items-center px-4 text-center text-xs leading-5 text-muted-foreground">
        {directory
          ? "No matching repositories. Install another org, or paste a repo above."
          : "Refresh after installing the GitHub App."}
      </div>
    );
  }

  return repositoryDirectory.map((account) => (
    <div key={account.id} className="border-b border-white/[0.06] last:border-b-0">
      <div className="flex items-center justify-between gap-3 bg-white/[0.025] px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          {account.avatarUrl ? (
            <img
              alt=""
              className="size-5 shrink-0 rounded-md ring-1 ring-white/[0.08] ring-inset"
              src={account.avatarUrl}
            />
          ) : (
            <span className="grid size-5 shrink-0 place-items-center rounded-md ring-1 ring-white/[0.08] ring-inset">
              <Users className="size-3 text-muted-foreground" />
            </span>
          )}
          <p className="truncate text-xs font-medium text-foreground">{account.login}</p>
        </div>
        <span className="text-[11px] text-muted-foreground">{account.repositories.length}</span>
      </div>
      {account.repositories.length > 0 ? (
        account.repositories.map((repository) => (
          <RepositoryOption
            key={repository.id}
            onSelectRepository={onSelectRepository}
            repository={repository}
            selected={repositoryInput.trim() === repository.fullName}
          />
        ))
      ) : (
        <p className="border-t border-white/[0.05] px-3 py-2.5 text-xs text-muted-foreground">
          No repositories matched.
        </p>
      )}
    </div>
  ));
}

function RepositoryOption({
  onSelectRepository,
  repository,
  selected,
}: {
  onSelectRepository: (repository: GitHubInstalledRepository) => void;
  repository: GitHubInstalledRepository;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 border-t border-white/[0.05] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.03]",
        selected && "bg-white/[0.05]",
      )}
      onClick={() => onSelectRepository(repository)}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {repository.fullName}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {repository.description ?? `${repository.private ? "Private" : "Public"} repository`}
        </span>
      </span>
      {selected ? (
        <Check className="size-4 shrink-0 text-amend-success" />
      ) : (
        <span className="text-[11px] text-muted-foreground">
          {repository.private ? "private" : "public"}
        </span>
      )}
    </button>
  );
}
