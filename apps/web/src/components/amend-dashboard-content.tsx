import { getDashboardDetailView } from "@/components/amend-dashboard-detail-router";
import { AmendDashboardMainWorkspace } from "@/components/amend-dashboard-main-workspace";
import type { DashboardContentProps } from "@/components/amend-dashboard-content-types";

export function AmendDashboardContent(props: DashboardContentProps) {
  const detailView = getDashboardDetailView(props);

  if (detailView) {
    return <div className="flex min-h-0 flex-1 flex-col lg:overflow-y-auto">{detailView}</div>;
  }

  return <AmendDashboardMainWorkspace {...props} />;
}
