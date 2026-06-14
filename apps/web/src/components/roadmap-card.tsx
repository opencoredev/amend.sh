import { cn } from "@amend/ui/lib/utils";
import { ChevronDown, Sparkles } from "@/lib/icons";
import { useState } from "react";
import type { DragEvent as ReactDragEvent } from "react";

import type { DashboardRoadmap } from "@/components/amend-dashboard-types";
import { priorityLabel } from "@/components/amend-dashboard-utils";
import { errorMessage, toast } from "@/lib/toast";

export type RoadmapCardDragStart = (stableKey: string, event: ReactDragEvent<HTMLElement>) => void;

export function RoadmapCard({
  dragging,
  item,
  onDragEnd,
  onDragStart,
  onOpenItem,
  onVote,
}: {
  dragging: boolean;
  item: DashboardRoadmap;
  onDragEnd: () => void;
  onDragStart: RoadmapCardDragStart;
  onOpenItem: (item: DashboardRoadmap) => void;
  onVote: (item: DashboardRoadmap) => Promise<unknown>;
}) {
  const primarySource = item.sourceLinks[0];
  const [voting, setVoting] = useState(false);

  return (
    <article
      className={cn(
        "t-resize group cursor-grab rounded-xl bg-[#151518] p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.035)] ring-1 ring-white/[0.045] transition-[background-color,opacity] duration-150 ease-linear hover:bg-[#1a1a1d] active:cursor-grabbing",
        dragging && "opacity-45",
      )}
      draggable
      onDragEnd={onDragEnd}
      onDragStart={(event) => onDragStart(item.stableKey, event)}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          className="min-w-0 text-left text-sm font-semibold leading-5 transition-colors duration-150 ease-linear hover:text-foreground active:opacity-75"
          onClick={() => onOpenItem(item)}
        >
          {item.title}
        </button>
        <button
          type="button"
          className="flex h-7 shrink-0 items-center gap-1.5 rounded-lg bg-background/70 px-2 text-xs text-muted-foreground tabular-nums ring-1 ring-white/[0.04] transition-colors duration-150 ease-linear hover:bg-foreground/[0.06] hover:text-foreground active:opacity-75"
          disabled={voting}
          aria-label={`Upvote ${item.title}`}
          onClick={(event) => {
            event.stopPropagation();
            setVoting(true);
            void onVote(item)
              .catch((error: unknown) =>
                toast.error({
                  title: "Vote was not saved",
                  description: errorMessage(
                    error,
                    "The roadmap vote could not be saved. Refresh the project and try again.",
                  ),
                }),
              )
              .finally(() => setVoting(false));
          }}
        >
          <ChevronDown className="size-3 rotate-180" />
          {item.feedbackCount}
        </button>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
        {item.description || item.impact || "No description yet."}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2 rounded-lg bg-background/70 px-2 py-1 ring-1 ring-white/[0.04]">
          <Sparkles className="size-3" />
          {priorityLabel(item.priority)}
        </span>
        {item.target ? (
          <span className="rounded-lg bg-background/70 px-2 py-1 ring-1 ring-white/[0.04]">
            {item.target}
          </span>
        ) : null}
        <span className="w-full min-w-0 truncate sm:w-auto">
          {primarySource?.title ?? "No linked evidence"}
        </span>
      </div>
    </article>
  );
}
