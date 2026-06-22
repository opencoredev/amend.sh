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
  RoadmapViewId,
  SettingsSection,
  Workspace,
} from "@/components/amend-dashboard-types";

export type ChangelogSavePayload = {
  body: string;
  category: string;
  coverImageStorageId?: string | null;
  metaDescription?: string;
  stableKey?: string;
  status: string;
  summary: string;
  tags: string[];
  title: string;
  version?: string;
};

/** Content payload plus the publish intent, sent when committing from the review surface. */
export type ChangelogPublishPayload = ChangelogSavePayload & {
  mode: "now" | "schedule";
  scheduledFor?: number;
  notifySubscribers?: boolean;
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
  feedbackPosts: Post[];
  scopedChangelogEntries: DashboardChangelog[];
  scopedPosts: Post[];
  scopedRoadmapEntries: DashboardRoadmap[];
  searchQuery: string;
  requiresProjectSetup: boolean;
  selectedChangelog: DashboardChangelog | null;
  selectedChangelogKey: string | null;
  selectedFeedback: Post | null;
  selectedRoadmap: DashboardRoadmap | null;
  workspace: Workspace;
  onAddFeedbackNote: (note: string) => Promise<void>;
  onAddRoadmapNote: (item: DashboardRoadmap, note: string) => Promise<void>;
  onAddRoadmap: (status: RoadmapStatus) => void;
  onBackFromChangelog: () => void;
  onBackFromFeedback: () => void;
  onBackFromRoadmap: () => void;
  onChangelogAutoSave: (payload: ChangelogSavePayload) => Promise<string | null>;
  onChangelogCategoryChange: (category: string) => void;
  onChangelogPublish: (payload: ChangelogPublishPayload) => Promise<void>;
  onChangelogSave: (payload: ChangelogSavePayload) => Promise<void>;
  onChangelogStatusChange: (status: ChangelogStatusFilter) => void;
  onCreate: () => void;
  onMoveRoadmapItem: (item: DashboardRoadmap, status: RoadmapStatus) => void;
  onNewChangelog: () => void;
  onOpenChangelog: (entry: DashboardChangelog) => void;
  onOpenFeedback: (post: Post) => void;
  onOpenFeedbackKey: (stableKey: string) => void;
  onOpenRoadmapItem: (item: DashboardRoadmap) => void;
  onOpenSettingsSection: (section: SettingsSection) => void;
  onOpenSetup: () => void;
  onProjectCreated: (projectSlug: string, workspaceSlug?: string) => void;
  onRoadmapChange: (roadmap: RoadmapViewId) => void;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: RoadmapStatus | "all") => void;
  roadmapViews: RoadmapView[];
  onVoteFeedbackPost: (post: Post) => Promise<unknown>;
  onVoteRoadmapItem: (item: DashboardRoadmap) => Promise<unknown>;
  onVoteSelectedRoadmap: (item: DashboardRoadmap) => Promise<unknown>;
};
