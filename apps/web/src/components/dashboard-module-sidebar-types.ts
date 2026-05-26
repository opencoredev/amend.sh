import type {
  ChangelogStatusFilter,
  DashboardChangelog,
  DashboardView,
  Post,
  RoadmapStatus,
  RoadmapView,
  RoadmapViewId,
  SettingsSection,
} from "@/components/amend-dashboard-types";

export type ModuleSidebarProps = {
  activeChangelogCategory: string;
  activeChangelogStatus: ChangelogStatusFilter;
  activeRoadmap: RoadmapView;
  activeSettingsSection: SettingsSection;
  activeStatus: RoadmapStatus | "all";
  activeView: DashboardView;
  changelogEntries: DashboardChangelog[];
  feedbackPosts: Post[];
  onChangelogCategoryChange: (category: string) => void;
  onChangelogStatusChange: (status: ChangelogStatusFilter) => void;
  onRoadmapChange: (roadmap: RoadmapViewId) => void;
  onSettingsSectionChange: (section: SettingsSection) => void;
  onStatusChange: (status: RoadmapStatus | "all") => void;
  onViewChange: (view: DashboardView) => void;
  roadmapViews: RoadmapView[];
};
