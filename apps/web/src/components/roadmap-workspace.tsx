import { cn } from "@amend/ui/lib/utils";
import { useState } from "react";

import { statusMeta } from "@/components/amend-dashboard-status";
import type { DashboardRoadmap, RoadmapStatus } from "@/components/amend-dashboard-types";
import { roadmapStatusToRoadmapStatus } from "@/components/amend-dashboard-utils";
import { DashboardWorkspaceSurface } from "@/components/dashboard-workspace-surface";
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
  const [draggingKey, setDraggingKey] = useState("");
  const [dropStatus, setDropStatus] = useState<RoadmapStatus | null>(null);
  const visibleStatuses =
    activeStatus === "all"
      ? (Object.keys(statusMeta) as RoadmapStatus[])
      : ([activeStatus] as RoadmapStatus[]);

  return (
    <DashboardWorkspaceSurface className="h-[calc(100svh-6.5rem)]" contentClassName="flex min-h-0 overflow-hidden">
      <div
        className={cn(
          "flex min-h-0 flex-1 gap-3 p-3",
          activeStatus !== "all" && "flex-col",
        )}
      >
        {visibleStatuses.map((columnStatus) => {
          const cards = entries.filter(
            (entry) => roadmapStatusToRoadmapStatus(entry.status) === columnStatus,
          );
          const isDropTarget = dropStatus === columnStatus;
          return (
            <div
              key={columnStatus}
              className={cn(
                "min-w-0 flex-1",
                activeStatus === "all" && "min-w-[160px]",
              )}
            >
              <RoadmapColumn
                cards={cards}
                columnStatus={columnStatus}
                draggingKey={draggingKey}
                isDropTarget={isDropTarget}
                onAdd={onAdd}
                onDragEnd={() => {
                  setDraggingKey("");
                  setDropStatus(null);
                }}
                onDragStart={(itemKey, event) => {
                  setDraggingKey(itemKey);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", itemKey);
                }}
                onDropItem={(stableKey, status) => {
                  setDraggingKey("");
                  const item = entries.find((entry) => entry.stableKey === stableKey);
                  if (!item || roadmapStatusToRoadmapStatus(item.status) === status) return;
                  onMove(item, status);
                }}
                onDropStatusChange={setDropStatus}
                onOpenItem={onOpenItem}
                onVote={onVote}
              />
            </div>
          );
        })}
      </div>
    </DashboardWorkspaceSurface>
  );
}
