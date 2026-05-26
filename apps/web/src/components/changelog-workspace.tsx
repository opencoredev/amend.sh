import { Megaphone } from "lucide-react";

import { EmptyModule } from "@/components/amend-dashboard-shared";
import type { DashboardChangelog } from "@/components/amend-dashboard-types";
import { formatDate, formatState } from "@/components/amend-dashboard-utils";

export function ChangelogWorkspace({
  entries,
  onOpen,
}: {
  entries: DashboardChangelog[];
  onOpen: (entry: DashboardChangelog) => void;
}) {
  return (
    <div className="t-panel-slide min-h-[calc(100svh-5.5rem)] bg-card/40" data-open="true">
      <div className="divide-y divide-border border-b border-border">
        {entries.map((entry) => (
          <button
            key={entry.stableKey}
            type="button"
            className="group grid w-full gap-4 px-4 py-5 text-left transition-[background-color] duration-150 hover:bg-muted/20 active:scale-[0.995] md:grid-cols-[18rem_minmax(0,1fr)_8rem] md:items-center md:px-6"
            onClick={() => onOpen(entry)}
          >
            <div className="grid aspect-[16/9] place-items-center rounded-lg border border-border bg-muted/25 text-sm font-semibold text-muted-foreground">
              No featured image
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold">{entry.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {entry.summary}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span className="rounded-md border border-border bg-muted/25 px-2 py-1">
                  {formatState(entry.category)}
                </span>
                <span className="rounded-md border border-border bg-muted/25 px-2 py-1">
                  {entry.publishedAt ? formatDate(entry.publishedAt) : formatDate(entry.updatedAt)}
                </span>
              </div>
            </div>
            <span className="h-fit w-fit rounded-full border border-border bg-muted/25 px-3 py-1 text-xs font-semibold text-muted-foreground md:justify-self-end">
              {formatState(entry.status)}
            </span>
          </button>
        ))}
        {entries.length === 0 ? (
          <EmptyModule
            copy="Use this when a shipped update needs review, targeting, and subscriber delivery."
            icon={<Megaphone />}
            title="Publish the first reviewed update"
          />
        ) : null}
      </div>
    </div>
  );
}
