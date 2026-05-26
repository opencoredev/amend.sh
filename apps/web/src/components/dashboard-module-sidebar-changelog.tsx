import { changelogCategories, stateValue } from "@/components/amend-dashboard-utils";
import {
  SidebarDivider,
  SidebarFrame,
  SidebarPill,
  SidebarPillGroup,
} from "@/components/dashboard-module-sidebar-primitives";
import type { ModuleSidebarProps } from "@/components/dashboard-module-sidebar-types";

export function ChangelogModuleSidebar({
  activeChangelogCategory,
  activeChangelogStatus,
  changelogEntries,
  onChangelogCategoryChange,
  onChangelogStatusChange,
}: Pick<
  ModuleSidebarProps,
  | "activeChangelogCategory"
  | "activeChangelogStatus"
  | "changelogEntries"
  | "onChangelogCategoryChange"
  | "onChangelogStatusChange"
>) {
  const publishedCount = changelogEntries.filter((e) => e.status === "published").length;
  const draftCount = changelogEntries.filter((e) => e.status === "draft").length;
  const reviewCount = changelogEntries.filter((e) => e.status === "in_review").length;
  const scheduledCount = changelogEntries.filter((e) => e.status === "scheduled").length;
  const categories = changelogCategories(changelogEntries);

  return (
    <SidebarFrame>
      <SidebarPillGroup>
        <SidebarPill
          active={activeChangelogStatus === "all"}
          count={changelogEntries.length}
          onClick={() => onChangelogStatusChange("all")}
        >
          All
        </SidebarPill>
        <SidebarPill
          active={activeChangelogStatus === "published"}
          count={publishedCount}
          onClick={() => onChangelogStatusChange("published")}
        >
          Published
        </SidebarPill>
        <SidebarPill
          active={activeChangelogStatus === "draft"}
          count={draftCount}
          onClick={() => onChangelogStatusChange("draft")}
        >
          Draft
        </SidebarPill>
        <SidebarPill
          active={activeChangelogStatus === "in_review"}
          count={reviewCount}
          onClick={() => onChangelogStatusChange("in_review")}
        >
          In review
        </SidebarPill>
        <SidebarPill
          active={activeChangelogStatus === "scheduled"}
          count={scheduledCount}
          onClick={() => onChangelogStatusChange("scheduled")}
        >
          Scheduled
        </SidebarPill>
      </SidebarPillGroup>
      {categories.length > 0 ? (
        <>
          <SidebarDivider />
          <SidebarPillGroup label="Categories">
            <SidebarPill
              active={activeChangelogCategory === "all"}
              count={changelogEntries.length}
              onClick={() => onChangelogCategoryChange("all")}
            >
              All
            </SidebarPill>
            {categories.map(({ label, value }) => (
              <SidebarPill
                key={label}
                active={activeChangelogCategory === stateValue(label)}
                count={value}
                onClick={() => onChangelogCategoryChange(stateValue(label))}
              >
                {label}
              </SidebarPill>
            ))}
          </SidebarPillGroup>
        </>
      ) : null}
    </SidebarFrame>
  );
}
