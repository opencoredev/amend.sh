import { cn } from "@amend/ui/lib/utils";
import { ChevronRight, Lightbulb, X } from "lucide-react";
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
    <header className="relative z-20 flex items-center justify-between gap-3 px-4 pt-4">
      <div className="relative flex min-w-0 items-center gap-3">
        <div className="grid size-8 shrink-0 place-items-center border border-border bg-muted text-xs font-semibold text-foreground">
          L
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        <div
          className="relative"
          ref={panel === "board" ? panelRef : null}
          data-composer-panel-root
        >
          <button
            type="button"
            className={cn(
              "flex h-8 items-center gap-2 border border-border bg-muted px-3 text-xs font-semibold text-muted-foreground transition-colors duration-150 ease-linear",
              panel === "board" && "border-foreground bg-foreground text-background",
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
        className="grid size-8 place-items-center text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        onClick={onClose}
      >
        <X className="size-5" />
      </button>
    </header>
  );
}
