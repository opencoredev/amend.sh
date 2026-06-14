import type { Post, RoadmapStatus } from "@/components/amend-dashboard-types";
import { statusMeta } from "@/components/amend-dashboard-status";
import { ToolbarBar, ToolbarGroup, ToolbarPill } from "@/components/dashboard-toolbar";

export function FeedbackToolbar({
  activeStatus,
  feedbackPosts,
  onStatusChange,
}: {
  activeStatus: RoadmapStatus | "all";
  feedbackPosts: Post[];
  onStatusChange: (status: RoadmapStatus | "all") => void;
}) {
  return (
    <ToolbarBar>
      <ToolbarGroup>
        <ToolbarPill
          active={activeStatus === "all"}
          count={feedbackPosts.length}
          onClick={() => onStatusChange("all")}
        >
          All
        </ToolbarPill>
        {Object.entries(statusMeta).map(([status, meta]) => (
          <ToolbarPill
            key={status}
            active={activeStatus === status}
            count={feedbackPosts.filter((post) => post.status === status).length}
            onClick={() => onStatusChange(status as RoadmapStatus)}
          >
            {meta.label}
          </ToolbarPill>
        ))}
      </ToolbarGroup>
    </ToolbarBar>
  );
}
