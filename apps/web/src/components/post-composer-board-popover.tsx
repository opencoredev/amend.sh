import { cn } from "@amend/ui/lib/utils";
import {
  AlertCircle,
  Check,
  Lightbulb,
  type LucideIcon,
  Megaphone,
  MessageSquare,
  Plus,
} from "@/lib/icons";

import { boardItems } from "./post-composer-model";
import type { BoardItem } from "./post-composer-model";
import { Popover, SearchRow } from "./post-composer-popover-primitives";

const BOARD_ICON: Record<BoardItem, LucideIcon> = {
  "Feature Request": Lightbulb,
  "Bug Report": AlertCircle,
  Changelog: Megaphone,
  "Customer Feedback": MessageSquare,
};

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
        {boardItems.map((item) => {
          const Icon = BOARD_ICON[item];
          return (
            <button
              type="button"
              key={item}
              className={cn(
                "flex h-9 items-center justify-between rounded-lg px-2.5 text-sm font-semibold text-muted-foreground transition-colors duration-150 ease-linear hover:bg-foreground/[0.06] hover:text-foreground active:opacity-75",
                item === selected && "bg-foreground/[0.08] text-foreground",
              )}
              onClick={() => onSelect(item)}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="size-4 shrink-0" />
                {item}
              </span>
              {item === selected ? <Check className="size-4" /> : null}
            </button>
          );
        })}
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
