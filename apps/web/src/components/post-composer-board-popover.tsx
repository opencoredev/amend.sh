import { cn } from "@amend/ui/lib/utils";
import { Check, Lightbulb, Plus } from "lucide-react";

import { boardItems } from "./post-composer-model";
import type { BoardItem } from "./post-composer-model";
import { Popover, SearchRow } from "./post-composer-popover-primitives";

export function BoardPopover({
  onSelect,
  selected,
}: {
  onSelect: (item: BoardItem) => void;
  selected: BoardItem;
}) {
  return (
    <Popover className="left-0 top-[calc(100%+0.5rem)] w-64">
      <SearchRow placeholder="Search board..." />
      <div className="grid gap-1 p-1.5">
        {boardItems.map((item) => (
          <button
            type="button"
            key={item}
            className={cn(
              "flex h-10 items-center justify-between px-3 text-sm font-semibold text-muted-foreground transition-[background-color,color] hover:bg-muted hover:text-foreground",
              item === selected && "bg-muted text-foreground",
            )}
            onClick={() => onSelect(item)}
          >
            <span className="flex items-center gap-2">
              {item === "Feature Request" ? (
                <Lightbulb className="size-4" />
              ) : (
                <span className="size-2 bg-muted-foreground" />
              )}
              {item}
            </span>
            {item === selected ? <Check className="size-4" /> : null}
          </button>
        ))}
      </div>
      <div className="border-t border-border p-1.5">
        <button
          type="button"
          className="flex h-10 w-full items-center gap-2 px-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Plus className="size-4" />
          Create new board
        </button>
      </div>
    </Popover>
  );
}
