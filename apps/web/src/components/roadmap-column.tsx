import { cn } from "@amend/ui/lib/utils";
import { Inbox, Plus } from "@/lib/icons";

import { statusMeta } from "@/components/amend-dashboard-status";
import type { DashboardRoadmap, RoadmapStatus } from "@/components/amend-dashboard-types";
import { RoadmapCard } from "@/components/roadmap-card";
import type { RoadmapCardDragStart } from "@/components/roadmap-card";

export function RoadmapColumn({
  cards,
  columnStatus,
  draggingKey,
  isDropTarget,
  onAdd,
  onDragEnd,
  onDragStart,
  onDropItem,
  onDropStatusChange,
  onOpenItem,
  onVote,
}: {
  cards: DashboardRoadmap[];
  columnStatus: RoadmapStatus;
  draggingKey: string;
  isDropTarget: boolean;
  onAdd: (status: RoadmapStatus) => void;
  onDragEnd: () => void;
  onDragStart: RoadmapCardDragStart;
  onDropItem: (stableKey: string, status: RoadmapStatus) => void;
  onDropStatusChange: (status: RoadmapStatus | null) => void;
  onOpenItem: (item: DashboardRoadmap) => void;
  onVote: (item: DashboardRoadmap) => Promise<unknown>;
}) {
  const meta = statusMeta[columnStatus];

  return (
    <section
      className={cn(
        "flex h-full min-w-0 flex-col overflow-hidden rounded-xl bg-background/65 shadow-[inset_0_1px_0_rgb(255_255_255/0.03)] ring-1 ring-white/[0.04] transition-colors duration-150 ease-linear",
        isDropTarget && "bg-foreground/[0.055] ring-white/[0.09]",
      )}
      onDragEnter={(event) => {
        event.preventDefault();
        onDropStatusChange(columnStatus);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        onDropStatusChange(columnStatus);
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          onDropStatusChange(null);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDropStatusChange(null);
        onDropItem(event.dataTransfer.getData("text/plain") || draggingKey, columnStatus);
      }}
    >
      <div className="flex min-h-12 items-center justify-between gap-3 px-3.5">
        <span className="inline-flex items-center gap-2 text-xs font-semibold [&_svg]:size-3.5">
          {meta.icon}
          {meta.label}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {cards.length}
          </span>
          <button
            type="button"
            aria-label={`Add to ${meta.label}`}
            className="grid size-7 place-items-center rounded-lg bg-foreground/[0.04] text-muted-foreground transition-colors duration-150 ease-linear hover:bg-foreground/[0.075] hover:text-foreground active:opacity-75"
            onClick={() => onAdd(columnStatus)}
          >
            <Plus className="size-3" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 pt-0">
        {cards.length > 0 ? (
          <div className="grid gap-1.5">
            {cards.map((entry) => (
              <RoadmapCard
                key={entry.recordId ?? entry.stableKey}
                dragging={draggingKey === entry.stableKey}
                item={entry}
                onDragEnd={onDragEnd}
                onDragStart={onDragStart}
                onOpenItem={onOpenItem}
                onVote={onVote}
              />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "grid min-h-32 place-items-center rounded-lg text-center transition-colors duration-150",
              isDropTarget && "bg-accent/50",
            )}
          >
            <div>
              <Inbox className="mx-auto size-5 text-muted-foreground/30" />
              <p className="mt-2 text-xs text-muted-foreground/50">
                No {meta.label.toLowerCase()} posts
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
