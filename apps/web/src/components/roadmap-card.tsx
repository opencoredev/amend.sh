import { cn } from "@amend/ui/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import { Link2, Megaphone, MessageSquare } from "@/lib/icons";

import type { DashboardRoadmap, RoadmapStatus } from "@/components/amend-dashboard-types";
import {
  roadmapStatusToRoadmapStatus,
  sourceFeedbackKey,
} from "@/components/amend-dashboard-utils";
import { VoteButton } from "@/components/vote-button";

// Sits a clear step above the workspace surface (#151518) so cards read as
// distinct objects now that the columns are background-less lanes.
const CARD_CHROME =
  "rounded-xl bg-[#1f1f24] px-3 py-2.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] ring-1 ring-white/[0.07]";

function MetaDot() {
  return (
    <span aria-hidden className="text-muted-foreground/35">
      ·
    </span>
  );
}

/**
 * The visual contents of a roadmap card — shared by the interactive card in a
 * column and the floating clone rendered in the dnd-kit `DragOverlay`. Carries
 * no drag/click wiring of its own.
 *
 * Kept deliberately compact: title leads with a small inline vote chip, status
 * lives in the column header (so it is absent here), and the single meta line
 * leads with the feedback link rather than an abstract priority label.
 */
function RoadmapCardBody({
  item,
  onVote,
}: {
  item: DashboardRoadmap;
  onVote: (item: DashboardRoadmap) => Promise<unknown>;
}) {
  const blurb = item.description || item.impact;
  const feedbackKey = sourceFeedbackKey(item);
  const primarySource = item.sourceLinks[0];
  const shippedCount =
    roadmapStatusToRoadmapStatus(item.status) === "done" ? item.changelogCount : 0;
  const hasMeta = Boolean(feedbackKey || primarySource || item.target || shippedCount > 0);

  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 min-w-0 text-pretty text-sm font-medium leading-snug text-foreground/90 transition-colors duration-150 ease-linear group-hover:text-foreground">
          {item.title}
        </h3>
        {/* Stop pointer-down here so pressing the upvote never starts a card drag. */}
        <div className="shrink-0" onPointerDown={(event) => event.stopPropagation()}>
          <VoteButton
            count={item.feedbackCount}
            voted={item.viewerHasVoted ?? false}
            onVote={() => onVote(item)}
            title={item.title}
            orientation="horizontal"
          />
        </div>
      </div>

      {blurb ? (
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{blurb}</p>
      ) : null}

      {hasMeta ? (
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {feedbackKey ? (
            <span className="inline-flex items-center gap-1.5 text-foreground/70">
              <MessageSquare className="size-3 shrink-0" />
              From feedback
            </span>
          ) : primarySource ? (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Link2 className="size-3 shrink-0" />
              <span className="truncate">{primarySource.title ?? "Linked source"}</span>
            </span>
          ) : null}
          {item.target ? (
            <>
              <MetaDot />
              <span className="min-w-0 truncate">{item.target}</span>
            </>
          ) : null}
          {shippedCount > 0 ? (
            <>
              <MetaDot />
              <span
                className="inline-flex items-center gap-1 tabular-nums"
                aria-label={`Shipped in ${shippedCount} changelog ${shippedCount === 1 ? "update" : "updates"}`}
              >
                <Megaphone className="size-3 shrink-0" />
                {shippedCount}
              </span>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Floating clone rendered inside the dnd-kit `DragOverlay` while dragging — a
 * plain lifted card (just depth from the shadow, no tilt). It's portaled to
 * `<body>`, so the shadow never clips against the column's scroll container.
 */
export function RoadmapCardOverlay({ item }: { item: DashboardRoadmap }) {
  return (
    <div
      className={cn(
        "w-full cursor-grabbing",
        CARD_CHROME,
        "bg-[#26262c] shadow-2xl shadow-black/50 ring-white/[0.16]",
      )}
    >
      <RoadmapCardBody item={item} onVote={() => Promise.resolve()} />
    </div>
  );
}

export function RoadmapCard({
  item,
  onOpenItem,
  onVote,
  status,
}: {
  item: DashboardRoadmap;
  onOpenItem: (item: DashboardRoadmap) => void;
  onVote: (item: DashboardRoadmap) => Promise<unknown>;
  status: RoadmapStatus;
}) {
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    id: item.stableKey,
    data: { item, status },
  });

  function handleKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenItem(item);
    }
  }

  return (
    <article
      ref={setNodeRef}
      aria-label={`Open ${item.title}`}
      onClick={() => onOpenItem(item)}
      onKeyDown={handleKeyDown}
      {...attributes}
      {...listeners}
      className={cn(
        "group w-full cursor-grab select-none text-left outline-none",
        CARD_CHROME,
        // Hover is just a clean surface lighten — no ring outline (a hairline
        // appearing reads as noise) and no shadow/lift (those overflow the
        // column's scroll container and clip). Inset focus ring is clip-safe.
        "transition-[background-color,box-shadow,opacity] duration-150 ease-out hover:bg-[#26262c] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amend-warm/70",
        // Fully hidden in place while its clone is carried by the DragOverlay,
        // so the eye only tracks the moving card (a dimmed, stationary ghost
        // reads as lag). The slot still holds layout.
        isDragging && "opacity-0",
      )}
    >
      <RoadmapCardBody item={item} onVote={onVote} />
    </article>
  );
}
