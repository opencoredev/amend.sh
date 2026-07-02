import type { Id } from "@amend/backend/convex/_generated/dataModel";
import type { ReactElement } from "react";

export type RoadmapStatus = "backlog" | "next" | "progress" | "done";
export type ChangelogStatusFilter = "all" | "draft" | "in_review" | "scheduled" | "published";
export type DashboardView =
  | "inbox"
  | "posts"
  | "roadmap"
  | "changelog"
  | "insights"
  | "memory"
  | "connections"
  | "settings"
  | "account"
  | "setup";
export type SettingsSection =
  | "accounts"
  | "automation"
  | "general"
  | "portal"
  | "services"
  | "tags";
export type BoardId = "feature" | "bug" | "changelog" | "feedback";
export type WorkspaceId = string;
export type RoadmapViewId = string;

export type PortalSettings = {
  accentColor?: string;
  changelogVisibility: "private" | "public";
  customThemeCss?: string;
  feedbackMode: "authenticated" | "closed" | "open";
  headline?: string;
  intro?: string;
  roadmapVisibility: "private" | "public";
  themeAppearance?: "dark" | "light";
  themePreset?: string;
};

export type Workspace = {
  description?: string;
  id: WorkspaceId;
  initials: string;
  name: string;
  plan: string;
  portalSettings?: PortalSettings;
  repo: string;
  portal: string;
  visibility?: "private" | "public";
};

export type ProjectMenuItem = {
  description?: string;
  id: string;
  initials: string;
  logoUrl?: string;
  name: string;
  plan: string;
  portal: string;
  repo: string;
  sourceReady: boolean;
  websiteUrl?: string;
};

export type Board = {
  id: BoardId;
  name: string;
  description: string;
  icon: ReactElement;
};

export type SourceLink = {
  externalId?: string;
  kind?: string;
  number?: number;
  provider?: string;
  title?: string;
  url?: string;
};

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
  hasVoted: boolean;
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
  viewerHasVoted?: boolean;
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
  viewerHasVoted?: boolean;
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
  coverImageStorageId?: Id<"_storage"> | null;
  coverImageUrl?: string | null;
  metaDescription?: string | null;
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

export type DashboardBuildBrief = {
  acceptanceCriteria: string[];
  createdAt: number;
  createdBy?: string;
  evidenceSummary: string;
  priority: string;
  recommendedScope: string;
  recordId: string | null;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  suggestedFiles: string[];
  title: string;
  updatedAt: number;
};

export type DashboardAgentRun = {
  completedAt: number;
  decisionCount: number;
  provider: string;
  providerConfigured: boolean;
  recordId: string | null;
  reviewCount: number;
  stableKey: string;
  status: string;
};

export type DashboardAutomationDecision = {
  action: string;
  confidence: number;
  needsReview: boolean;
  outcome: string;
  recordId: string | null;
  sourceLinks: SourceLink[];
  stableKey: string;
  summary: string;
  targetKey: string;
  targetKind: string;
  updatedAt: number;
};

export type DashboardSourceEvent = {
  author?: string;
  externalId: string;
  kind: string;
  labels: string[];
  number?: number;
  observedAt: number;
  owner?: string;
  provider: string;
  recordId: string | null;
  repo?: string;
  state?: string;
  title: string;
  url: string;
};

export type DashboardChannel = {
  detail: string;
  health: string;
  id: string;
  kind: "context" | "input";
  label: string;
  lastEventAt?: number;
  provider: string;
  signalCount: number;
  state: string;
};

export type DashboardAgentActivity = {
  confidence?: number;
  id: string;
  kind: "decision" | "notification" | "review" | "run" | "source_event";
  needsReview?: boolean;
  sourceLinks: SourceLink[];
  state: string;
  summary: string;
  timestamp: number;
  title: string;
};

export type DashboardNotification = {
  body: string;
  channel: string;
  priority: string;
  recordId: string | null;
  relatedKey: string;
  sourceLinks: SourceLink[];
  stableKey: string;
  status: string;
  title: string;
};

export type DashboardOverview = {
  agentActivity: DashboardAgentActivity[];
  agentRuns: DashboardAgentRun[];
  analytics?: {
    recentEvents: Array<{
      accountId?: string;
      createdAt: number;
      event: string;
      externalUserId?: string;
      source: string;
      updateKey?: string;
    }>;
    topEvents: Array<{
      count: number;
      event: string;
    }>;
    topCategories: Array<{
      category: string;
      count: number;
    }>;
    totalEvents: number;
    uniqueAccounts: number;
    uniqueUsers: number;
  };
  automationDecisions: DashboardAutomationDecision[];
  buildBriefs: DashboardBuildBrief[];
  channels: DashboardChannel[];
  feedback: DashboardFeedback[];
  github?: {
    owner?: string;
    repo?: string;
    repositoryUrl?: string;
  };
  notifications: DashboardNotification[];
  recentChangelog: DashboardChangelog[];
  reviewQueue: DashboardReview[];
  roadmap: DashboardRoadmap[];
  sourceEvents: DashboardSourceEvent[];
  workspace?: {
    description?: string;
    name?: string;
    portalSettings?: PortalSettings;
    recordId?: string | null;
    slug?: string;
    visibility?: "private" | "public";
  };
};

export type DashboardProject = {
  description?: string;
  logoUrl?: string;
  name: string;
  recordId: string | null;
  repositories?: Array<{
    owner?: string;
    repo?: string;
    repositoryUrl?: string;
  }>;
  slug: string;
  sourceMode?: "feedback" | "github";
  updatedAt?: number;
  websiteUrl?: string;
};

export type WorkspaceSettingsData = {
  automationRules?: {
    autoDraftChangelog: boolean;
    autoNotifyUsers: boolean;
    autoPublishChangelog: boolean;
    autoUpdateFeedbackStatus: boolean;
    autoUpdateRoadmapStatus: boolean;
    byokConfigured: boolean;
    byokProvider?: string;
    mode: "manual" | "mostly_auto" | "review_first";
    recordId: string | null;
    requireReviewBelowConfidence: number;
    requireReviewForHighImpact: boolean;
    requireReviewForPublicCopy: boolean;
    updatedAt: number;
  };
  customDomains: Array<{
    domain: string;
    purpose: string;
    recordId: string | null;
    status: string;
    updatedAt: number;
  }>;
  integrations: Array<{
    direction: string;
    displayName: string;
    provider: string;
    recordId: string | null;
    state: string;
    updatedAt: number;
  }>;
  members: Array<{
    email: string;
    name?: string;
    permissions: string[];
    recordId: string | null;
    role: "admin" | "member" | "owner" | "reviewer" | "viewer";
    updatedAt: number;
  }>;
  notificationPreferences: Array<unknown>;
  projects: DashboardProject[];
  rateLimits?: {
    projectWebsiteLookup?: {
      capacity: number;
      period: string;
      rate: number;
    };
  };
};

export type ProjectSuggestion = {
  description?: string;
  logoUrl?: string;
  name: string;
  slug: string;
  websiteUrl: string;
};

export type WebsiteLookupStatus = "idle" | "checking" | "valid" | "invalid";

export type CreatedProject = {
  slug: string;
  workspaceSlug?: string;
};

export type RepositoryDraft = {
  owner: string;
  repo: string;
  repositoryUrl: string;
};

export type GitHubInstalledRepository = {
  defaultBranch?: string;
  description?: string;
  fullName: string;
  htmlUrl: string;
  id: number;
  owner: string;
  private: boolean;
  repo: string;
  updatedAt?: string;
};

export type GitHubInstallationAccount = {
  avatarUrl?: string;
  id: number;
  login: string;
  repositories: GitHubInstalledRepository[];
  type: string;
};

export type GitHubInstallationDirectory = {
  accounts: GitHubInstallationAccount[];
  configured: boolean;
  error?: string;
  installUrl?: string;
  missing?: string[];
  workspaceSlug?: string;
};

export type DashboardMutationScope = {
  projectSlug?: string;
  workspaceSlug?: string;
};
