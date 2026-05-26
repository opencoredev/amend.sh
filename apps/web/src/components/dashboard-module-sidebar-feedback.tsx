import { CircleDashed, MessageSquareText } from "lucide-react";

import type { RoadmapStatus } from "@/components/amend-dashboard-types";
import { statusMeta } from "@/components/amend-dashboard-status";
import {
  SidebarFrame,
  SidebarItem,
  SidebarSection,
  SidebarTitle,
} from "@/components/dashboard-module-sidebar-primitives";
import type { ModuleSidebarProps } from "@/components/dashboard-module-sidebar-types";

export function FeedbackModuleSidebar({
  activeStatus,
  feedbackPosts,
  onStatusChange,
}: Pick<ModuleSidebarProps, "activeStatus" | "feedbackPosts" | "onStatusChange">) {
  return (
    <SidebarFrame>
      <SidebarTitle title="Feedback" />
      <SidebarSection title="Statuses">
        <SidebarItem
          active={activeStatus === "all"}
          icon={<CircleDashed />}
          label="All feedback"
          value={String(feedbackPosts.length)}
          onClick={() => onStatusChange("all")}
        />
        {Object.entries(statusMeta).map(([status, meta]) => (
          <SidebarItem
            key={status}
            active={activeStatus === status}
            icon={meta.icon}
            label={meta.label}
            value={String(feedbackPosts.filter((post) => post.status === status).length)}
            onClick={() => onStatusChange(status as RoadmapStatus)}
          />
        ))}
      </SidebarSection>
      <SidebarSection title="Board">
        <SidebarItem
          active
          icon={<MessageSquareText />}
          label="Feedback"
          value={String(feedbackPosts.length)}
          onClick={() => onStatusChange("all")}
        />
      </SidebarSection>
    </SidebarFrame>
  );
}
