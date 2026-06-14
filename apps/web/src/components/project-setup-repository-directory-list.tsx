import { cn } from "@amend/ui/lib/utils";
import { Users } from "@/lib/icons";

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
      <div className="grid min-h-28 place-items-center px-3 text-xs text-muted-foreground">
        Loading GitHub installs...
      </div>
    );
  }

  if (repositoryDirectory.length === 0) {
    return (
      <div className="grid min-h-28 place-items-center px-3 text-center text-xs leading-5 text-muted-foreground">
        {directory
          ? "No installed repositories matched. Install another organization or paste a repo below."
          : "Refresh after installing the GitHub App."}
      </div>
    );
  }

  return repositoryDirectory.map((account) => (
    <div key={account.id} className="border-b border-border last:border-b-0">
      <div className="flex items-center justify-between gap-3 bg-muted/20 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          {account.avatarUrl ? (
            <img alt="" className="size-6 shrink-0 border border-border" src={account.avatarUrl} />
          ) : (
            <span className="grid size-6 shrink-0 place-items-center border border-border">
              <Users className="size-3.5 text-muted-foreground" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{account.login}</p>
            <p className="truncate text-[11px] text-muted-foreground">{account.type}</p>
          </div>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {account.repositories.length} repos
        </span>
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
        <p className="border-t border-border px-3 py-3 text-xs text-muted-foreground">
          No repositories matched this search.
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
        "grid w-full grid-cols-[1fr_auto] items-center gap-3 border-t border-border px-3 py-2 text-left transition-colors hover:bg-muted/40",
        selected && "bg-foreground text-background hover:bg-foreground",
      )}
      onClick={() => onSelectRepository(repository)}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{repository.fullName}</span>
        <span
          className={cn(
            "mt-0.5 block truncate text-xs text-muted-foreground",
            selected && "text-background/70",
          )}
        >
          {repository.description ?? `${repository.private ? "Private" : "Public"} repository`}
        </span>
      </span>
      <span
        className={cn(
          "shrink-0 border border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground",
          selected && "border-background/50 text-background",
        )}
      >
        {repository.private ? "private" : "public"}
      </span>
    </button>
  );
}
