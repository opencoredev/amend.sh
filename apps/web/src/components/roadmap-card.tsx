import { cn } from "@amend/ui/lib/utils";
import { ChevronDown, Sparkles } from "lucide-react";
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
        "group cursor-grab border border-border bg-card p-3 transition-[background-color,border-color,opacity,transform] duration-150 hover:-translate-y-0.5 hover:border-foreground/50 hover:bg-muted/25 active:cursor-grabbing",
        dragging && "opacity-45",
      )}
      draggable
      onDragEnd={onDragEnd}
      onDragStart={(event) => onDragStart(item.stableKey, event)}
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          className="min-w-0 text-left text-sm font-semibold leading-5 transition-[color,scale] duration-200 hover:text-foreground active:scale-[0.99]"
          onClick={() => onOpenItem(item)}
        >
          {item.title}
        </button>
        <button
          type="button"
          className="flex h-7 shrink-0 items-center gap-1.5 border border-border px-2 text-xs text-muted-foreground tabular-nums transition-[border-color,color,scale] hover:border-foreground hover:text-foreground active:scale-[0.96]"
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
        <span className="inline-flex items-center gap-2 border border-border bg-muted/25 px-2 py-1">
          <Sparkles className="size-3" />
          {priorityLabel(item.priority)}
        </span>
        {item.target ? (
          <span className="border border-border bg-muted/25 px-2 py-1">{item.target}</span>
        ) : null}
        <span className="w-full min-w-0 truncate sm:w-auto">
          {primarySource?.title ?? "No linked evidence"}
        </span>
      </div>
    </article>
  );
}
