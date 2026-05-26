import { cn } from "@amend/ui/lib/utils";
import { Check } from "lucide-react";

import { statusItems, tagItems } from "./post-composer-model";
import type { StatusItem, TagItem } from "./post-composer-model";
import { Popover, SearchRow } from "./post-composer-popover-primitives";

export function StatusPopover({
  onSelect,
  selected,
}: {
  onSelect: (item: StatusItem) => void;
  selected: StatusItem;
}) {
  return (
    <Popover className="left-0 top-[calc(100%+0.5rem)] w-60">
      <SearchRow placeholder="Search status..." />
      <div className="grid gap-1 p-1.5">
        {statusItems.map(([item, dot]) => (
          <button
            type="button"
            key={item}
            className={cn(
              "flex h-10 items-center justify-between px-3 text-sm font-semibold text-muted-foreground transition-[background-color,color] hover:bg-muted hover:text-foreground",
              item === selected && "bg-muted text-foreground",
            )}
            onClick={() => onSelect(item)}
          >
            <span className="flex items-center gap-3">
              <span className={cn("size-1.5", dot)} />
              {item}
            </span>
            {item === selected ? <Check className="size-4" /> : null}
          </button>
        ))}
      </div>
    </Popover>
  );
}

export function TagPopover({
  onSelect,
  selected,
}: {
  onSelect: (item: TagItem) => void;
  selected: TagItem | null;
}) {
  return (
    <Popover className="left-0 top-[calc(100%+0.5rem)] w-60">
      <SearchRow placeholder="Search tag..." />
      <p className="border-y border-border bg-muted px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Public tags
      </p>
      <div className="grid gap-1 p-1.5">
        {tagItems.map(([item, dot]) => (
          <button
            type="button"
            key={item}
            className={cn(
              "flex h-10 items-center justify-between px-3 text-sm font-semibold text-muted-foreground transition-[background-color,color] hover:bg-muted hover:text-foreground",
              item === selected && "bg-muted text-foreground",
            )}
            onClick={() => onSelect(item)}
          >
            <span className="flex items-center gap-3">
              <span className={cn("size-1.5", dot)} />
              {item}
            </span>
            {item === selected ? <Check className="size-4" /> : null}
          </button>
        ))}
      </div>
    </Popover>
  );
}
