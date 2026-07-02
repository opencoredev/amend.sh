import { cn } from "@amend/ui/lib/utils";
import {
  Check,
  Circle,
  CircleCheckBig,
  CircleDashed,
  Loader2,
  type LucideIcon,
  Tag,
  X,
} from "@/lib/icons";

import { statusItems, tagItems } from "./post-composer-model";
import type { StatusItem, TagItem } from "./post-composer-model";
import { Popover, SearchRow } from "./post-composer-popover-primitives";

// One glyph per status, shaped to read as a progression (open → working → done →
// closed). Shared with the footer trigger via statusIcon so the selected status
// shows the same icon there as in the picker.
const STATUS_ICON: Record<StatusItem, LucideIcon> = {
  "In Review": CircleDashed,
  Planned: Circle,
  "In Progress": Loader2,
  Completed: CircleCheckBig,
  Rejected: X,
};

export function statusIcon(status: StatusItem): LucideIcon {
  return STATUS_ICON[status];
}

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
        {statusItems.map((item) => {
          const Icon = STATUS_ICON[item];
          const isSelected = item === selected;
          return (
            <button
              type="button"
              key={item}
              className={cn(
                "flex h-9 items-center justify-between rounded-lg px-2.5 text-sm font-semibold text-muted-foreground transition-colors duration-150 ease-linear hover:bg-foreground/[0.06] hover:text-foreground active:opacity-75",
                isSelected && "bg-foreground/[0.08] text-foreground",
              )}
              onClick={() => onSelect(item)}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="size-4 shrink-0" />
                {item}
              </span>
              {isSelected ? <Check className="size-4" /> : null}
            </button>
          );
        })}
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
      <p className="border-y border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Public tags
      </p>
      <div className="grid gap-1 p-1.5">
        {tagItems.map((item) => {
          const isSelected = item === selected;
          return (
            <button
              type="button"
              key={item}
              className={cn(
                "flex h-9 items-center justify-between rounded-lg px-2.5 text-sm font-semibold text-muted-foreground transition-colors duration-150 ease-linear hover:bg-foreground/[0.06] hover:text-foreground active:opacity-75",
                isSelected && "bg-foreground/[0.08] text-foreground",
              )}
              onClick={() => onSelect(item)}
            >
              <span className="flex items-center gap-2.5">
                <Tag className="size-4 shrink-0" />
                {item}
              </span>
              {isSelected ? <Check className="size-4" /> : null}
            </button>
          );
        })}
      </div>
    </Popover>
  );
}
