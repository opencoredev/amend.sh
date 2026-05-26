import { getDashboardDetailView } from "@/components/amend-dashboard-detail-router";
import { AmendDashboardMainWorkspace } from "@/components/amend-dashboard-main-workspace";
import type { DashboardContentProps } from "@/components/amend-dashboard-content-types";

export function AmendDashboardContent(props: DashboardContentProps) {
  const detailView = getDashboardDetailView(props);

  return detailView ?? <AmendDashboardMainWorkspace {...props} />;
}
