import { ClipboardList } from "@/lib/icons";

import type { RoadmapStatus } from "@/components/amend-dashboard-types";
import { statusMeta } from "@/components/amend-dashboard-status";
import { roadmapStatusToRoadmapStatus } from "@/components/amend-dashboard-status-utils";
import {
  SidebarDivider,
  SidebarFrame,
  SidebarNavItem,
  SidebarNavList,
  SidebarPill,
  SidebarPillGroup,
} from "@/components/dashboard-module-sidebar-primitives";
import type { ModuleSidebarProps } from "@/components/dashboard-module-sidebar-types";

export function RoadmapModuleSidebar({
  activeRoadmap,
  activeStatus,
  onRoadmapChange,
  onStatusChange,
  roadmapViews,
}: Pick<
  ModuleSidebarProps,
  "activeRoadmap" | "activeStatus" | "onRoadmapChange" | "onStatusChange" | "roadmapViews"
>) {
  return (
    <SidebarFrame>
      <SidebarNavList>
        {roadmapViews.map((roadmap) => (
          <SidebarNavItem
            key={roadmap.id}
            active={activeRoadmap.id === roadmap.id}
            icon={<ClipboardList />}
            label={roadmap.name}
            count={roadmap.entries.length}
            onClick={() => onRoadmapChange(roadmap.id)}
          />
        ))}
      </SidebarNavList>
      <SidebarDivider />
      <SidebarPillGroup label="Columns">
        <SidebarPill
          active={activeStatus === "all"}
          count={activeRoadmap.entries.length}
          onClick={() => onStatusChange("all")}
        >
          All
        </SidebarPill>
        {Object.entries(statusMeta).map(([status, meta]) => (
          <SidebarPill
            key={status}
            active={activeStatus === status}
            count={
              activeRoadmap.entries.filter(
                (item) => roadmapStatusToRoadmapStatus(item.status) === status,
              ).length
            }
            onClick={() => onStatusChange(status as RoadmapStatus)}
          >
            {meta.label}
          </SidebarPill>
        ))}
      </SidebarPillGroup>
    </SidebarFrame>
  );
}
