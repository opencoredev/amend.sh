import { CircleDashed, ClipboardList } from "lucide-react";

import type { RoadmapStatus } from "@/components/amend-dashboard-types";
import { statusMeta } from "@/components/amend-dashboard-status";
import { roadmapStatusToRoadmapStatus } from "@/components/amend-dashboard-utils";
import {
  SidebarFrame,
  SidebarItem,
  SidebarSection,
  SidebarTitle,
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
      <SidebarTitle title="Roadmap" />
      <SidebarSection title="Roadmaps">
        {roadmapViews.map((roadmap) => (
          <SidebarItem
            key={roadmap.id}
            active={activeRoadmap.id === roadmap.id}
            icon={<ClipboardList />}
            label={roadmap.name}
            value={String(roadmap.entries.length)}
            onClick={() => onRoadmapChange(roadmap.id)}
          />
        ))}
      </SidebarSection>
      <SidebarSection title="Columns">
        <SidebarItem
          active={activeStatus === "all"}
          icon={<CircleDashed />}
          label="All columns"
          value={String(activeRoadmap.entries.length)}
          onClick={() => onStatusChange("all")}
        />
        {Object.entries(statusMeta).map(([status, meta]) => (
          <SidebarItem
            key={status}
            active={activeStatus === status}
            icon={meta.icon}
            label={meta.label}
            value={String(
              activeRoadmap.entries.filter(
                (item) => roadmapStatusToRoadmapStatus(item.status) === status,
              ).length,
            )}
            onClick={() => onStatusChange(status as RoadmapStatus)}
          />
        ))}
      </SidebarSection>
    </SidebarFrame>
  );
}
