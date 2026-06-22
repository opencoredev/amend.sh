import { cn } from "@amend/ui/lib/utils";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { statusMeta } from "@/components/amend-dashboard-status";
import type { DashboardRoadmap, RoadmapStatus } from "@/components/amend-dashboard-types";
import { roadmapStatusToRoadmapStatus } from "@/components/amend-dashboard-utils";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";
import { RoadmapCardOverlay } from "@/components/roadmap-card";
import { RoadmapColumn } from "@/components/roadmap-column";

export function RoadmapWorkspace({
  activeStatus,
  entries,
  onAdd,
  onOpenItem,
  onMove,
  onVote,
}: {
  activeStatus: RoadmapStatus | "all";
  entries: DashboardRoadmap[];
  onAdd: (status: RoadmapStatus) => void;
  onOpenItem: (item: DashboardRoadmap) => void;
  onMove: (item: DashboardRoadmap, status: RoadmapStatus) => void;
  onVote: (item: DashboardRoadmap) => Promise<unknown>;
}) {
  const [activeItem, setActiveItem] = useState<DashboardRoadmap | null>(null);
  // The persisted move round-trips through Convex, so we hold the target column
  // locally to snap the card into place immediately and clear it once the real
  // data catches up. Without this the card stalls in its old column after drop.
  const [pendingMove, setPendingMove] = useState<Record<string, RoadmapStatus>>({});
  // A 5px threshold keeps a plain click free to open the card.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    setPendingMove((pending) => {
      const keys = Object.keys(pending);
      if (keys.length === 0) {
        return pending;
      }
      const next: Record<string, RoadmapStatus> = {};
      for (const key of keys) {
        const entry = entries.find((candidate) => candidate.stableKey === key);
        // Keep the optimistic status only while the server hasn't caught up.
        if (entry && roadmapStatusToRoadmapStatus(entry.status) !== pending[key]) {
          next[key] = pending[key];
        }
      }
      return keys.length === Object.keys(next).length ? pending : next;
    });
  }, [entries]);

  const statusOf = (entry: DashboardRoadmap) =>
    pendingMove[entry.stableKey] ?? roadmapStatusToRoadmapStatus(entry.status);

  const visibleStatuses =
    activeStatus === "all"
      ? (Object.keys(statusMeta) as RoadmapStatus[])
      : ([activeStatus] as RoadmapStatus[]);

  function handleDragStart(event: DragStartEvent) {
    setActiveItem((event.active.data.current?.item as DashboardRoadmap | undefined) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveItem(null);
    const { active, over } = event;
    if (!over) {
      return;
    }
    const item = active.data.current?.item as DashboardRoadmap | undefined;
    const fromStatus = active.data.current?.status as RoadmapStatus | undefined;
    const toStatus = over.id as RoadmapStatus;
    if (item && toStatus !== fromStatus) {
      setPendingMove((pending) => ({ ...pending, [item.stableKey]: toStatus }));
      onMove(item, toStatus);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveItem(null)}
    >
      <DashboardWorkspaceSurface
        className="h-[calc(100svh-6.5rem)]"
        contentClassName="flex min-h-0 overflow-hidden"
      >
        <div className={cn("flex min-h-0 flex-1 gap-3 p-3", activeStatus !== "all" && "flex-col")}>
          {visibleStatuses.map((columnStatus) => {
            const cards = entries.filter((entry) => statusOf(entry) === columnStatus);
            return (
              <div
                key={columnStatus}
                className={cn("min-w-0 flex-1", activeStatus === "all" && "min-w-[160px]")}
              >
                <RoadmapColumn
                  cards={cards}
                  columnStatus={columnStatus}
                  onAdd={onAdd}
                  onOpenItem={onOpenItem}
                  onVote={onVote}
                />
              </div>
            );
          })}
        </div>
      </DashboardWorkspaceSurface>

      {/* Portal past the transformed `.t-panel-slide` ancestor so the clone's
          fixed positioning tracks the cursor exactly. The card is placed
          optimistically on drop, so no reverse drop animation is needed. */}
      {typeof document === "undefined"
        ? null
        : createPortal(
            <DragOverlay dropAnimation={null}>
              {activeItem ? <RoadmapCardOverlay item={activeItem} /> : null}
            </DragOverlay>,
            document.body,
          )}
    </DndContext>
  );
}
