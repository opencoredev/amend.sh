import type { RoadmapStatus } from "@/components/amend-dashboard-types";
import { statusMeta } from "@/components/amend-dashboard-status";
import {
  SidebarFrame,
  SidebarPill,
  SidebarPillGroup,
} from "@/components/dashboard-module-sidebar-primitives";
import type { ModuleSidebarProps } from "@/components/dashboard-module-sidebar-types";

export function FeedbackModuleSidebar({
  activeStatus,
  feedbackPosts,
  onStatusChange,
}: Pick<ModuleSidebarProps, "activeStatus" | "feedbackPosts" | "onStatusChange">) {
  return (
    <SidebarFrame>
      <SidebarPillGroup>
        <SidebarPill
          active={activeStatus === "all"}
          count={feedbackPosts.length}
          onClick={() => onStatusChange("all")}
        >
          All
        </SidebarPill>
        {Object.entries(statusMeta).map(([status, meta]) => (
          <SidebarPill
            key={status}
            active={activeStatus === status}
            count={feedbackPosts.filter((post) => post.status === status).length}
            onClick={() => onStatusChange(status as RoadmapStatus)}
          >
            {meta.label}
          </SidebarPill>
        ))}
      </SidebarPillGroup>
    </SidebarFrame>
  );
}
