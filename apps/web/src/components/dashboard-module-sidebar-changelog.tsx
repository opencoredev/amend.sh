import { BookOpen, CalendarClock, Circle, CircleDashed, Radio } from "lucide-react";

import { changelogCategories, stateValue } from "@/components/amend-dashboard-utils";
import {
  SidebarFrame,
  SidebarItem,
  SidebarSection,
  SidebarTitle,
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
  const allCount = changelogEntries.length;
  const publishedCount = changelogEntries.filter((entry) => entry.status === "published").length;
  const draftCount = changelogEntries.filter((entry) => entry.status === "draft").length;
  const reviewCount = changelogEntries.filter((entry) => entry.status === "in_review").length;
  const scheduledCount = changelogEntries.filter((entry) => entry.status === "scheduled").length;

  return (
    <SidebarFrame>
      <SidebarTitle title="Changelog" />
      <SidebarSection title="Status">
        <SidebarItem
          active={activeChangelogStatus === "all"}
          icon={<CircleDashed />}
          label="All changelogs"
          value={String(allCount)}
          onClick={() => onChangelogStatusChange("all")}
        />
        <SidebarItem
          active={activeChangelogStatus === "published"}
          icon={<Radio />}
          label="Published"
          value={String(publishedCount)}
          onClick={() => onChangelogStatusChange("published")}
        />
        <SidebarItem
          active={activeChangelogStatus === "draft"}
          icon={<BookOpen />}
          label="Draft"
          value={String(draftCount)}
          onClick={() => onChangelogStatusChange("draft")}
        />
        <SidebarItem
          active={activeChangelogStatus === "in_review"}
          icon={<Circle />}
          label="In review"
          value={String(reviewCount)}
          onClick={() => onChangelogStatusChange("in_review")}
        />
        <SidebarItem
          active={activeChangelogStatus === "scheduled"}
          icon={<CalendarClock />}
          label="Scheduled"
          value={String(scheduledCount)}
          onClick={() => onChangelogStatusChange("scheduled")}
        />
      </SidebarSection>
      <SidebarSection title="Categories">
        <SidebarItem
          active={activeChangelogCategory === "all"}
          icon={<CircleDashed />}
          label="All categories"
          value={String(changelogEntries.length)}
          onClick={() => onChangelogCategoryChange("all")}
        />
        {changelogCategories(changelogEntries).map(({ label, value }) => (
          <SidebarItem
            key={label}
            active={activeChangelogCategory === stateValue(label)}
            icon={<Circle />}
            label={label}
            value={String(value)}
            onClick={() => onChangelogCategoryChange(stateValue(label))}
          />
        ))}
      </SidebarSection>
    </SidebarFrame>
  );
}
