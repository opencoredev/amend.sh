import { cn } from "@amend/ui/lib/utils";
import { Check, Lightbulb, Plus } from "@/lib/icons";

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
              "flex h-9 items-center justify-between rounded-lg px-2.5 text-sm font-semibold text-muted-foreground transition-colors duration-150 ease-linear hover:bg-foreground/[0.06] hover:text-foreground active:opacity-75",
              item === selected && "bg-foreground/[0.08] text-foreground",
            )}
            onClick={() => onSelect(item)}
          >
            <span className="flex items-center gap-2">
              {item === "Feature Request" ? (
                <Lightbulb className="size-4" />
              ) : (
                <span className="size-1.5 rounded-full bg-muted-foreground" />
              )}
              {item}
            </span>
            {item === selected ? <Check className="size-4" /> : null}
          </button>
        ))}
      </div>
      <div className="border-t border-white/[0.06] p-1.5">
        <button
          type="button"
          className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-sm font-semibold text-muted-foreground transition-colors duration-150 ease-linear hover:bg-foreground/[0.06] hover:text-foreground active:opacity-75"
        >
          <Plus className="size-4" />
          Create new board
        </button>
      </div>
    </Popover>
  );
}
