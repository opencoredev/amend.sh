import type { RoadmapStatus, RoadmapView, RoadmapViewId } from "@/components/amend-dashboard-types";
import { statusMeta } from "@/components/amend-dashboard-status";
import { roadmapStatusToRoadmapStatus } from "@/components/amend-dashboard-status-utils";
import {
  ToolbarBar,
  ToolbarDivider,
  ToolbarGroup,
  ToolbarPill,
} from "@/components/dashboard-toolbar";

export function RoadmapToolbar({
  activeRoadmap,
  activeStatus,
  onRoadmapChange,
  onStatusChange,
  roadmapViews,
}: {
  activeRoadmap: RoadmapView;
  activeStatus: RoadmapStatus | "all";
  onRoadmapChange: (roadmap: RoadmapViewId) => void;
  onStatusChange: (status: RoadmapStatus | "all") => void;
  roadmapViews: RoadmapView[];
}) {
  const columnCount = (status: RoadmapStatus) =>
    activeRoadmap.entries.filter((item) => roadmapStatusToRoadmapStatus(item.status) === status)
      .length;

  return (
    <ToolbarBar>
      {roadmapViews.length > 1 ? (
        <>
          <ToolbarGroup>
            {roadmapViews.map((roadmap) => (
              <ToolbarPill
                key={roadmap.id}
                active={activeRoadmap.id === roadmap.id}
                count={roadmap.entries.length}
                onClick={() => onRoadmapChange(roadmap.id)}
              >
                {roadmap.name}
              </ToolbarPill>
            ))}
          </ToolbarGroup>
          <ToolbarDivider />
        </>
      ) : null}

      <ToolbarGroup>
        <ToolbarPill
          active={activeStatus === "all"}
          count={activeRoadmap.entries.length}
          onClick={() => onStatusChange("all")}
        >
          All
        </ToolbarPill>
        {Object.entries(statusMeta).map(([status, meta]) => (
          <ToolbarPill
            key={status}
            active={activeStatus === status}
            count={columnCount(status as RoadmapStatus)}
            onClick={() => onStatusChange(status as RoadmapStatus)}
          >
            {meta.label}
          </ToolbarPill>
        ))}
      </ToolbarGroup>
    </ToolbarBar>
  );
}
