import { cn } from "@amend/ui/lib/utils";
import { useDroppable } from "@dnd-kit/core";

import { Inbox, Plus } from "@/lib/icons";

import { statusMeta } from "@/components/amend-dashboard-status";
import type { DashboardRoadmap, RoadmapStatus } from "@/components/amend-dashboard-types";
import { RoadmapCard } from "@/components/roadmap-card";

// Per-status icon tint so the four lanes are distinguishable at a glance —
// mirrors the hues used by the StatusPill elsewhere in the product.
const STATUS_TONE: Record<RoadmapStatus, string> = {
  backlog: "text-amber-400",
  next: "text-blue-400",
  progress: "text-violet-400",
  done: "text-emerald-400",
};

export function RoadmapColumn({
  cards,
  columnStatus,
  onAdd,
  onOpenItem,
  onVote,
}: {
  cards: DashboardRoadmap[];
  columnStatus: RoadmapStatus;
  onAdd: (status: RoadmapStatus) => void;
  onOpenItem: (item: DashboardRoadmap) => void;
  onVote: (item: DashboardRoadmap) => Promise<unknown>;
}) {
  const meta = statusMeta[columnStatus];
  const { isOver, setNodeRef } = useDroppable({ id: columnStatus });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex h-full min-w-0 flex-col rounded-xl transition-colors duration-150 ease-linear",
        isOver && "bg-foreground/[0.035] ring-1 ring-inset ring-white/[0.06]",
      )}
    >
      <div className="flex min-h-10 items-center justify-between gap-3 px-1">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-foreground/80">
          <span className={cn("[&_svg]:size-4", STATUS_TONE[columnStatus])}>{meta.icon}</span>
          {meta.label}
        </span>
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs tabular-nums text-muted-foreground/60">
            {cards.length}
          </span>
          <button
            type="button"
            aria-label={`Add to ${meta.label}`}
            className="grid size-6 place-items-center rounded-md text-muted-foreground/70 transition-colors duration-150 ease-linear hover:bg-foreground/[0.06] hover:text-foreground active:opacity-75"
            onClick={() => onAdd(columnStatus)}
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-1 pt-1.5">
        {cards.length > 0 ? (
          <div className="grid gap-2">
            {cards.map((entry) => (
              <RoadmapCard
                key={entry.recordId ?? entry.stableKey}
                item={entry}
                onOpenItem={onOpenItem}
                onVote={onVote}
                status={columnStatus}
              />
            ))}
          </div>
        ) : (
          <div className="grid min-h-28 place-items-center text-center">
            <div>
              <Inbox className="mx-auto size-5 text-muted-foreground/25" />
              <p className="mt-2 text-xs text-muted-foreground/45">
                No {meta.label.toLowerCase()} posts
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
