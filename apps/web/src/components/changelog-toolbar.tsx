import type { ChangelogStatusFilter, DashboardChangelog } from "@/components/amend-dashboard-types";
import { changelogCategories } from "@/components/amend-dashboard-data-mappers";
import { stateValue } from "@/components/amend-dashboard-format";
import {
  ToolbarBar,
  ToolbarDivider,
  ToolbarGroup,
  ToolbarPill,
} from "@/components/dashboard-toolbar";

const STATUSES: Array<[ChangelogStatusFilter, string]> = [
  ["all", "All"],
  ["published", "Published"],
  ["draft", "Draft"],
  ["in_review", "In review"],
  ["scheduled", "Scheduled"],
];

export function ChangelogToolbar({
  activeChangelogCategory,
  activeChangelogStatus,
  changelogEntries,
  onChangelogCategoryChange,
  onChangelogStatusChange,
}: {
  activeChangelogCategory: string;
  activeChangelogStatus: ChangelogStatusFilter;
  changelogEntries: DashboardChangelog[];
  onChangelogCategoryChange: (category: string) => void;
  onChangelogStatusChange: (status: ChangelogStatusFilter) => void;
}) {
  const statusCount = (status: ChangelogStatusFilter) =>
    status === "all"
      ? changelogEntries.length
      : changelogEntries.filter((entry) => entry.status === status).length;
  const categories = changelogCategories(changelogEntries);

  return (
    <ToolbarBar>
      <ToolbarGroup>
        {STATUSES.map(([status, label]) => (
          <ToolbarPill
            key={status}
            active={activeChangelogStatus === status}
            count={statusCount(status)}
            onClick={() => onChangelogStatusChange(status)}
          >
            {label}
          </ToolbarPill>
        ))}
      </ToolbarGroup>

      {categories.length > 0 ? (
        <>
          <ToolbarDivider />
          <ToolbarGroup>
            <ToolbarPill
              active={activeChangelogCategory === "all"}
              count={changelogEntries.length}
              onClick={() => onChangelogCategoryChange("all")}
            >
              All
            </ToolbarPill>
            {categories.map(({ label, value }) => (
              <ToolbarPill
                key={label}
                active={activeChangelogCategory === stateValue(label)}
                count={value}
                onClick={() => onChangelogCategoryChange(stateValue(label))}
              >
                {label}
              </ToolbarPill>
            ))}
          </ToolbarGroup>
        </>
      ) : null}
    </ToolbarBar>
  );
}
