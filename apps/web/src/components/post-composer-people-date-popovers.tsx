import { cn } from "@amend/ui/lib/utils";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

import { dateRows } from "./post-composer-model";
import { Popover, SearchRow } from "./post-composer-popover-primitives";

export function AssigneePopover({
  onSelect,
  selected,
}: {
  onSelect: (item: string) => void;
  selected: string | null;
}) {
  return (
    <Popover className="right-0 top-[calc(100%+0.5rem)] w-56">
      <SearchRow placeholder="Search assignee..." />
      <div className="p-1.5">
        <button
          type="button"
          className={cn(
            "flex h-11 w-full items-center justify-between px-3 text-sm font-semibold text-muted-foreground transition-[background-color,color] hover:bg-muted hover:text-foreground",
            selected === "Leo" && "bg-muted text-foreground",
          )}
          onClick={() => onSelect("Leo")}
        >
          <span className="flex items-center gap-3">
            <span className="grid size-7 place-items-center bg-muted text-xs text-foreground">
              L
            </span>
            Leo
          </span>
          {selected === "Leo" ? <Check className="size-4" /> : null}
        </button>
      </div>
    </Popover>
  );
}

export function DatePopover({
  onSelect,
  selected,
}: {
  onSelect: (item: string) => void;
  selected: string | null;
}) {
  return (
    <Popover className="bottom-[calc(100%+0.5rem)] right-0 w-64">
      <div className="grid grid-cols-4 gap-1.5 border-b border-border p-2">
        {["Q2'26", "Q3'26", "Q4'26", "Q1'27"].map((quarter) => (
          <button
            key={quarter}
            type="button"
            className="h-7 bg-muted text-[0.68rem] font-semibold text-muted-foreground transition-[background-color,color] hover:bg-accent hover:text-foreground"
            onClick={() => onSelect(quarter)}
          >
            {quarter}
          </button>
        ))}
      </div>
      <div className="p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous month"
            className="grid size-7 place-items-center bg-muted text-muted-foreground hover:bg-foreground hover:text-background"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="text-sm font-semibold text-muted-foreground">May 2026</p>
          <button
            type="button"
            aria-label="Next month"
            className="grid size-7 place-items-center bg-muted text-muted-foreground hover:bg-foreground hover:text-background"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center text-sm">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <span key={day} className="py-1.5 text-xs font-semibold text-muted-foreground">
              {day}
            </span>
          ))}
          {dateRows.flat().map((day, index) => {
            const isCurrentMonth = index >= 5 && index <= 35;
            const isSelected =
              isCurrentMonth && (selected === `May ${day}` || (!selected && index === 16));

            return (
              <button
                type="button"
                key={`${day}-${index}`}
                disabled={!isCurrentMonth}
                className={cn(
                  "grid aspect-square place-items-center text-xs font-semibold text-muted-foreground transition-[background-color,color] hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-35",
                  isSelected &&
                    "bg-foreground text-background hover:bg-foreground hover:text-background",
                )}
                onClick={() => onSelect(`May ${day}`)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </Popover>
  );
}
