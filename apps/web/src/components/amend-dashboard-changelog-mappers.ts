import { formatState, stateValue } from "@/components/amend-dashboard-format";
import type { DashboardChangelog } from "@/components/amend-dashboard-types";

export function changelogCategories(entries: DashboardChangelog[]) {
  const counts = entries.reduce<Record<string, number>>((acc, entry) => {
    const label = formatState(entry.category);
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  const result = Object.entries(counts).map(([label, value]) => ({ label, value }));
  return result.length > 0 ? result : [{ label: "No categories yet", value: 0 }];
}

export function changelogCategoryFilters(entries: DashboardChangelog[]) {
  return changelogCategories(entries)
    .filter((category) => category.value > 0)
    .map((category) => stateValue(category.label));
}
