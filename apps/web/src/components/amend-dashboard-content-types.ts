import type {
  Board,
  ChangelogStatusFilter,
  DashboardChangelog,
  DashboardOverview,
  DashboardRoadmap,
  DashboardView,
  Post,
  ProjectMenuItem,
  RoadmapStatus,
  RoadmapView,
  SettingsSection,
  Workspace,
} from "@/components/amend-dashboard-types";

export type ChangelogSavePayload = {
  body: string;
  category: string;
  stableKey: string;
  status: string;
  summary: string;
  tags: string[];
  title: string;
  version?: string;
};

export type DashboardContentProps = {
  activeBoard: Board;
  activeChangelogCategory: string;
  activeChangelogStatus: ChangelogStatusFilter;
  activeProject: ProjectMenuItem;
  activeProjectNeedsSource: boolean;
  activeRoadmap: RoadmapView;
  activeSettingsSection: SettingsSection;
  activeStatus: RoadmapStatus | "all";
  activeView: DashboardView;
  changelogEntries: DashboardChangelog[];
  dashboard?: DashboardOverview;
  scopedChangelogEntries: DashboardChangelog[];
  scopedPosts: Post[];
  scopedRoadmapEntries: DashboardRoadmap[];
  searchQuery: string;
  requiresProjectSetup: boolean;
  selectedChangelog: DashboardChangelog | null;
  selectedFeedback: Post | null;
  selectedRoadmap: DashboardRoadmap | null;
  workspace: Workspace;
  onAddFeedbackNote: (note: string) => Promise<void>;
  onAddRoadmap: (status: RoadmapStatus) => void;
  onBackFromChangelog: () => void;
  onBackFromFeedback: () => void;
  onBackFromRoadmap: () => void;
  onChangelogCategoryChange: (category: string) => void;
  onChangelogSave: (payload: ChangelogSavePayload) => Promise<void>;
  onChangelogStatusChange: (status: ChangelogStatusFilter) => void;
  onConfigureAutomation: () => void;
  onCreate: () => void;
  onMoveRoadmapItem: (item: DashboardRoadmap, status: RoadmapStatus) => void;
  onOpenChangelog: (entry: DashboardChangelog) => void;
  onOpenFeedback: (post: Post) => void;
  onOpenFeedbackKey: (stableKey: string) => void;
  onOpenProactivation: () => void;
  onOpenRoadmapItem: (item: DashboardRoadmap) => void;
  onOpenSetup: () => void;
  onProjectCreated: (projectSlug: string, workspaceSlug?: string) => void;
  onSearchChange: (query: string) => void;
  onSettingsSectionChange: (section: SettingsSection) => void;
  onStatusChange: (status: RoadmapStatus | "all") => void;
  onVoteRoadmapItem: (item: DashboardRoadmap) => Promise<unknown>;
  onVoteSelectedRoadmap: (item: DashboardRoadmap) => Promise<unknown>;
};
