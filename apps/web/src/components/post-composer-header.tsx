import { cn } from "@amend/ui/lib/utils";
import { ChevronRight, Lightbulb, X } from "@/lib/icons";
import type { RefObject } from "react";

import type { BoardItem, ComposerPanel } from "./post-composer-model";
import { BoardPopover } from "./post-composer-popovers";

export function PostComposerHeader({
  board,
  onBoardSelect,
  onClose,
  onPanelToggle,
  panel,
  panelRef,
}: {
  board: BoardItem;
  onBoardSelect: (item: BoardItem) => void;
  onClose: () => void;
  onPanelToggle: (panel: Exclude<ComposerPanel, null>) => void;
  panel: ComposerPanel;
  panelRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <header className="relative z-20 flex items-center justify-between gap-3 px-5 pt-5">
      <div className="relative flex min-w-0 items-center gap-2.5">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-background/70 text-xs font-semibold text-foreground ring-1 ring-white/[0.06]">
          L
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground/70" />
        <div
          className="relative"
          ref={panel === "board" ? panelRef : null}
          data-composer-panel-root
        >
          <button
            type="button"
            className={cn(
              "flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-semibold transition-colors duration-150 ease-linear active:opacity-75",
              panel === "board"
                ? "bg-accent text-foreground ring-1 ring-white/[0.09]"
                : "bg-amend-inset text-muted-foreground ring-1 ring-white/[0.055] hover:bg-[#1a1a1d] hover:text-foreground",
            )}
            onClick={() => onPanelToggle("board")}
          >
            <Lightbulb className="size-4" />
            {board}
          </button>
          {panel === "board" ? (
            <BoardPopover
              selected={board}
              onSelect={(item) => {
                onBoardSelect(item);
              }}
            />
          ) : null}
        </div>
      </div>

      <button
        type="button"
        aria-label="Close composer"
        className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors duration-150 ease-linear hover:bg-white/[0.06] hover:text-foreground active:opacity-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
        onClick={onClose}
      >
        <X className="size-5" />
      </button>
    </header>
  );
}
