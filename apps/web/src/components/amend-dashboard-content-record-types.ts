import type {
  BoardId,
  RoadmapStatus,
  RoadmapViewId,
} from "@/components/amend-dashboard-core-types";
import type { SourceLink } from "@/components/amend-dashboard-record-shared-types";

export type Post = {
  authorName: string;
  body: string;
  id: string;
  title: string;
  boardId: BoardId;
  status: RoadmapStatus;
  source: string;
  labels: string[];
  linkedChangelogCount: number;
  linkedRoadmapCount: number;
  sourceLinks: SourceLink[];
  sourceRoadmapKey?: string;
  stableKey: string;
  updatedAt: number;
  voters: number;
  date: string;
};

export type DashboardFeedback = {
  authorName: string;
  body: string;
  labels: string[];
  linkedChangelogCount: number;
  linkedRoadmapCount: number;
  recordId: string | null;
  source: string;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  title: string;
  updatedAt: number;
  votes: number;
};

export type DashboardRoadmap = {
  changelogCount: number;
  description: string;
  feedbackCount: number;
  impact: string;
  priority: string;
  recordId: string | null;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  target?: string;
  title: string;
  updatedAt: number;
};

export type RoadmapView = {
  description: string;
  entries: DashboardRoadmap[];
  id: RoadmapViewId;
  name: string;
};

export type DashboardChangelog = {
  authorName: string;
  body: string;
  category: string;
  publishedAt?: number;
  recordId: string | null;
  scheduledFor?: number;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  summary: string;
  tags: string[];
  title: string;
  updatedAt: number;
  version?: string;
};

export type DashboardReview = {
  kind: string;
  recordId: string | null;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  summary: string;
  targetKey: string;
  title: string;
  updatedAt: number;
};
