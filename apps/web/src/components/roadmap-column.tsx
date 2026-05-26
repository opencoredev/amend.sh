import { cn } from "@amend/ui/lib/utils";
import { Inbox, Plus } from "lucide-react";

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
        "flex min-h-40 min-w-0 flex-col border border-border bg-background/60 transition-[background-color,border-color] duration-150 md:min-h-[calc(100svh-8rem)]",
        isDropTarget && "border-foreground/60 bg-muted/20",
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
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-3">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          {meta.icon}
          {meta.label}
        </span>
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-full bg-muted text-xs text-muted-foreground tabular-nums">
            {cards.length}
          </span>
          <button
            type="button"
            aria-label={`Add to ${meta.label}`}
            className="grid size-7 place-items-center rounded-full border border-border text-muted-foreground transition-[border-color,color,scale] duration-200 hover:border-foreground hover:text-foreground active:scale-[0.96]"
            onClick={() => onAdd(columnStatus)}
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="grid content-start gap-2 overflow-y-auto p-2.5">
        {cards.length > 0 ? (
          cards.map((entry) => (
            <RoadmapCard
              key={entry.recordId ?? entry.stableKey}
              dragging={draggingKey === entry.stableKey}
              item={entry}
              onDragEnd={onDragEnd}
              onDragStart={onDragStart}
              onOpenItem={onOpenItem}
              onVote={onVote}
            />
          ))
        ) : (
          <div
            className={cn(
              "grid min-h-40 place-items-center border border-dashed border-transparent text-center text-sm text-muted-foreground transition-[border-color,background-color]",
              isDropTarget && "border-border bg-muted/10",
            )}
          >
            <div className="text-wrap-balance">
              <Inbox className="mx-auto size-7 opacity-50" />
              <p className="mt-2">No {meta.label.toLowerCase()} posts</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
