import { Megaphone } from "@/lib/icons";

import { EmptyModule } from "@/components/amend-dashboard-shared";
import type { DashboardChangelog } from "@/components/amend-dashboard-types";
import { formatDate, formatState } from "@/components/amend-dashboard-format";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";

export function ChangelogWorkspace({
  entries,
  onCreate,
  onOpen,
}: {
  entries: DashboardChangelog[];
  onCreate: () => void;
  onOpen: (entry: DashboardChangelog) => void;
}) {
  return (
    <DashboardWorkspaceSurface>
      <div
        className={
          entries.length > 0
            ? "grid divide-y divide-white/[0.045]"
            : "grid min-h-[calc(100svh-8.5rem)] place-items-center"
        }
      >
        {entries.map((entry) => (
          <button
            key={entry.stableKey}
            type="button"
            className="group grid w-full gap-5 px-5 py-5 text-left transition-colors duration-150 ease-linear hover:bg-foreground/[0.04] active:opacity-75 md:grid-cols-[18rem_minmax(0,1fr)_8rem] md:items-center md:px-6"
            onClick={() => onOpen(entry)}
          >
            <div className="grid aspect-[16/9] place-items-center rounded-xl bg-background/70 text-sm font-semibold text-muted-foreground ring-1 ring-white/[0.04]">
              No featured image
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold">{entry.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {entry.summary}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-lg bg-background/80 px-2.5 py-1 ring-1 ring-white/[0.04]">
                  {formatState(entry.category)}
                </span>
                <span className="rounded-lg bg-background/80 px-2.5 py-1 ring-1 ring-white/[0.04]">
                  {entry.publishedAt ? formatDate(entry.publishedAt) : formatDate(entry.updatedAt)}
                </span>
              </div>
            </div>
            <span className="h-fit w-fit rounded-lg bg-background/80 px-2.5 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-white/[0.04] md:justify-self-end">
              {formatState(entry.status)}
            </span>
          </button>
        ))}
        {entries.length === 0 ? (
          <div className="w-full">
            <EmptyModule
              action="Write changelog"
              copy="Use this when a shipped update needs review, targeting, and subscriber delivery."
              icon={<Megaphone />}
              onAction={onCreate}
              title="Publish the first reviewed update"
            />
          </div>
        ) : null}
      </div>
    </DashboardWorkspaceSurface>
  );
}
