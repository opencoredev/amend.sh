import { Button } from "@amend/ui/components/button";
import { cn } from "@amend/ui/lib/utils";
import { CalendarDays, Radio, Tag, UserRound } from "@/lib/icons";
import type { RefObject } from "react";

import { FooterControl, IconControl } from "./post-composer-controls";
import type { ComposerPanel, StatusItem, TagItem } from "./post-composer-model";
import { AssigneePopover, DatePopover, StatusPopover, TagPopover } from "./post-composer-popovers";

export function PostComposerFooter({
  assignee,
  createMore,
  dueDate,
  onAssigneeSelect,
  onCreateMoreChange,
  onDateSelect,
  onPanelToggle,
  onStatusSelect,
  onSubmit,
  onTagSelect,
  panel,
  panelRef,
  status,
  submitting,
  tag,
}: {
  assignee: string | null;
  createMore: boolean;
  dueDate: string | null;
  onAssigneeSelect: (assignee: string | null) => void;
  onCreateMoreChange: (createMore: boolean) => void;
  onDateSelect: (date: string | null) => void;
  onPanelToggle: (panel: Exclude<ComposerPanel, null>) => void;
  onStatusSelect: (status: StatusItem) => void;
  onSubmit: () => void;
  onTagSelect: (tag: TagItem | null) => void;
  panel: ComposerPanel;
  panelRef: RefObject<HTMLDivElement | null>;
  status: StatusItem;
  submitting: boolean;
  tag: TagItem | null;
}) {
  return (
    <footer className="relative z-20 grid min-w-0 gap-3 border-t border-white/[0.06] px-5 py-3.5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="grid min-w-0 grid-cols-[minmax(8.5rem,1fr)_repeat(3,2.25rem)] gap-2 sm:flex sm:flex-wrap">
        <FooterControl
          active={panel === "status"}
          label={status}
          onClick={() => onPanelToggle("status")}
          popover={
            panel === "status" ? (
              <StatusPopover
                selected={status}
                onSelect={(item) => {
                  onStatusSelect(item);
                  onPanelToggle("status");
                }}
              />
            ) : null
          }
          panelRef={panel === "status" ? panelRef : undefined}
        >
          <Radio className="size-4" />
        </FooterControl>
        <IconControl
          active={panel === "tag"}
          label={tag ?? "Tags"}
          onClick={() => onPanelToggle("tag")}
          popover={
            panel === "tag" ? (
              <TagPopover
                selected={tag}
                onSelect={(item) => {
                  onTagSelect(item);
                  onPanelToggle("tag");
                }}
              />
            ) : null
          }
          panelRef={panel === "tag" ? panelRef : undefined}
        >
          <Tag />
        </IconControl>
        <IconControl
          active={panel === "assignee"}
          label={assignee ?? "Assignee"}
          onClick={() => onPanelToggle("assignee")}
          popover={
            panel === "assignee" ? (
              <AssigneePopover
                selected={assignee}
                onSelect={(item) => {
                  onAssigneeSelect(item);
                  onPanelToggle("assignee");
                }}
              />
            ) : null
          }
          panelRef={panel === "assignee" ? panelRef : undefined}
        >
          <UserRound />
        </IconControl>
        <IconControl
          active={panel === "date"}
          label={dueDate ?? "Due date"}
          onClick={() => onPanelToggle("date")}
          popover={
            panel === "date" ? (
              <DatePopover
                selected={dueDate}
                onSelect={(item) => {
                  onDateSelect(item);
                  onPanelToggle("date");
                }}
              />
            ) : null
          }
          panelRef={panel === "date" ? panelRef : undefined}
        >
          <CalendarDays />
        </IconControl>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-3">
        <button
          type="button"
          aria-label="Create more"
          title="Create more"
          className="flex h-8 items-center gap-2 px-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          onClick={() => onCreateMoreChange(!createMore)}
        >
          <span
            className={cn(
              "relative h-5 w-9 shrink-0 rounded-full bg-[#151518] ring-1 ring-white/[0.08] transition-colors duration-200",
              createMore && "bg-foreground ring-transparent",
            )}
          >
            <span
              className={cn(
                "absolute left-1 top-1 size-3 rounded-full bg-muted-foreground transition-transform duration-200",
                createMore && "translate-x-4 bg-background",
              )}
            />
          </span>
          <span className="hidden sm:inline">Create more</span>
        </button>
        <Button
          type="button"
          className="h-8 rounded-lg border border-foreground bg-foreground px-3.5 text-xs font-semibold text-background hover:bg-foreground/80"
          disabled={submitting}
          onClick={onSubmit}
        >
          {submitting ? "Saving..." : "Submit Post"}
        </Button>
      </div>
    </footer>
  );
}
