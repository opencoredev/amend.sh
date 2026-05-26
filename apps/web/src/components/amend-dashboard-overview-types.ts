import type {
  DashboardAgentActivity,
  DashboardAgentRun,
  DashboardAutomationDecision,
  DashboardBuildBrief,
  DashboardChannel,
  DashboardNotification,
  DashboardSourceEvent,
} from "@/components/amend-dashboard-agent-record-types";
import type {
  DashboardChangelog,
  DashboardFeedback,
  DashboardReview,
  DashboardRoadmap,
} from "@/components/amend-dashboard-content-record-types";
import type { PortalSettings } from "@/components/amend-dashboard-core-types";

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
